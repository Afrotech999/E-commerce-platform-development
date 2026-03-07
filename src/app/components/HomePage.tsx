// src/app/components/HomePage.tsx
import { useState, useMemo, useEffect } from 'react';
import { ArrowRight, TrendingUp, SlidersHorizontal, Shield, Recycle } from 'lucide-react';
import { motion } from 'motion/react';

import { HeroCarousel } from './HeroCarousel';
import { ProductCard } from './ProductCard';
import { LoadingState } from './LoadingState';

import { heroSlides as heroSlidesMock } from '../../data/mockData';
import { useCategories, useProducts, useHero } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';

import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Separator } from './ui/separator';

interface HomePageProps {
  onNavigate: (page: string, productId?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { isAdmin } = useAuth();

  const { categories, loading: catLoading, error: catError } = useCategories();
  const { products, loading: prodLoading, error: prodError } = useProducts();
  const { slides: heroSlidesFromApi } = useHero();

  const loading = catLoading || prodLoading;
  const error = catError || prodError;

  const PRICE_MAX = useMemo(() => {
    const max = Math.max(0, ...products.map((p) => Number(p.price) || 0));
    return Math.max(3000, Math.ceil(max / 50) * 50);
  }, [products]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, PRICE_MAX]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products]);

  const trendingProducts = useMemo(() => products.filter((p) => p.trending), [products]);

  const usedProducts = useMemo(
    () => products.filter((p: any) => p.condition === 'used').slice(0, 6),
    [products]
  );

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== PRICE_MAX;

  useEffect(() => {
    // keep filter max in sync with data
    setPriceRange([0, PRICE_MAX]);
  }, [PRICE_MAX]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);

      const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand);

      const price = Number(product.price || 0);
      const priceMatch = price >= priceRange[0] && price <= priceRange[1];

      return categoryMatch && brandMatch && priceMatch;
    });

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return 0;
        });
        break;
    }

    return filtered;
  }, [products, selectedCategories, selectedBrands, priceRange, sortBy]);

  const onCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories((prev) => (checked ? [...prev, categoryId] : prev.filter((c) => c !== categoryId)));
  };

  const onBrandChange = (brand: string, checked: boolean) => {
    setSelectedBrands((prev) => (checked ? [...prev, brand] : prev.filter((b) => b !== brand)));
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, PRICE_MAX]);
  };

  const heroSlidesToShow =
    heroSlidesFromApi.length > 0
      ? heroSlidesFromApi.map((s) => ({
        image: s.image,
        title: s.title,
        subtitle: s.subtitle,
        cta: s.cta,
        link: s.link,
      }))
      : heroSlidesMock.map((s) => ({
        image: s.image,
        title: s.title,
        subtitle: s.subtitle,
        cta: s.cta,
        link: s.link,
      }));

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <section className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-800">Could not load products.</p>
            <p className="mt-1 text-sm text-red-600">Error: {error}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <HeroCarousel slides={heroSlidesToShow} onNavigate={onNavigate} />
      </section>

      {/* ✅ ORDER 1: Categories */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-gray-400">Browse</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('categories')}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 6).map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onNavigate('products', category.id)}
              className="group text-left"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-2 rounded-lg">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold text-sm group-hover:text-gray-600 transition-colors uppercase tracking-tight">
                {category.name}
              </h3>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ✅ ORDER 2: Browse Products */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-gray-400">Shop</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              Browse products
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">{filteredProducts.length} products</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name: A–Z</option>
            </select>

            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-9 text-sm gap-1.5">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1 bg-black text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] px-1">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[300px] overflow-y-auto pl-7 pr-6">
                <SheetHeader>
                  <SheetTitle className="text-sm">Filters</SheetTitle>
                </SheetHeader>

                <div className="mt-5 space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-xs uppercase text-gray-400">Categories</h4>
                    <div className="space-y-2">
                      {categories.map((c) => (
                        <label key={c.id} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                          <Checkbox
                            checked={selectedCategories.includes(c.id)}
                            onCheckedChange={(checked) => onCategoryChange(c.id, !!checked)}
                          />
                          {c.name} ({c.productCount})
                        </label>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3 text-xs uppercase text-gray-400">Brands</h4>
                    <div className="space-y-2">
                      {brands.map((b) => (
                        <label key={b} className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                          <Checkbox
                            checked={selectedBrands.includes(b)}
                            onCheckedChange={(checked) => onBrandChange(b, !!checked)}
                          />
                          {b}
                        </label>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3 text-xs uppercase text-gray-400">Price</h4>
                    <Slider
                      min={0}
                      max={PRICE_MAX}
                      step={10}
                      value={priceRange}
                      onValueChange={(v) => setPriceRange(v as [number, number])}
                      className="w-full"
                    />
                    <div className="flex gap-2 mt-4 text-xs font-mono">
                      <div className="flex-1 px-2 py-1 bg-gray-50 border rounded">{priceRange[0]} Br</div>
                      <div className="flex-1 px-2 py-1 bg-gray-50 border rounded text-right">{priceRange[1]} Br</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={clearFilters} className="flex-1">
                      Clear
                    </Button>
                    <Button onClick={() => setFiltersOpen(false)} className="flex-1">
                      Apply
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.slice(0, 10).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <ProductCard product={product} onNavigate={onNavigate} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ✅ ORDER 3: Trending */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-14 bg-gray-50/50 rounded-3xl mt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-gray-400">This week</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <TrendingUp className="h-4 w-4" />
              </span>
              Trending Now
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">Most popular products right now</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-sm font-medium text-gray-700 hover:text-black flex items-center gap-2 transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {trendingProducts.slice(0, 5).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} onNavigate={onNavigate} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Used Products (kept after trending) */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-14 bg-gray-50/20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Recycle className="h-5 w-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">Used Products</h2>
          </div>
          <button
            onClick={() => onNavigate('used')}
            className="text-sm font-medium text-black-700 flex items-center gap-1.5 bg-gray-100 px-4 py-2 rounded-full transition-colors"
          >
            Explore Used <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {usedProducts.length > 0 ? (
            usedProducts.slice(0, 5).map((product) => (
              <motion.div
                key={product.id + '-used'}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} onNavigate={onNavigate} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center">
              <Recycle className="h-8 w-8 text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No used items currently on sale</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
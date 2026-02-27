import { useState, useMemo } from 'react';
import { ArrowRight, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { HeroCarousel } from './HeroCarousel';
import { ProductCard } from './ProductCard';
import { heroSlides } from '../../data/mockData';
import { motion } from 'motion/react';
import { useCategories, useProducts, useHero } from '../../hooks/useApi';
import { LoadingState } from './LoadingState';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Separator } from './ui/separator';

const PRICE_MAX = 3000;

interface HomePageProps {
  onNavigate: (page: string, productId?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { categories, loading: catLoading, error: catError } = useCategories();
  const { products, loading: prodLoading, error: prodError } = useProducts();
  const { slides: heroSlidesFromApi } = useHero();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, PRICE_MAX]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products]);
  const trendingProducts = products.filter((p) => p.trending);
  const featuredProducts = products.filter((p) => p.featured);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const brandMatch =
        selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const priceMatch =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      return categoryMatch && brandMatch && priceMatch;
    });
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
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
    }
    return filtered;
  }, [products, selectedCategories, selectedBrands, priceRange, sortBy]);

  const onCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, categoryId] : prev.filter((c) => c !== categoryId)
    );
  };
  const onBrandChange = (brand: string, checked: boolean) => {
    setSelectedBrands((prev) =>
      checked ? [...prev, brand] : prev.filter((b) => b !== brand)
    );
  };
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, PRICE_MAX]);
  };
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== PRICE_MAX;

  const loading = catLoading || prodLoading;
  const error = catError || prodError;
  const heroSlidesToShow = heroSlidesFromApi.length > 0
    ? heroSlidesFromApi.map((s) => ({ image: s.image, title: s.title, subtitle: s.subtitle, cta: s.cta, link: s.link }))
    : heroSlides.map((s) => ({ image: s.image, title: s.title, subtitle: s.subtitle, cta: s.cta, link: s.link }));

  if (loading) return <LoadingState />;
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <section className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-800">Could not load products.</p>
            <p className="mt-1 text-sm text-red-600">Make sure the backend is running at http://localhost:3001</p>
            <p className="mt-2 text-xs text-gray-600">Error: {error}</p>
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

      {/* Categories Grid */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-gray-400">Browse</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              Shop by Category
            </h2>
            <p className="mt-1.5 text-sm text-gray-500 max-w-md">
              Explore our wide range of premium products
            </p>
          </div>
          <button
            onClick={() => onNavigate('categories')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group shrink-0"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 6).map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
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
              <h3 className="font-semibold text-sm mb-0.5 group-hover:text-gray-600 transition-colors">{category.name}</h3>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Browse products with filter */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-gray-400">Shop</span>

            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                Browse products
              </h2>

              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1 group"
              >
                View more
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <p className="mt-1.5 text-sm text-gray-500">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
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
                    <span className="ml-0.5 bg-black text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] px-1">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[300px] sm:w-[340px] overflow-y-auto pl-7 pr-6 py-6">
                <SheetHeader className="px-0">
                  <SheetTitle className="text-sm">Filters</SheetTitle>
                </SheetHeader>

                <div className="mt-5 space-y-5 px-0">
                  <div className="grid grid-cols-[1fr_1fr] gap-x-5">
                    <div>
                      <h4 className="font-semibold mb-3 text-xs">Categories</h4>
                      <div className="space-y-2.5">
                        {categories.map((category) => (
                          <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={selectedCategories.includes(category.id)}
                              onCheckedChange={(checked) =>
                                onCategoryChange(category.id, checked === true)
                              }
                            />
                            <span className="text-xs font-medium min-w-0 break-words">
                              {category.name} ({category.productCount})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-xs">Brands</h4>
                      <div className="space-y-2.5">
                        {brands.map((brand) => (
                          <label key={brand} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={selectedBrands.includes(brand)}
                              onCheckedChange={(checked) => onBrandChange(brand, checked === true)}
                            />
                            <span className="text-xs font-medium min-w-0 break-words">{brand}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3 text-xs">Price range</h4>
                    <div className="space-y-3">
                      <Slider
                        min={0}
                        max={PRICE_MAX}
                        step={50}
                        value={priceRange}
                        onValueChange={(v) => setPriceRange(v as [number, number])}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">Birr {priceRange[0]}</span>
                        <span className="font-medium">Birr {priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={clearFilters} className="flex-1 h-9 text-sm">
                      Clear
                    </Button>
                    <Button onClick={() => setFiltersOpen(false)} className="flex-1 h-9 text-sm">
                      Apply
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.slice(0, 6).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              <ProductCard product={product} onNavigate={onNavigate} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-gray-400">This week</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <TrendingUp className="h-4 w-4" />
              </span>
              Trending Now
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Most popular products right now
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors group"
          >
            View all products
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {trendingProducts.length > 0 ? trendingProducts.slice(0, 6).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <ProductCard product={product} onNavigate={onNavigate} />
            </motion.div>
          )) : (
            <p className="col-span-full text-center text-gray-500 py-8">No trending products right now.</p>
          )}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <span className="text-xs font-medium tracking-widest uppercase text-gray-400">Curated</span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                Featured
              </h2>
              <p className="mt-1.5 text-sm text-gray-500">Hand-picked favorites for you</p>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group shrink-0"
            >
              View all
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {featuredProducts.slice(0, 6).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <ProductCard product={product} onNavigate={onNavigate} />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useCategories, useProducts } from '../../hooks/useApi';
import { LoadingState } from './LoadingState';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Separator } from './ui/separator';

interface ProductsPageProps {
  categoryId?: string;
  onNavigate: (page: string, productId?: string) => void;
}

export function ProductsPage({ categoryId, onNavigate }: ProductsPageProps) {
  const isTrending = categoryId === 'trending';
  const isNew = categoryId === 'new';

  const effectiveCategoryId =
    categoryId && categoryId !== 'trending' && categoryId !== 'new'
      ? categoryId
      : undefined;

  const { categories, loading: catLoading, error: catError } = useCategories();
  const { products: allProducts } = useProducts(); // global range for max price/brands
  const { products, loading: prodLoading, error: prodError } = useProducts({
    categoryId: effectiveCategoryId,
    trending: isTrending ? true : undefined,
  });

  const PRICE_MAX = useMemo(() => {
    if (allProducts.length === 0) return 3000;
    const max = Math.max(0, ...allProducts.map((p) => Number(p.price) || 0));
    return Math.max(3000, Math.ceil(max / 50) * 50);
  }, [allProducts]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    effectiveCategoryId ? [effectiveCategoryId] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [hasChangedPrice, setHasChangedPrice] = useState(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreBrands, setShowMoreBrands] = useState(false);

  const loading = catLoading || prodLoading;
  const error = catError || prodError;

  // Sync category selection when the route prop changes
  useEffect(() => {
    setSelectedCategories(effectiveCategoryId ? [effectiveCategoryId] : []);
  }, [effectiveCategoryId]);

  // Sync price range once products are loaded
  useEffect(() => {
    if (PRICE_MAX > 0 && !hasChangedPrice) {
      setPriceRange([0, PRICE_MAX]);
    }
  }, [PRICE_MAX, hasChangedPrice]);

  const brands = useMemo(
    () => Array.from(new Set(allProducts.map((p) => p.brand))).sort(),
    [allProducts]
  );

  const sliderMin = 0;
  const sliderMax = PRICE_MAX || 3000;

  // Clamped value for the Slider to prevent Radix from breaking
  const sliderValue: [number, number] = [
    Math.max(sliderMin, Math.min(priceRange[0], sliderMax)),
    Math.max(sliderMin, Math.min(priceRange[1], sliderMax)),
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);
      const brandMatch =
        selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const price = Number((product as any).price ?? 0);
      const priceMatch = price >= priceRange[0] && price <= (priceRange[1] || sliderMax);
      return categoryMatch && brandMatch && priceMatch;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return Number((a as any).price ?? 0) - Number((b as any).price ?? 0);
        case 'price-high':
          return Number((b as any).price ?? 0) - Number((a as any).price ?? 0);
        case 'rating':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return 0;
      }
    });
  }, [products, selectedCategories, selectedBrands, priceRange, sortBy, sliderMax]);

  const onCategoryChange = (id: string, checked: boolean) => {
    setSelectedCategories((prev) => (checked ? [...prev, id] : prev.filter((c) => c !== id)));
  };

  const onBrandChange = (brand: string, checked: boolean) => {
    setSelectedBrands((prev) => (checked ? [...prev, brand] : prev.filter((b) => b !== brand)));
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, sliderMax]);
    setHasChangedPrice(false);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    priceRange[0] !== 0 ||
    (priceRange[1] !== 0 && priceRange[1] !== sliderMax);

  // Common Filter JSX Element (to be reused without remounting)
  const filterElements = (
    <div className="space-y-5">
      <div>
        <h4 className="font-semibold mb-3 text-xs">Categories</h4>
        <div className="space-y-2.5">
          {(showMoreCategories ? categories : categories.slice(0, 5)).map((category) => (
            <label key={category.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => onCategoryChange(category.id, Boolean(checked))}
              />
              <span className="text-xs font-medium">
                {category.name} ({category.productCount})
              </span>
            </label>
          ))}
          {categories.length > 5 && (
            <button
              onClick={() => setShowMoreCategories(!showMoreCategories)}
              className="text-xs text-black font-semibold mt-2 hover:underline text-left w-full"
            >
              {showMoreCategories ? 'See Less' : 'See More'}
            </button>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-3 text-xs">Brands</h4>
        <div className="space-y-2.5">
          {(showMoreBrands ? brands : brands.slice(0, 5)).map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => onBrandChange(brand, Boolean(checked))}
              />
              <span className="text-xs font-medium">{brand}</span>
            </label>
          ))}
          {brands.length > 5 && (
            <button
              onClick={() => setShowMoreBrands(!showMoreBrands)}
              className="text-xs text-black font-semibold mt-2 hover:underline text-left w-full"
            >
              {showMoreBrands ? 'See Less' : 'See More'}
            </button>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-3 text-xs">Price range</h4>
        <div className="space-y-4">
          <Slider
            min={sliderMin}
            max={sliderMax}
            step={Math.max(1, Math.round(sliderMax / 200))}
            value={sliderValue}
            onValueChange={(value) => {
              setPriceRange(value as [number, number]);
              setHasChangedPrice(true);
            }}
            className="w-full"
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">Br</span>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  setPriceRange([val, priceRange[1]]);
                  setHasChangedPrice(true);
                }}
                className="w-full pl-6 pr-2 py-1.5 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">Br</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => {
                  const val = Math.max(priceRange[0], parseInt(e.target.value) || 0);
                  setPriceRange([priceRange[0], val]);
                  setHasChangedPrice(true);
                }}
                className="w-full pl-6 pr-2 py-1.5 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={clearFilters} className="flex-1 h-9 text-sm">
          Clear
        </Button>
      </div>
    </div>
  );

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center max-w-md">
          <p className="font-medium text-red-800">Could not load products.</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-gray-400">Catalog</span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              {isTrending ? 'Trending' : isNew ? 'New Arrivals' : 'All Products'}
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-1.5 border text-xs focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name: A-Z</option>
            </select>

            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden flex-shrink-0 h-8 text-xs">
                  <SlidersHorizontal className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="ml-1.5 bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">!</span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[300px] px-6 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-sm">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 pl-0.5">
                  {filterElements}
                  <div className="mt-2 text-center">
                    <Button onClick={() => setFiltersOpen(false)} className="w-full h-9 text-sm">Apply</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-20 pl-1 pr-2">
              {filterElements}
            </div>
          </aside>

          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="mb-1.5 text-sm">No products found</h3>
                <p className="text-gray-600 mb-4 text-xs">Try adjusting your filters</p>
                <Button onClick={clearFilters} className="h-8 text-xs">Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useCategories } from '../../hooks/useApi';
import { useProducts } from '../../hooks/useApi';
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
  const { products, loading: prodLoading, error: prodError } = useProducts({
    categoryId: effectiveCategoryId,
    trending: isTrending ? true : undefined,
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    effectiveCategoryId ? [effectiveCategoryId] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const loading = catLoading || prodLoading;
  const error = catError || prodError;
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);
      const brandMatch =
        selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const priceMatch =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return categoryMatch && brandMatch && priceMatch;
    });

    // Sort
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
        // Featured - prioritize trending and featured products
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
    setPriceRange([0, 3000]);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 3000;

  const FilterContent = ({ onApply }: { onApply?: () => void }) => (
    <div className="space-y-5">
      {/* Categories */}
      <div>
        <h4 className="font-semibold mb-3 text-xs">Categories</h4>
        <div className="space-y-2.5">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => onCategoryChange(category.id, checked)}
              />
              <span className="text-xs font-medium">
                {category.name} ({category.productCount})
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brands */}
      <div>
        <h4 className="font-semibold mb-3 text-xs">Brands</h4>
        <div className="space-y-2.5">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => onBrandChange(brand, checked)}
              />
              <span className="text-xs font-medium">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="font-semibold mb-3 text-xs">Price Range</h4>
        <div className="space-y-3">
          <Slider
            min={0}
            max={3000}
            step={50}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Birr {priceRange[0]}</span>
            <span className="font-medium">Birr {priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={clearFilters} className="flex-1 h-9 text-sm">
          Clear
        </Button>
        {onApply && (
          <Button onClick={onApply} className="flex-1 h-9 text-sm">
            Apply
          </Button>
        )}
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
        {/* Header */}
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

            {/* Mobile Filter Button */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden flex-shrink-0 h-8 text-xs">
                  <SlidersHorizontal className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="ml-1.5 bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[300px] px-6">
                <SheetHeader>
                  <SheetTitle className="text-sm">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 pl-0.5">
                  <FilterContent onApply={() => setFiltersOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-20 pl-1 pr-2">
              <FilterContent />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="mb-1.5 text-sm">No products found</h3>
                <p className="text-gray-600 mb-4 text-xs">
                  Try adjusting your filters to see more results
                </p>
                <Button onClick={clearFilters} className="h-8 text-xs">Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
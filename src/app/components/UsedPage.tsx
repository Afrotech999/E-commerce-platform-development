// src/app/components/UsedPage.tsx
import { useState, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { useProducts } from '../../hooks/useApi';
import { motion } from 'motion/react';
import { Recycle, Award } from 'lucide-react';
import { LoadingState } from './LoadingState';

interface UsedPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export function UsedPage({ onNavigate }: UsedPageProps) {
  const { products, loading, error } = useProducts();
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating'>('price-low');

  const usedProducts = useMemo(() => {
    const filtered = products.filter((product: any) => product.condition === 'used');

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
      return (b.rating ?? 0) - (a.rating ?? 0);
    });

    return sorted;
  }, [products, sortBy]);

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
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Recycle className="h-12 w-12 sm:h-16 sm:w-16" />
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold">Used Products</h1>
            </div>

            <p className="text-lg sm:text-xl text-green-100 mb-4 max-w-2xl mx-auto">
              Quality preowned products at unbeatable prices.
            </p>
          </motion.div>

          {/* ✅ Center the "unbeatable prices" card */}
          <div className="mt-12 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <Award className="h-10 w-10 mx-auto mb-3" />
              <h3 className="font-semibold mb-0.5">unbeatable prices</h3>
              {/* optional small line */}
              {/* <p className="text-sm text-green-100">Best value for pre-owned items</p> */}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filters and Products */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Browse Used Products</h2>
            <p className="text-gray-500">{usedProducts.length} items available</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Sort Filter */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-2 py-2">
              <button
                onClick={() => setSortBy('price-low')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  sortBy === 'price-low'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Price: Low
              </button>

              <button
                onClick={() => setSortBy('price-high')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  sortBy === 'price-high'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Price: High
              </button>

              
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {usedProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {usedProducts.map((product, index) => (
              <motion.div
                key={product.id + '-used'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="relative"
              >
                <div className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  Used
                </div>
                <ProductCard product={product} onNavigate={onNavigate} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No used products match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
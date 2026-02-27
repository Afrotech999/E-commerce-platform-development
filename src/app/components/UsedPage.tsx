import { useState, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { useProducts } from '../../hooks/useApi';
import { motion } from 'motion/react';
import { Recycle, ShieldCheck, Award, Truck } from 'lucide-react';
import type { Product } from '../../types';
import { LoadingState } from './LoadingState';

interface UsedPageProps {
  onNavigate: (page: string, param?: string) => void;
}

const STABLE_DISCOUNT = 0.3; // 30% for "used" display

export function UsedPage({ onNavigate }: UsedPageProps) {
  const { products, loading, error } = useProducts();
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating'>('price-low');
  const [condition, setCondition] = useState<'all' | 'excellent' | 'good' | 'fair'>('all');

  const usedProducts = useMemo(() => {
    const used = products
      .filter(product => product.originalPrice)
      .slice(0, 24)
      .map((product, i) => {
        const usedDiscount = STABLE_DISCOUNT + (i % 15) / 100;
        const usedPrice = product.price * (1 - usedDiscount);
        const conditions: ('excellent' | 'good' | 'fair')[] = ['excellent', 'good', 'fair'];
        const cond = conditions[i % 3];
        return {
          ...product,
          price: usedPrice,
          condition: cond,
        } as Product & { condition: string };
      });

    // Apply condition filter
    let filtered = condition === 'all' 
      ? used 
      : used.filter(p => p.condition === condition);

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.price - b.price;
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      } else {
        return b.rating - a.rating;
      }
    });

    return sorted;
  }, [products, sortBy, condition]);

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
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold">
                Used & Certified
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-green-100 mb-4 max-w-2xl mx-auto">
              Quality pre-owned products at unbeatable prices. Certified, tested, and guaranteed.
            </p>
          </motion.div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <ShieldCheck className="h-10 w-10 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Quality Certified</h3>
              <p className="text-sm text-green-100">Thoroughly tested & verified</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <Award className="h-10 w-10 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">6-Month Warranty</h3>
              <p className="text-sm text-green-100">Full coverage included</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
            >
              <Truck className="h-10 w-10 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-sm text-green-100">On all used items</p>
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
            {/* Condition Filter */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-2 py-2">
              <button
                onClick={() => setCondition('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  condition === 'all'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCondition('excellent')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  condition === 'excellent'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Excellent
              </button>
              <button
                onClick={() => setCondition('good')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  condition === 'good'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Good
              </button>
              <button
                onClick={() => setCondition('fair')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  condition === 'fair'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Fair
              </button>
            </div>

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
              <button
                onClick={() => setSortBy('rating')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  sortBy === 'rating'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Top Rated
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
                {/* Condition Badge */}
                <div className="absolute top-3 left-3 z-10 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {product.condition?.toUpperCase()}
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

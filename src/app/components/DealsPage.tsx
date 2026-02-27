import { useState, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { useProducts } from '../../hooks/useApi';
import { motion } from 'motion/react';
import { Tag, TrendingDown } from 'lucide-react';
import { LoadingState } from './LoadingState';

interface DealsPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export function DealsPage({ onNavigate }: DealsPageProps) {
  const { products, loading, error } = useProducts();
  const [sortBy, setSortBy] = useState<'discount' | 'price-low' | 'price-high'>('discount');

  const dealsProducts = useMemo(() => {
    const filtered = products.filter(product => product.originalPrice);
    
    // Sort based on selection
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'discount') {
        const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
        const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
        return discountB - discountA;
      } else if (sortBy === 'price-low') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
    
    return sorted;
  }, [products, sortBy]);

  // Calculate average discount
  const averageDiscount = useMemo(() => {
    if (dealsProducts.length === 0) return 0;
    const totalDiscount = dealsProducts.reduce((sum, product) => {
      if (product.originalPrice) {
        return sum + ((product.originalPrice - product.price) / product.originalPrice) * 100;
      }
      return sum;
    }, 0);
    return Math.round(totalDiscount / dealsProducts.length);
  }, [dealsProducts]);

  if (loading) return <LoadingState />;
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center max-w-md">
          <p className="font-medium text-red-800">Could not load deals.</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Tag className="h-12 w-12 sm:h-16 sm:w-16" />
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold">
                Exclusive Deals
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
              Discover amazing discounts on premium products from all categories
            </p>
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold">{dealsProducts.length}</div>
                <div className="text-sm text-gray-400">Active Deals</div>
              </div>
              <div className="h-12 w-px bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold flex items-center gap-2">
                  <TrendingDown className="h-8 w-8 text-green-400" />
                  {averageDiscount}%
                </div>
                <div className="text-sm text-gray-400">Avg. Discount</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters and Products */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Sort Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">All Deals</h2>
            <p className="text-gray-500">Save big on top-rated products</p>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-2 py-2">
            <button
              onClick={() => setSortBy('discount')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                sortBy === 'discount'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Best Discount
            </button>
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

        {/* Products Grid */}
        {dealsProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {dealsProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <ProductCard product={product} onNavigate={onNavigate} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No deals available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
}

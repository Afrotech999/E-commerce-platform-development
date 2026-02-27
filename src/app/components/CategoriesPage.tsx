import { useCategories } from '../../hooks/useApi';
import { LoadingState } from './LoadingState';
import { motion } from 'motion/react';

interface CategoriesPageProps {
  onNavigate: (page: string, categoryId?: string) => void;
}

export function CategoriesPage({ onNavigate }: CategoriesPageProps) {
  const { categories, loading, error } = useCategories();
  if (loading) return <LoadingState />;
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center max-w-md">
          <p className="font-medium text-red-800">Could not load categories.</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-14">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-xs font-medium tracking-widest uppercase text-gray-400">Browse</span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
            Shop by Category
          </h2>
          <p className="mt-1.5 text-sm text-gray-500 max-w-xl mx-auto">
            Explore our curated collection of premium products across all categories.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12">No categories yet.</p>
          ) : categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              onClick={() => onNavigate('products', category.id)}
              className="group text-left"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 mb-2 rounded-lg">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-semibold mb-0.5 text-sm group-hover:text-gray-600 transition-colors">{category.name}</h3>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
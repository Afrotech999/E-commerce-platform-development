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

    const usedProducts = useMemo(() => {
        const filtered = products.filter(product => product.condition === 'used');

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'price-low') {
                return Number(a.price) - Number(b.price);
            } else if (sortBy === 'price-high') {
                return Number(b.price) - Number(a.price);
            } else {
                return (b.rating ?? 0) - (a.rating ?? 0);
            }
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
                        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-6 py-2.5">
                            <Recycle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Certified Used Collection</span>
                        </div>

                        {/* Sort Filter */}
                        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-2 py-2">
                            <button
                                onClick={() => setSortBy('price-low')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sortBy === 'price-low'
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Price: Low
                            </button>
                            <button
                                onClick={() => setSortBy('price-high')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sortBy === 'price-high'
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Price: High
                            </button>
                            <button
                                onClick={() => setSortBy('rating')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sortBy === 'rating'
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

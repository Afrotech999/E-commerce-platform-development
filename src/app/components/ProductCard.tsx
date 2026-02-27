import { Star } from 'lucide-react';
import { Product } from '../../types';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, productId: string) => void;
}

export function ProductCard({ product, onNavigate }: ProductCardProps) {

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const imageUrl = product.images?.[0] || 'https://placehold.co/400x400?text=Product';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer"
      onClick={() => onNavigate('product', product.id)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 mb-2">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 flex flex-wrap gap-1">
          {product.trending && (
            <Badge className="bg-black text-white text-[10px] h-4 px-1.5 font-medium">Trending</Badge>
          )}
          {discount > 0 && (
            <span className="inline-flex items-center h-4 px-1.5 rounded bg-red-600 text-white text-[10px] font-semibold leading-none">-{discount}%</span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs h-5 px-2">
              Only {product.stock} left
            </Badge>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="text-xs px-3 py-1">
              Out of Stock
            </Badge>
          </div>
        )}

      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <div className="flex items-start justify-between gap-1.5">
          <h3 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-gray-600 transition-colors leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs">{product.rating}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 line-clamp-1">{product.brand}</p>

        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm">Birr {product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              Birr {product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
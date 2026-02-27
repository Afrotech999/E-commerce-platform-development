import { useState, useEffect } from 'react';
import { Star, Phone, Heart, Share2, Check, Truck } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ProductCard } from './ProductCard';
import { motion } from 'motion/react';
import { useProduct } from '../../hooks/useApi';
import { fetchProducts } from '../../api/products';
import type { Product } from '../../types';
import { LoadingState } from './LoadingState';

interface ProductPageProps {
  productId: string;
  onNavigate: (page: string, productId?: string) => void;
}

export function ProductPage({ productId, onNavigate }: ProductPageProps) {
  const { product, loading, error } = useProduct(productId);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!product) return;
    fetchProducts({ categoryId: product.category })
      .then((list) => setRelatedProducts(list.filter((p) => p.id !== product.id).slice(0, 4)))
      .catch(() => setRelatedProducts([]));
  }, [product?.id, product?.category]);

  if (loading && !product) return <LoadingState />;
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="mb-4">Product Not Found</h2>
        <Button onClick={() => onNavigate('home')}>Back to Home</Button>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Normalize to array: support images[] or single image string from API
  const rawImages = product.images ?? [];
  const images: string[] = Array.isArray(rawImages)
    ? (rawImages.length ? rawImages : ['https://placehold.co/600x600?text=Product'])
    : [String(rawImages)];
  const mainImage = images[Math.min(selectedImage, images.length - 1)];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button onClick={() => onNavigate('home')} className="hover:text-black">
            Home
          </button>
          <span>/</span>
          <button onClick={() => onNavigate('products')} className="hover:text-black">
            Products
          </button>
          <span>/</span>
          <span className="text-black truncate">{product.name}</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images: main image + thumbnail strip for multiple images */}
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="aspect-square overflow-hidden bg-gray-100 rounded-lg"
            >
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Thumbnail strip: always show when we have images so multiple images are supported */}
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2 sm:gap-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === index
                      ? 'border-gray-900 ring-2 ring-gray-900/20'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} – image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">{product.brand}</Badge>
                {product.trending && <Badge className="text-xs">Trending</Badge>}
                {product.stock < 10 && product.stock > 0 && (
                  <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                )}
              </div>
              <h1 className="mb-2 text-xl sm:text-2xl font-semibold">{product.name}</h1>
              <div className="flex items-center gap-1 mb-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{product.rating}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold">Birr {product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    Birr {product.originalPrice.toFixed(2)}
                  </span>
                  <span className="inline-flex items-center h-5 px-2 rounded bg-red-600 text-white text-[11px] font-semibold leading-none">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium text-sm">In Stock</span>
                  <span className="text-gray-600 text-sm">({product.stock} available)</span>
                </>
              ) : (
                <span className="text-red-600 font-medium text-sm">Out of Stock</span>
              )}
            </div>

            {/* Call to Action */}
            {product.stock > 0 && (
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 h-12"
                  onClick={() => window.location.href = `mailto:info@doka.com?subject=Inquiry: ${encodeURIComponent(product.name)}`}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Contact to Buy
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Features */}
            <div className="border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-gray-600 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders above 5,000 Birr</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About this product - single section */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">About this product</h3>
          <div className="space-y-6 text-gray-600">
            <p className="text-[15px] leading-relaxed">{product.description}</p>
            {product.features && product.features.length > 0 && (
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-[15px]">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-900 mb-3">Details</p>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 py-2 border-b border-gray-100">
                      <dt className="font-medium text-gray-700">{key}</dt>
                      <dd className="text-gray-600">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="mb-6 text-lg font-semibold">You Might Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Input } from './ui/input';
import { Product } from '../../types';
import { fetchProducts } from '../../api/products';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: string, productId?: string) => void;
}

export function SearchModal({ open, onClose, onNavigate }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const list = await fetchProducts({ search: searchQuery });
        setSearchResults(list.slice(0, 6));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleProductClick = (productId: string) => {
    onNavigate('product', productId);
    onClose();
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands, categories..."
              className="pl-10 pr-10 h-12 text-base border-0 focus-visible:ring-0"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {searchQuery && searching && (
            <div className="p-8 text-center text-gray-500">Searching...</div>
          )}
          {searchQuery && !searching && searchResults.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No results found for &quot;{searchQuery}&quot;
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="p-2">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors text-left rounded-lg"
                >
                  <img
                    src={product.images?.[0] || 'https://placehold.co/100x100?text=Product'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-0.5 line-clamp-1 text-sm">
                      {product.name}
                    </h4>
                    <p className="text-gray-500 mb-1 text-xs">{product.brand}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">Birr {product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <>
                          <span className="text-xs text-gray-400 line-through">
                            Birr {product.originalPrice.toFixed(2)}
                          </span>
                          <span className="inline-flex items-center h-4 px-1.5 rounded bg-red-600 text-white text-[10px] font-semibold leading-none">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!searchQuery && (
            <div className="p-8 text-center text-gray-400 text-sm">
              Start typing to search products...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
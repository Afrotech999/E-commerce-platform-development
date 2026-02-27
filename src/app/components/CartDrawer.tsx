import { ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

interface CartDrawerProps {
  onNavigate: (page: string) => void;
}

export function CartDrawer({ onNavigate }: CartDrawerProps) {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();

  const handleCheckout = () => {
    onNavigate('checkout');
  };

  return (
    <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 bg-white">
      <SheetHeader className="p-6 pb-4">
        <SheetTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Shopping Cart ({cart.length})
        </SheetTitle>
      </SheetHeader>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="font-semibold mb-2">Your cart is empty</h3>
          <p className="text-sm text-gray-500 mb-6">
            Add some products to get started
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 py-4 border-b last:border-b-0"
                >
                  <img
                    src={item.product.images?.[0] || 'https://placehold.co/80x80?text=Product'}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-0.5 line-clamp-1 text-[5px] sm:text-[10px]">
                      {item.product.name}
                    </h4>
                    <p className="text-gray-500 mb-1.5 text-[12px] sm:text-[20px]">
                      {item.product.brand}
                    </p>
                    <p className="font-semibold text-[14px] sm:text-[24px]">
                      Birr {item.product.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <p className="font-semibold text-sm">
                      Birr {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t p-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">Birr {getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">Calculated at checkout</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold">
                Birr {getCartTotal().toFixed(2)}
              </span>
            </div>
            <Button onClick={handleCheckout} className="w-full h-12" size="lg">
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}
    </SheetContent>
  );
}
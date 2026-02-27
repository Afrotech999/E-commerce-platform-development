import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Package, Heart, Settings, MapPin, CreditCard, LogOut, Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../../context/AuthContext';

interface ProfilePageProps {
  onNavigate: (page: string, param?: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user: authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'settings'>('orders');

  const user = authUser
    ? {
        name: authUser.name,
        email: authUser.email,
        phone: '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.name)}&size=96`,
        joinedDate: 'Member',
      }
    : null;

  const orders: { id: string; date: string; total: number; status: string; items: number }[] = [
    {
      id: 'ORD-001',
      date: 'Feb 20, 2026',
      total: 12499.99,
      status: 'Delivered',
      items: 2,
    },
    {
      id: 'ORD-002',
      date: 'Feb 15, 2026',
      total: 5699.50,
      status: 'In Transit',
      items: 1,
    },
    {
      id: 'ORD-003',
      date: 'Feb 10, 2026',
      total: 899.99,
      status: 'Processing',
      items: 3,
    },
  ];

  if (!authUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-gray-50 rounded-2xl p-8 max-w-md w-full text-center border border-gray-100">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to view profile</h2>
          <p className="text-gray-500 text-sm mb-6">Log in or create an account to see your orders and settings.</p>
          <Button onClick={() => onNavigate('home')} className="w-full">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 sm:p-8 mb-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <img
                src={user!.avatar}
                alt={user!.name}
                className="w-24 h-24 object-cover rounded-full"
              />
              <button className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{user!.name}</h1>
              <p className="text-gray-500 mb-2">{user!.email}</p>
              <p className="text-sm text-gray-400">{user!.joinedDate}</p>
            </div>

            <Button
              variant="outline"
              className="rounded-full px-6"
              onClick={() => {}}
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'orders'
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  My Orders
                </button>
                
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'wishlist'
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  Wishlist
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'settings'
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </button>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Order History</h2>
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{order.id}</h3>
                            <span
                              className={`text-xs px-3 py-1 rounded-full ${
                                order.status === 'Delivered'
                                  ? 'bg-green-100 text-green-700'
                                  : order.status === 'In Transit'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {order.date} • {order.items} item{order.items > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Total</p>
                            <p className="text-lg font-bold">Birr {order.total.toFixed(2)}</p>
                          </div>
                          <Button variant="outline" className="rounded-full">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your wishlist is empty</p>
                  <Button
                    onClick={() => onNavigate('products')}
                    className="mt-4 rounded-full"
                  >
                    Browse Products
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </h3>
                    <div className="space-y-3 pl-7">
                      <div>
                        <label className="text-sm text-gray-500">Full Name</label>
                        <p className="font-medium">{user!.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <p className="font-medium">{user!.email}</p>
                      </div>
                      {user!.phone && (
                        <div>
                          <label className="text-sm text-gray-500">Phone</label>
                          <p className="font-medium">{user!.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </h3>
                    <div className="pl-7">
                      <p className="text-gray-600">No default address set</p>
                      <Button variant="outline" className="mt-3 rounded-full">
                        Add Address
                      </Button>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Methods
                    </h3>
                    <div className="pl-7">
                      <p className="text-gray-600">No payment methods saved</p>
                      <Button variant="outline" className="mt-3 rounded-full">
                        Add Payment Method
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

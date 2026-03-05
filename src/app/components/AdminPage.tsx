import { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  DollarSign,
  Users,
  LayoutGrid,
  Tag,
  ArrowLeft,
  Eye,
} from 'lucide-react';

import type { Product } from '../../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { useAuth } from '../../context/AuthContext';
import { useProducts, useCategories } from '../../hooks/useApi';
import { createProduct, updateProduct, deleteProduct } from '../../api/products';
import { createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { LoadingState } from './LoadingState';
import { uploadFile } from '../../api/uploads';
import { X, Upload } from 'lucide-react';
import { HeroAdmin } from './HeroAdmin';

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

const clampRating = (n: number) => Math.max(0, Math.min(5, n));

export function AdminPage({ onNavigate }: AdminPageProps) {
  const { user, login, logout, isAdmin } = useAuth();
  const { products, loading, error, refetch } = useProducts();

  // Products dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [productImageError, setProductImageError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    rating: '0', // ✅ NEW
    category: '',
    brand: '',
    stock: '',
    images: '',
    features: '',
    specs: '',
    trending: false,
    featured: false,
    condition: 'new' as 'new' | 'used',
  });

  const [uploadingProductImage, setUploadingProductImage] = useState(false);

  // Categories
  const { categories, refetch: refetchCategories } = useCategories();

  // Category dialog
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [savingCategoryDialog, setSavingCategoryDialog] = useState(false);
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const [categoryImageError, setCategoryImageError] = useState<string | null>(null);

  const [categoryDialogForm, setCategoryDialogForm] = useState({
    slug: '',
    name: '',
    image: '',
  });

  const stats = [
    { title: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-500' },
    {
      title: 'Total Revenue',
      value: `Birr ${products.reduce((sum, p) => sum + Number(p.price || 0) * 10, 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    { title: 'Trending Items', value: products.filter((p) => p.trending).length, icon: TrendingUp, color: 'bg-purple-500' },
    { title: 'Out of Stock', value: products.filter((p) => p.stock === 0).length, icon: Users, color: 'bg-red-500' },
  ];

  // -------------------------
  // Upload helpers
  // -------------------------
  const uploadProductImage = async (file: File) => {
    setProductImageError(null);
    setUploadingProductImage(true);

    try {
      const url = await uploadFile(file);

      setFormData((prev) => {
        const current = prev.images
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        if (!current.includes(url)) current.push(url);
        return { ...prev, images: current.join(', ') };
      });

      toast.success('Image uploaded');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setProductImageError(msg);
      toast.error(msg);
    } finally {
      setUploadingProductImage(false);
    }
  };

  const removeProductImage = (url: string) => {
    setFormData((prev) => {
      const next = prev.images
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((x) => x !== url);

      return { ...prev, images: next.join(', ') };
    });
  };

  // -------------------------
  // Products handlers
  // -------------------------
  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: String(product.price ?? ''),
        originalPrice: product.originalPrice ? String(product.originalPrice) : '',
        rating: typeof product.rating === 'number' ? String(product.rating) : '0', // ✅ NEW
        category: product.category,
        brand: product.brand,
        stock: String(product.stock ?? 0),
        images: product.images?.join(', ') ?? '',
        features: (product.features || []).join('\n'),
        specs:
          product.specs && Object.keys(product.specs).length > 0
            ? Object.entries(product.specs)
              .map(([k, v]) => `${k}: ${v}`)
              .join('\n')
            : '',
        trending: Boolean(product.trending),
        featured: Boolean(product.featured),
        condition: (product.condition === 'used' ? 'used' : 'new') as 'new' | 'used',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        rating: '0', // ✅ NEW
        category: '',
        brand: '',
        stock: '',
        images: '',
        features: '',
        specs: '',
        trending: false,
        featured: false,
        condition: 'new' as 'new' | 'used',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    const images = formData.images.split(',').map((url) => url.trim()).filter(Boolean);
    const features = formData.features.split('\n').map((s) => s.trim()).filter(Boolean);

    const specs: Record<string, string> = {};
    formData.specs.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const colon = trimmed.indexOf(':');
      if (colon > 0) {
        const key = trimmed.slice(0, colon).trim();
        const value = trimmed.slice(colon + 1).trim();
        if (key) specs[key] = value;
      }
    });

    const ratingNum = clampRating(Number(formData.rating || 0));

    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
          category: formData.category,
          brand: formData.brand,
          stock: parseInt(formData.stock, 10),
          images: images.length ? images : undefined,
          features,
          specs,

          // ✅ dynamic rating
          rating: ratingNum,
          reviewCount: editingProduct.reviewCount ?? 0,

          trending: formData.trending,
          featured: formData.featured,
          condition: formData.condition,
        });

        toast.success('Product updated successfully');
      } else {
        await createProduct({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
          category: formData.category,
          brand: formData.brand,
          stock: parseInt(formData.stock, 10),
          images,
          features,
          specs,

          // ✅ dynamic rating (NO more 4.5 static)
          rating: ratingNum,
          reviewCount: 0,

          trending: formData.trending,
          featured: formData.featured,
          condition: formData.condition,
        });

        toast.success('Product added successfully');
      }

      refetch();
      setIsDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete product');
    }
  };

  // -------------------------
  // Categories dialog handlers
  // -------------------------
  const openCategoryDialog = (cat?: { id: string; name: string; image: string }) => {
    setCategoryImageError(null);

    if (cat) setCategoryDialogForm({ slug: cat.id, name: cat.name, image: cat.image });
    else setCategoryDialogForm({ slug: '', name: '', image: '' });

    setIsCategoryDialogOpen(true);
  };

  const uploadCategoryImage = async (file: File) => {
    setCategoryImageError(null);
    setUploadingCategoryImage(true);

    try {
      const url = await uploadFile(file);
      setCategoryDialogForm((prev) => ({ ...prev, image: url }));
      toast.success('Category image uploaded');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setCategoryImageError(msg);
      toast.error(msg);
    } finally {
      setUploadingCategoryImage(false);
    }
  };

  const handleSaveCategoryDialog = async () => {
    const slug = categoryDialogForm.slug.trim().toLowerCase().replace(/\s+/g, '-');
    const name = categoryDialogForm.name.trim();
    const image = categoryDialogForm.image.trim();

    if (!slug || !name || !image) {
      toast.error('Slug, name, and image are required');
      return;
    }

    setSavingCategoryDialog(true);
    try {
      const exists = categories.some((c) => c.id === slug);

      if (exists) {
        await updateCategory(slug, { name, image });
        toast.success('Category updated');
      } else {
        await createCategory({ slug, name, image });
        toast.success('Category added');
      }

      refetchCategories();
      setIsCategoryDialogOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save category');
    } finally {
      setSavingCategoryDialog(false);
    }
  };

  const handleDeleteCategoryDialog = async (slug: string) => {
    if (!confirm('Delete this category? Products in it may be affected.')) return;

    try {
      await deleteCategory(slug);
      toast.success('Category deleted');
      refetchCategories();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  // -------------------------
  // Auth guards
  // -------------------------
  if (!user) {
    const handleLogin = () => {
      if (!loginEmail.trim() || !loginPassword) {
        toast.error('Enter email and password');
        return;
      }
      login(loginEmail, loginPassword).catch((e) => {
        const msg = e?.message || 'Invalid credentials';
        const isNetwork = /failed to fetch|network|err_connection/i.test(String(msg));
        toast.error(isNetwork ? 'Cannot reach server. Is the backend running at http://localhost:3001?' : msg);
      });
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
          {/* Header section with brand color/style */}
          <div className="bg-black p-10 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
              <p className="mt-2 text-sm text-gray-400">Secure access to Clicksuq management</p>
            </div>
          </div>

          {/* Form section */}
          <div className="p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 ml-1">Email</Label>
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="h-12 border-gray-200 focus:border-black focus:ring-black rounded-xl transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 ml-1">Password</Label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 border-gray-200 focus:border-black focus:ring-black rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <Button
                className="w-full h-12 bg-black hover:bg-black/90 text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] text-base"
                onClick={handleLogin}
              >
                Log in to Dashboard
              </Button>

              <div className="flex items-center justify-center gap-4">
                <div className="h-px flex-1 bg-gray-100"></div>
                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">or</span>
                <div className="h-px flex-1 bg-gray-100"></div>
              </div>

              <Button
                variant="ghost"
                className="w-full h-11 text-gray-500 hover:text-black hover:bg-gray-100/50 rounded-xl transition-all text-sm font-medium"
                onClick={() => onNavigate('home')}
              >
                Return to Storefront
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-sm border border-gray-100">
          <CardContent className="pt-6">
            <p className="mb-4">Admin access required.</p>
            <Button variant="outline" onClick={logout}>
              Log out
            </Button>
            <Button className="ml-2" onClick={() => onNavigate('home')}>
              Back to Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return <LoadingState />;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="mb-1">Admin Dashboard</h2>
            <p className="text-gray-600 text-sm">Manage products, hero, and categories</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => onNavigate('home')} className="flex-1 sm:flex-none text-sm">
              Back to Store
            </Button>
            <Button variant="outline" onClick={logout} className="text-sm">
              Log out
            </Button>
            <Button onClick={() => handleOpenDialog()} className="flex-1 sm:flex-none text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v);
            if (v !== 'products') setCategoryFilter(null);
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* ---------------- Products Tab ---------------- */}
          <TabsContent value="products" className="space-y-6">
            {/* Category Filter Banner */}
            {categoryFilter &&
              (() => {
                const cat = categories.find((c) => c.id === categoryFilter);
                return cat ? (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl px-4 py-3">
                    <img src={cat.image} alt={cat.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        Showing products in: <span className="text-black">{cat.name}</span>
                      </p>
                      <p className="text-xs text-gray-400">{products.filter((p) => p.category === categoryFilter).length} products</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setCategoryFilter(null)}>
                      <ArrowLeft className="h-3 w-3" />
                      Show All
                    </Button>
                  </div>
                ) : null;
              })()}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products
                        .filter((product) => !categoryFilter || product.category === categoryFilter)
                        .map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img src={product.images?.[0] ?? ''} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-gray-500">ID: {product.id}</p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="capitalize">{product.category}</TableCell>
                            <TableCell>{product.brand}</TableCell>

                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-gray-900">Birr {Number(product.price || 0).toFixed(2)}</span>
                                {product.originalPrice != null && product.originalPrice > 0 && product.originalPrice !== Number(product.price) && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 line-through">
                                      Birr {Number(product.originalPrice).toFixed(2)}
                                    </span>
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                      <Tag className="h-2.5 w-2.5" />
                                      {Math.round(((product.originalPrice - Number(product.price)) / product.originalPrice) * 100)}% OFF
                                    </span>
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>{product.stock}</TableCell>

                            <TableCell>
                              <div className="flex gap-2 flex-wrap">
                                {product.stock === 0 && <Badge variant="destructive">Out of Stock</Badge>}
                                {product.trending && <Badge>Trending</Badge>}
                                {product.featured && <Badge variant="secondary">Featured</Badge>}
                                {product.condition === 'used' && <Badge className="bg-amber-100 text-amber-700 border-0">Used</Badge>}
                                {(!product.condition || product.condition === 'new') && <Badge className="bg-blue-600 text-white border-transparent shadow-sm">New</Badge>}
                              </div>
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------- Hero Tab ---------------- */}
          <TabsContent value="hero" className="space-y-6">
            <HeroAdmin />
          </TabsContent>

          {/* ---------------- Categories Tab ---------------- */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-gray-700" />
                <h3 className="text-lg font-semibold">Categories</h3>
                <Badge variant="secondary" className="ml-1">
                  {categories.length}
                </Badge>
              </div>
              <Button onClick={() => openCategoryDialog()} className="text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {categories.map((c) => {
                const categoryProducts = products.filter((p) => p.category === c.id);
                const outOfStock = categoryProducts.filter((p) => p.stock === 0).length;
                const withDiscount = categoryProducts.filter((p) => p.originalPrice != null && p.originalPrice > 0 && p.originalPrice !== Number(p.price)).length;

                return (
                  <Card key={c.id} className="overflow-hidden border border-gray-100 hover:shadow-md transition-all group">
                    <div className="relative h-28 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="text-white font-bold text-lg truncate drop-shadow-sm">{c.name}</p>
                        <p className="text-white/70 text-xs font-mono">{c.id}</p>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="secondary" size="icon" className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm" onClick={() => openCategoryDialog(c)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="secondary" size="icon" className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm" onClick={() => handleDeleteCategoryDialog(c.id)}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-lg font-bold text-gray-900">{categoryProducts.length}</p>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400">Products</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-lg font-bold text-gray-900">{outOfStock}</p>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400">Out of Stock</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-lg font-bold text-emerald-600">{withDiscount}</p>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400">On Sale</p>
                        </div>
                      </div>

                      {categoryProducts.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-4">
                          {categoryProducts.slice(0, 5).map((p) => (
                            <img key={p.id} src={p.images?.[0] ?? ''} alt={p.name} title={p.name} className="w-9 h-9 rounded-md object-cover border border-gray-100" />
                          ))}
                          {categoryProducts.length > 5 && (
                            <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                              +{categoryProducts.length - 5}
                            </div>
                          )}
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full text-sm gap-2"
                        onClick={() => {
                          setCategoryFilter(c.id);
                          setActiveTab('products');
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View All Products
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Product Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl p-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>

            <div className="px-6 pb-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-5 py-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short summary shown under the price on the product page."
                    rows={3}
                  />
                </div>

                {/* Price + Original Price + Rating + Stock + Brand + Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="price">Selling Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                    <p className="mt-1 text-xs text-gray-500">The actual price customers pay.</p>
                  </div>

                  <div>
                    <Label htmlFor="originalPrice">
                      Original Price <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="e.g. 499.99"
                    />
                    {formData.originalPrice && formData.price && parseFloat(formData.originalPrice) > parseFloat(formData.price) ? (
                      <p className="mt-1 text-xs text-emerald-600 font-medium">
                        💰 Discount:{' '}
                        {Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.price)) / parseFloat(formData.originalPrice)) * 100)}% off
                      </p>
                    ) : formData.originalPrice && formData.price && parseFloat(formData.originalPrice) <= parseFloat(formData.price) ? (
                      <p className="mt-1 text-xs text-amber-600">⚠️ Original price should be higher than selling price to show a discount.</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">Set higher than selling price to show a strikethrough discount.</p>
                    )}
                  </div>

                  {/* ✅ Rating */}
                  <div>
                    <Label htmlFor="rating">Rating (0 to 5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      placeholder="4.5"
                    />
                    <p className="mt-1 text-xs text-gray-500">Saved to backend and displayed on product cards.</p>
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Enter brand name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    >
                      <option value="">Select category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Categories are loaded from backend.</p>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Product Images</p>
                      <p className="text-xs text-gray-500">Upload images and they will be added automatically.</p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                      <Upload className="h-4 w-4" />
                      {uploadingProductImage ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingProductImage}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadProductImage(f);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </div>

                  {productImageError && <p className="mt-2 text-xs text-red-600">{productImageError}</p>}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.images
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((url) => (
                        <div key={url} className="relative">
                          <img src={url} alt="" className="w-20 h-20 object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => removeProductImage(url)}
                            className="absolute -top-2 -right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center"
                            title="Remove"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                  </div>

                  <div className="mt-3">
                    <Label htmlFor="images">Image URLs (comma-separated)</Label>
                    <Textarea
                      id="images"
                      value={formData.images}
                      onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                      placeholder="https://... , https://..."
                      rows={2}
                    />
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Condition</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, condition: 'new' })}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${formData.condition !== 'used'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                    >
                      ✨ New Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, condition: 'used' })}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${formData.condition === 'used'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                    >
                      ♻️ Used Product
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">Used products appear in the "Used Products" section on the home page and Used page.</p>
                </div>

                {/* Trending / Featured */}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.trending}
                      onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">Trending Now</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">Featured</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProduct} disabled={saving}>
                {saving ? 'Saving...' : editingProduct ? 'Update' : 'Add'} Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="max-w-xl p-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>
                {categories.some((c) => c.id === categoryDialogForm.slug.trim().toLowerCase()) ? 'Edit Category' : 'Add Category'}
              </DialogTitle>
            </DialogHeader>

            <div className="px-6 pb-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-5 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="catSlug">Slug</Label>
                    <Input
                      id="catSlug"
                      value={categoryDialogForm.slug}
                      onChange={(e) => setCategoryDialogForm((p) => ({ ...p, slug: e.target.value }))}
                      placeholder="e.g. smartphones"
                    />
                    <p className="mt-1 text-xs text-gray-500">Used as ID in products (keep it stable).</p>
                  </div>

                  <div>
                    <Label htmlFor="catName">Name</Label>
                    <Input
                      id="catName"
                      value={categoryDialogForm.name}
                      onChange={(e) => setCategoryDialogForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Smartphones"
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Category Image</p>
                      <p className="text-xs text-gray-500">Upload and we’ll use the URL.</p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                      <Upload className="h-4 w-4" />
                      {uploadingCategoryImage ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingCategoryImage}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadCategoryImage(f);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </div>

                  {categoryImageError && <p className="mt-2 text-xs text-red-600">{categoryImageError}</p>}

                  {categoryDialogForm.image ? (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={categoryDialogForm.image} alt="" className="w-20 h-20 object-cover rounded border" />
                      <div className="flex-1">
                        <Label htmlFor="catImage">Image URL</Label>
                        <Input
                          id="catImage"
                          value={categoryDialogForm.image}
                          onChange={(e) => setCategoryDialogForm((p) => ({ ...p, image: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setCategoryDialogForm((p) => ({ ...p, image: '' }))} title="Remove image">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <Label htmlFor="catImage">Image URL</Label>
                      <Input
                        id="catImage"
                        value={categoryDialogForm.image}
                        onChange={(e) => setCategoryDialogForm((p) => ({ ...p, image: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCategoryDialog} disabled={savingCategoryDialog}>
                {savingCategoryDialog ? 'Saving...' : 'Save'} Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
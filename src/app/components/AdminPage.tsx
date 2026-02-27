import { useState } from 'react';
import { Plus, Edit, Trash2, Package, TrendingUp, DollarSign, Users, Image, LayoutGrid } from 'lucide-react';
import { Product } from '../../types';
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
import { useProducts, useCategories, useHero } from '../../hooks/useApi';
import { createProduct, updateProduct, deleteProduct } from '../../api/products';
import { createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { updateHeroSlides } from '../../api/hero';
import type { HeroSlide } from '../../api/hero';
import { LoadingState } from './LoadingState';

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const { user, login, logout, isAdmin } = useAuth();
  const { products, loading, error, refetch } = useProducts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    images: '',
    features: '',
    specs: '',
    trending: false,
    featured: false,
  });
  const { categories, refetch: refetchCategories } = useCategories();
  const { slides: heroSlides, refetch: refetchHero } = useHero();
  const [heroForm, setHeroForm] = useState<HeroSlide[]>([]);
  const [categoryForm, setCategoryForm] = useState({ slug: '', name: '', image: '' });
  const [editingCategorySlug, setEditingCategorySlug] = useState<string | null>(null);
  const [savingHero, setSavingHero] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Revenue',
      value: `Birr ${products.reduce((sum, p) => sum + p.price * 10, 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Trending Items',
      value: products.filter((p) => p.trending).length,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Out of Stock',
      value: products.filter((p) => p.stock === 0).length,
      icon: Users,
      color: 'bg-red-500',
    },
  ];

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        brand: product.brand,
        stock: product.stock.toString(),
        images: product.images?.join(', ') ?? '',
        features: (product.features || []).join('\n'),
        specs: product.specs && Object.keys(product.specs).length > 0
          ? Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`).join('\n')
          : '',
        trending: Boolean(product.trending),
        featured: Boolean(product.featured),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        stock: '',
        images: '',
        features: '',
        specs: '',
        trending: false,
        featured: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    const images = formData.images.split(',').map((url) => url.trim()).filter(Boolean);
    const features = formData.features
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
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
    setSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          brand: formData.brand,
          stock: parseInt(formData.stock, 10),
          images: images.length ? images : undefined,
          features,
          specs,
          rating: editingProduct.rating,
          reviewCount: editingProduct.reviewCount,
          trending: formData.trending,
          featured: formData.featured,
        });
        toast.success('Product updated successfully');
      } else {
        await createProduct({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          brand: formData.brand,
          stock: parseInt(formData.stock, 10),
          images,
          features,
          specs,
          rating: 4.5,
          reviewCount: 0,
          trending: formData.trending,
          featured: formData.featured,
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
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border border-gray-100">
          <CardHeader>
            <CardTitle>Site management</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Log in to manage products, hero carousel, and categories.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="admin@doka.com" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button className="w-full" onClick={handleLogin}>
              Log in
            </Button>
            <p className="text-xs text-gray-400">Default after seed: admin@doka.com / admin123</p>
            <Button variant="ghost" className="w-full" onClick={() => onNavigate('home')}>Back to Store</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-sm border border-gray-100">
          <CardContent className="pt-6">
            <p className="mb-4">Admin access required.</p>
            <Button variant="outline" onClick={logout}>Log out</Button>
            <Button className="ml-2" onClick={() => onNavigate('home')}>Back to Store</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (loading) return <LoadingState />;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  const handleSaveHero = async () => {
    if (heroForm.some((s) => !s.image || !s.title || !s.subtitle)) {
      toast.error('Each slide needs image, title, and subtitle');
      return;
    }
    setSavingHero(true);
    try {
      await updateHeroSlides(heroForm.map((s) => ({ image: s.image, title: s.title, subtitle: s.subtitle, cta: s.cta, link: s.link })));
      toast.success('Hero updated');
      refetchHero();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save hero');
    } finally {
      setSavingHero(false);
    }
  };

  const loadHeroIntoForm = () => {
    setHeroForm(heroSlides.length > 0 ? heroSlides.map((s) => ({ ...s })) : [{ image: '', title: '', subtitle: '', cta: '', link: '' }]);
  };

  const handleSaveCategory = async () => {
    const slug = categoryForm.slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!slug || !categoryForm.name.trim() || !categoryForm.image.trim()) {
      toast.error('Slug, name and image required');
      return;
    }
    setSavingCategory(true);
    try {
      if (editingCategorySlug) {
        await updateCategory(editingCategorySlug, { name: categoryForm.name.trim(), image: categoryForm.image.trim() });
        toast.success('Category updated');
      } else {
        await createCategory({ slug, name: categoryForm.name.trim(), image: categoryForm.image.trim() });
        toast.success('Category added');
      }
      refetchCategories();
      setCategoryForm({ slug: '', name: '', image: '' });
      setEditingCategorySlug(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (slug: string) => {
    if (!confirm('Delete this category? Products in it may be affected.')) return;
    try {
      await deleteCategory(slug);
      toast.success('Category deleted');
      refetchCategories();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

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
            <Button variant="outline" onClick={logout} className="text-sm">Log out</Button>
            <Button onClick={() => handleOpenDialog()} className="flex-1 sm:flex-none text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
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
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0] ?? ''}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">
                              ID: {product.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {product.category}
                      </TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>Birr {product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {product.stock === 0 && (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                          {product.trending && (
                            <Badge>Trending</Badge>
                          )}
                          {product.featured && (
                            <Badge variant="secondary">Featured</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
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

          <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Hero Section
                </CardTitle>
                <p className="text-sm text-gray-600">Edit home page carousel: image, title, subtitle, CTA button (link = product ID).</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {heroForm.length === 0 ? (
                  <Button variant="outline" onClick={loadHeroIntoForm}>
                    Load current hero
                  </Button>
                ) : (
                  <>
                    {heroForm.map((slide, i) => (
                      <div key={i} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">Slide {i + 1}</span>
                          <Button variant="ghost" size="sm" onClick={() => setHeroForm((prev) => prev.filter((_, j) => j !== i))}>Remove</Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label>Image URL</Label>
                            <Input value={slide.image} onChange={(e) => setHeroForm((prev) => prev.map((s, j) => j === i ? { ...s, image: e.target.value } : s))} placeholder="https://..." />
                          </div>
                          <div>
                            <Label>Title</Label>
                            <Input value={slide.title} onChange={(e) => setHeroForm((prev) => prev.map((s, j) => j === i ? { ...s, title: e.target.value } : s))} placeholder="Slide title" />
                          </div>
                          <div>
                            <Label>Subtitle</Label>
                            <Input value={slide.subtitle} onChange={(e) => setHeroForm((prev) => prev.map((s, j) => j === i ? { ...s, subtitle: e.target.value } : s))} placeholder="Subtitle" />
                          </div>
                          <div>
                            <Label>CTA text (optional)</Label>
                            <Input value={slide.cta ?? ''} onChange={(e) => setHeroForm((prev) => prev.map((s, j) => j === i ? { ...s, cta: e.target.value } : s))} placeholder="Shop Now" />
                          </div>
                          <div>
                            <Label>Link (product ID, optional)</Label>
                            <Input value={slide.link ?? ''} onChange={(e) => setHeroForm((prev) => prev.map((s, j) => j === i ? { ...s, link: e.target.value } : s))} placeholder="1" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" onClick={() => setHeroForm((prev) => [...prev, { image: '', title: '', subtitle: '', cta: '', link: '' }])}>
                        Add slide
                      </Button>
                      <Button onClick={loadHeroIntoForm} variant="outline">Reset to current</Button>
                      <Button onClick={handleSaveHero} disabled={savingHero}>{savingHero ? 'Saving...' : 'Save Hero'}</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input placeholder="Slug (e.g. smartphones)" value={categoryForm.slug} onChange={(e) => setCategoryForm((f) => ({ ...f, slug: e.target.value }))} disabled={!!editingCategorySlug} />
                  <Input placeholder="Name" value={categoryForm.name} onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))} />
                  <Input placeholder="Image URL" value={categoryForm.image} onChange={(e) => setCategoryForm((f) => ({ ...f, image: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveCategory} disabled={savingCategory}>{editingCategorySlug ? 'Update' : 'Add'} Category</Button>
                  {editingCategorySlug && <Button variant="outline" onClick={() => { setEditingCategorySlug(null); setCategoryForm({ slug: '', name: '', image: '' }); }}>Cancel</Button>}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Slug</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.id}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell><img src={c.image} alt="" className="w-10 h-10 object-cover rounded" /></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingCategorySlug(c.id); setCategoryForm({ slug: c.id, name: c.name, image: c.image }); }}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteCategory(c.id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Product Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Short summary shown under the price on the product page."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="features">About this product – Features</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({ ...formData, features: e.target.value })
                  }
                  placeholder={'One feature per line, e.g.\nWireless connectivity\n30-hour battery life\nNoise cancellation'}
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Each line becomes one bullet in the “About this product” section.</p>
              </div>
              <div>
                <Label htmlFor="specs">Specifications / Details</Label>
                <Textarea
                  id="specs"
                  value={formData.specs}
                  onChange={(e) =>
                    setFormData({ ...formData, specs: e.target.value })
                  }
                  placeholder={'One per line as Key: Value, e.g.\nWeight: 250g\nConnectivity: Bluetooth 5.2\nBattery: 30 hours'}
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Each line “Key: Value” appears in the product Details list.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., headphones"
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    placeholder="Enter brand name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="images">Image URLs (comma-separated, multiple for gallery)</Label>
                <Textarea
                  id="images"
                  value={formData.images}
                  onChange={(e) =>
                    setFormData({ ...formData, images: e.target.value })
                  }
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  rows={2}
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.trending}
                    onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Trending Now</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Featured</span>
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveProduct} disabled={saving}>
                  {saving ? 'Saving...' : editingProduct ? 'Update' : 'Add'} Product
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
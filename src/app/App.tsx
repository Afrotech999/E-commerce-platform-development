import { useState, useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ProductsPage } from './components/ProductsPage';
import { ProductPage } from './components/ProductPage';
import { CategoriesPage } from './components/CategoriesPage';
import { DealsPage } from './components/DealsPage';
import { UsedPage } from './components/UsedPage';
import { ProfilePage } from './components/ProfilePage';
import { AdminPage } from './components/AdminPage';
import { FooterContentModal } from './components/FooterContentModal';
import { SearchModal } from './components/SearchModal';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';

type Page = 'home' | 'products' | 'product' | 'categories' | 'deals' | 'used' | 'profile' | 'admin';

interface NavigationState {
  page: Page;
  productId?: string;
  categoryId?: string;
}

export default function App() {
  const [navigation, setNavigation] = useState<NavigationState>({
    page: 'home',
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [footerContentSlug, setFooterContentSlug] = useState<string | null>(null);
const setUrl = (page: Page, param?: string) => {
  const path =
    page === 'home' ? '/' :
    page === 'product' ? `/product/${param ?? ''}` :
    page === 'products' ? `/products${param ? `?category=${encodeURIComponent(param)}` : ''}` :
    `/${page}`;

  window.history.pushState({}, '', path);
};
  const handleNavigate = (page: string, param?: string) => {
  window.scrollTo({ top: 0, behavior: 'smooth' });

  switch (page) {
    case 'product':
      setNavigation({ page: 'product', productId: param });
      setUrl('product', param);
      break;
    case 'products':
      setNavigation({ page: 'products', categoryId: param });
      setUrl('products', param);
      break;
    case 'categories':
      setNavigation({ page: 'categories' });
      setUrl('categories');
      break;
    case 'deals':
      setNavigation({ page: 'deals' });
      setUrl('deals');
      break;
    case 'used':
      setNavigation({ page: 'used' });
      setUrl('used');
      break;
    case 'profile':
      setNavigation({ page: 'profile' });
      setUrl('profile');
      break;
    case 'admin':
      setNavigation({ page: 'admin' });
      setUrl('admin');
      break;
    default:
      setNavigation({ page: 'home' });
      setUrl('home');
  }
};
  // Admin access: type 'admin' (when not typing in an input) to open admin panel
  useEffect(() => {
    let keyBuffer = '';
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      keyBuffer += e.key.toLowerCase();
      if (keyBuffer.length > 5) keyBuffer = keyBuffer.slice(-5);
      if (keyBuffer === 'admin') {
        handleNavigate('admin');
        keyBuffer = '';
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);
  useEffect(() => {
  const syncFromUrl = () => {
    const path = window.location.pathname;
    const url = new URL(window.location.href);

    if (path === '/admin') return setNavigation({ page: 'admin' });
    if (path === '/categories') return setNavigation({ page: 'categories' });
    if (path === '/deals') return setNavigation({ page: 'deals' });
    if (path === '/used') return setNavigation({ page: 'used' });
    if (path === '/profile') return setNavigation({ page: 'profile' });

    if (path.startsWith('/product/')) {
      const id = path.split('/product/')[1];
      return setNavigation({ page: 'product', productId: id });
    }

    if (path === '/products') {
      const cat = url.searchParams.get('category') ?? undefined;
      return setNavigation({ page: 'products', categoryId: cat });
    }

    // default
    return setNavigation({ page: 'home' });
  };

  syncFromUrl();
  window.addEventListener('popstate', syncFromUrl);
  return () => window.removeEventListener('popstate', syncFromUrl);
}, []);

  const renderPage = () => {
    switch (navigation.page) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'categories':
        return <CategoriesPage onNavigate={handleNavigate} />;
      case 'products':
        return (
          <ProductsPage
            categoryId={navigation.categoryId}
            onNavigate={handleNavigate}
          />
        );
      case 'product':
        return (
          <ProductPage
            productId={navigation.productId || '1'}
            onNavigate={handleNavigate}
          />
        );
      case 'deals':
        return <DealsPage onNavigate={handleNavigate} />;
      case 'used':
        return <UsedPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {navigation.page !== 'admin' && (
          <Header 
            onNavigate={handleNavigate} 
            onSearchOpen={() => setIsSearchOpen(true)}
            // currentPage={navigation.page} 
          />
        )}
        
        <main className="flex-1 bg-gray-50">
          <AnimatePresence mode="wait">
            <motion.div
              key={navigation.page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {navigation.page !== 'admin' && (
          <Footer onOpenContent={setFooterContentSlug} onNavigate={handleNavigate} />
        )}
        
        <FooterContentModal slug={footerContentSlug} onClose={() => setFooterContentSlug(null)} />
        <SearchModal 
          open={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)} 
          onNavigate={handleNavigate}
        />
        
        <Toaster position="bottom-right" />
      </div>
    </AuthProvider>
  );
}
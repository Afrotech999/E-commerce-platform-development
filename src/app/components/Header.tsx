import {
  Search,
  User,
  Menu,
  LogOut,
  Home,
  Package,
  LayoutGrid,
  Tag,
  Recycle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import clicksuqLogo from '../../assets/clicksuq.png';

interface HeaderProps {
  onNavigate: (page: string) => void;
  onSearchOpen: () => void;
}

export function Header({ onNavigate, onSearchOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled
        ? 'bg-white/[0.012] backdrop-blur-md shadow-sm border-b border-white/[0.003]'
        : 'bg-white/[0.0005] border-b border-white/[0.001]'
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* ✅ LOGO FIX: force big size + crop transparent padding */}
          <motion.button
            onClick={() => onNavigate('home')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Go to home"
            type="button"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <div
              style={{
                width: 140,          // ✅ wider so it won’t cut
                height: 56,          // ✅ good for header
                overflow: 'hidden',  // keep cropping transparent padding
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img
                src={clicksuqLogo}
                alt="Clicksuq"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',          // crops empty padding
                  objectPosition: 'left center',
                  transform: 'scale(1.15)',    // ✅ reduce scale so right side fits
                  transformOrigin: 'left center',
                  display: 'block',
                }}
                draggable={false}
              />
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3 bg-gray-50 rounded-full px-2 py-2">
            {['Products', 'Categories', 'Deals', 'Used'].map((item) => (
              <motion.button
                key={item}
                onClick={() => onNavigate(item.toLowerCase())}
                className="text-sm font-medium text-gray-700 relative px-5 py-2.5 rounded-full hover:bg-white hover:shadow-sm transition-all"
                whileHover={{ y: -1 }}
                transition={{ duration: 0.2 }}
                type="button"
              >
                {item}
              </motion.button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 bg-gray-50 rounded-full px-2 py-2">
            {/* Search */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSearchOpen}
                className="h-10 w-10 rounded-full hover:bg-white hover:shadow-sm text-gray-700 transition-all"
              >
                <Search className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* User / Profile */}
            <div className="relative" ref={userMenuRef}>
              {user && (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUserMenuOpen((o) => !o)}
                      className="h-10 w-10 rounded-full hover:bg-white hover:shadow-sm text-gray-700 transition-all overflow-hidden p-0"
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name
                        )}&size=40`}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    </Button>
                  </motion.div>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-lg z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="font-medium text-sm truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>

                        <button
                          onClick={() => {
                            onNavigate('profile');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                          type="button"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                          type="button"
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <motion.div
                  className="md:hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-white hover:shadow-sm text-gray-700 transition-all"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </motion.div>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-full sm:w-[380px] max-w-[85vw] bg-white border-l border-gray-100 p-0 flex flex-col shadow-xl"
              >
                <div className="flex flex-col h-full bg-white">
                  <div className="px-6 pt-6 pb-4">
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
                      Navigation
                    </span>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
                      Menu
                    </h2>
                  </div>

                  <nav className="flex-1 px-4 py-2 space-y-1 overflow-auto">
                    {[
                      { label: 'Home', path: 'home', icon: Home },
                      { label: 'Products', path: 'products', icon: Package },
                      { label: 'Categories', path: 'categories', icon: LayoutGrid },
                      { label: 'Deals', path: 'deals', icon: Tag },
                      { label: 'Used', path: 'used', icon: Recycle },
                    ].map(({ label, path, icon: Icon }, index) => (
                      <SheetClose asChild key={path}>
                        <motion.button
                          onClick={() => onNavigate(path)}
                          className="w-full text-left px-4 py-3.5 rounded-xl text-[15px] font-medium text-gray-800 hover:bg-gray-100 active:bg-gray-100 transition-colors flex items-center gap-3"
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04 }}
                          type="button"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <Icon className="h-4 w-4" />
                          </span>
                          {label}
                        </motion.button>
                      </SheetClose>
                    ))}

                    <div className="pt-4 mt-4 border-t border-gray-100">
                      {user && (
                        <>
                          <SheetClose asChild>
                            <button
                              onClick={() => onNavigate('profile')}
                              className="w-full text-left px-4 py-3.5 rounded-xl text-[15px] font-medium text-gray-800 hover:bg-gray-100 transition-colors flex items-center gap-3"
                              type="button"
                            >
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  user.name
                                )}&size=96`}
                                alt=""
                                className="h-9 w-9 rounded-full bg-gray-100"
                              />
                              <span>{user.name}</span>
                            </button>
                          </SheetClose>

                          <SheetClose asChild>
                            <button
                              onClick={() => logout()}
                              className="w-full text-left px-4 py-3.5 rounded-xl text-[15px] font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                              type="button"
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                                <LogOut className="h-4 w-4" />
                              </span>
                              Log out
                            </button>
                          </SheetClose>
                        </>
                      )}
                    </div>
                  </nav>

                  <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/80">
                    <p className="text-xs text-gray-500">© 2026 Clicksuq</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
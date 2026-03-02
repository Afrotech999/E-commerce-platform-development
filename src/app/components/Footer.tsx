import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

interface FooterProps {
  onOpenContent: (slug: string) => void;
  onNavigate: (page: string, param?: string) => void;
}

export function Footer({ onOpenContent, onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-4 text-white">ClickSuq</h3>
            <p className="text-white/70 text-xs sm:text-sm">
              Premium technology and lifestyle products for the modern world.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-2 sm:mb-4 text-white text-sm sm:text-base">Shop</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <button type="button" onClick={() => onNavigate('products')} className="text-white/70 hover:text-white transition-colors text-left">
                  All Products
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('products', 'trending')} className="text-white/70 hover:text-white transition-colors text-left">
                  Trending
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('products', 'new')} className="text-white/70 hover:text-white transition-colors text-left">
                  New Arrivals
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('deals')} className="text-white/70 hover:text-white transition-colors text-left">
                  Sale
                </button>
              </li>
            </ul>
          </div>

          {/* Contact / Support */}
          <div>
            <h4 className="font-semibold mb-2 sm:mb-4 text-white text-sm sm:text-base">Contact & Support</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <button type="button" onClick={() => onOpenContent('contact-us')} className="text-white/70 hover:text-white transition-colors text-left">
                  Contact Us
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenContent('shipping-returns')} className="text-white/70 hover:text-white transition-colors text-left">
                  Shipping & Returns
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenContent('faq')} className="text-white/70 hover:text-white transition-colors text-left">
                  FAQ
                </button>
              </li>
              {/* <li>
                <button type="button" onClick={() => onOpenContent('warranty')} className="text-white/70 hover:text-white transition-colors text-left">
                  Warranty
                </button>
              </li> */}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-2 sm:mb-4 text-white text-sm sm:text-base">Company</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <button type="button" onClick={() => onOpenContent('about-us')} className="text-white/70 hover:text-white transition-colors text-left">
                  About Us
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenContent('careers')} className="text-white/70 hover:text-white transition-colors text-left">
                  Careers
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenContent('privacy-policy')} className="text-white/70 hover:text-white transition-colors text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenContent('terms-of-service')} className="text-white/70 hover:text-white transition-colors text-left">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-4 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col items-center md:items-start gap-2 sm:gap-3">
            <p className="text-xs sm:text-sm text-white/70">
              © {currentYear} ClickSuq. All rights reserved.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="text-xs sm:text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              Site management
            </button>
            <a
  href="https://loomsolutions.net/"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 group"
>
  <div className="h-5 sm:h-6 w-5 sm:w-6 bg-white/10 rounded flex items-center justify-center group-hover:bg-white/20 transition-colors">
    <span className="text-white text-[8px] sm:text-[10px] font-bold">
      LS
    </span>
  </div>
  <span className="text-xs sm:text-sm text-white/70 group-hover:text-white transition-colors">
    Made by Loom Solutions
  </span>
</a>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="#"
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-white/70 hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
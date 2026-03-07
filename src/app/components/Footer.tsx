import { Facebook } from 'lucide-react';
import loomLogo from '../../assets/loomlogo.png';

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

            <a
              href="https://loomsolutions.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 group"
            >
              <img
                src={loomLogo}
                alt="Loom Solutions"
                className="h-10 sm:h-14 w-auto brightness-0 invert group-hover:opacity-80 transition-opacity"
              />
              <span className="text-xs sm:text-sm text-white/70 group-hover:text-white transition-colors">
                Made by Loom Solutions
              </span>
            </a>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="https://www.tiktok.com/@click_suq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
              aria-label="TikTok"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="h-5 w-5">
                <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z" />
              </svg>
            </a>
            <a
              href="https://t.me/clicksuq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Telegram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-2.25-1.46-3.52-1.09-4.88-2.67-.18-.21.05-.72.39-1.06 1.4-1.39 3.03-3.08 4.2-4.24.27-.27-.05-.4-.14-.3-.13.11-2.07 1.4-5.61 3.84-.6.41-1.14.63-1.63.62-.51-.01-1.52-.3-2.28-.55-.91-.3-1.64-.46-1.58-.97.03-.26.44-.52 1.25-.79 4.79-2.08 7.97-3.46 9.53-4.11 2.75-1.16 3.32-1.36 3.7-1.37.1 0 .32.02.43.14.09.1.12.24.11.39z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/share/1QFPGYLuzm/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
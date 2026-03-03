// ── Shared domain types ────────────────────────────────────────────────────

export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;

  // backend returns number, but keep string allowed for safety
  price: number | string;

  images: string[];
  category: string; // category slug
  brand: string;

  // ✅ dynamic from API
  rating?: number;
  reviewCount?: number;

  stock?: number;
  featured?: boolean;
  trending?: boolean;

  features?: string[];
  specs?: Record<string, string>;

  originalPrice?: number;

  /** 'new' = new product, 'used' = second-hand product */
  condition?: 'new' | 'used';
}
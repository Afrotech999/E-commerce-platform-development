import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Product } from '../types';

export function fetchProducts(params?: {
  categoryId?: string;
  search?: string;
  trending?: boolean;
  featured?: boolean;
}) {
  const sp = new URLSearchParams();
  if (params?.categoryId) sp.set('categoryId', params.categoryId);
  if (params?.search) sp.set('search', params.search);
  if (params?.trending) sp.set('trending', '1');
  if (params?.featured) sp.set('featured', '1');
  const q = sp.toString();
  return apiGet<Product[]>(`/products${q ? `?${q}` : ''}`, true);
}

export function fetchProduct(id: string): Promise<Product> {
  return apiGet<Product>(`/products/${id}`, true);
}

export function createProduct(data: Partial<Product> & { name: string; description: string; price: number; category: string }) {
  return apiPost<Product>('/products', {
    ...data,
    images: Array.isArray(data.images) ? data.images : (data.images as unknown as string)?.split?.(',').map((s: string) => s.trim()) || [],
  });
}

export function updateProduct(id: string, data: Partial<Product>) {
  return apiPut<Product>(`/products/${id}`, {
    ...data,
    images: data.images != null
      ? (Array.isArray(data.images) ? data.images : [data.images])
      : undefined,
  });
}

export function deleteProduct(id: string) {
  return apiDelete(`/products/${id}`);
}

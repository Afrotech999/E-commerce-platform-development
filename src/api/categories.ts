import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Category } from '../types';

export function fetchCategories(): Promise<Category[]> {
  return apiGet<Category[]>('/categories', true);
}

export function fetchCategory(slug: string): Promise<Category> {
  return apiGet<Category>(`/categories/${slug}`, true);
}

export function createCategory(data: { slug: string; name: string; image: string }) {
  return apiPost<Category>('/categories', data);
}

export function updateCategory(slug: string, data: Partial<{ name: string; image: string }>) {
  return apiPut<Category>(`/categories/${slug}`, data);
}

export function deleteCategory(slug: string) {
  return apiDelete(`/categories/${slug}`);
}

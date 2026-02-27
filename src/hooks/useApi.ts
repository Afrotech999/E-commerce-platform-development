import { useState, useEffect, useCallback } from 'react';
import * as categoriesApi from '../api/categories';
import * as productsApi from '../api/products';
import * as heroApi from '../api/hero';
import type { Category, Product } from '../types';
import type { HeroSlide } from '../api/hero';

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await categoriesApi.fetchCategories();
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load categories');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories: data, loading, error, refetch };
}

export function useProducts(params?: {
  categoryId?: string;
  search?: string;
  trending?: boolean;
  featured?: boolean;
}) {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await productsApi.fetchProducts(params);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [params?.categoryId, params?.search, params?.trending, params?.featured]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { products: data, loading, error, refetch };
}

export function useProduct(id: string | undefined) {
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    productsApi
      .fetchProduct(id)
      .then(setData)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load product');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { product: data, loading, error };
}

export function useHero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await heroApi.fetchHeroSlides();
      setSlides(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load hero');
      setSlides([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { slides, loading, error, refetch };
}

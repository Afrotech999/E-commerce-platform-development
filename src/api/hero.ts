// src/api/hero.ts
import { apiGet, apiPut } from './client';

export type HeroSlide = {
  id?: string;
  image: string;
  title: string;
  subtitle: string;
  cta?: string;
  link?: string;
};

export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const res = await apiGet<{ slides: HeroSlide[] }>('/hero', false);
  return Array.isArray(res?.slides) ? res.slides : [];
}

export async function updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
  const res = await apiPut<{ slides: HeroSlide[] }>('/hero', { slides });
  return Array.isArray(res?.slides) ? res.slides : [];
}
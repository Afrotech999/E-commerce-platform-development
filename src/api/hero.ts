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
  // backend returns HeroSlide[]
  const res = await apiGet<HeroSlide[]>('/hero', false);
  return Array.isArray(res) ? res : [];
}

export async function updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
  // if your backend PUT returns HeroSlide[] (recommended)
  const res = await apiPut<HeroSlide[]>('/hero', { slides });
  return Array.isArray(res) ? res : [];
}
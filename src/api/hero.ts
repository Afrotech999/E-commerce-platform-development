import { apiGet, apiPut } from './client';

export interface HeroSlide {
  id?: string;
  image: string;
  title: string;
  subtitle: string;
  cta?: string;
  link?: string;
}

export function fetchHeroSlides(): Promise<HeroSlide[]> {
  return apiGet<HeroSlide[]>('/hero', false);
}

export function updateHeroSlides(slides: HeroSlide[]): Promise<HeroSlide[]> {
  return apiPut<HeroSlide[]>('/hero', slides);
}

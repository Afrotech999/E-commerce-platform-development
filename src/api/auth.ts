import { apiPost, apiGet } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export function login(email: string, password: string) {
  return apiPost<AuthResponse>('/auth/login', { email, password }, false);
}

export function register(name: string, email: string, password: string) {
  return apiPost<AuthResponse>('/auth/register', { name, email, password }, false);
}

export function getMe() {
  return apiGet<User>('/auth/me', true).catch(() => null);
}

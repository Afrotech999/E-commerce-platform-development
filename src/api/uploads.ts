// src/api/uploads.ts
import { API_BASE } from './client';

function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Upload a single file (multipart) and return its public URL
 * Backend:
 *   POST  /api/uploads   (admin)
 *   GET   /uploads/*     (public static)
 *
 * Your API_BASE includes "/api", so:
 *   API_BASE = http://localhost:3001/api
 *   Upload endpoint = http://localhost:3001/api/uploads
 *   Public file base = http://localhost:3001/uploads/...
 */
export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);

  // API_BASE ends with "/api"
  const origin = API_BASE.replace(/\/api\/?$/, '');

  const token = getToken();

  const res = await fetch(`${origin}/api/uploads`, {
    method: 'POST',
    body: fd,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Upload failed (${res.status})`);
  }

  const json: any = await res.json().catch(() => ({}));

  // accept multiple backend response shapes
  const urlOrPath =
    json?.url ??
    json?.data?.url ??
    json?.path ??
    json?.data?.path;

  if (!urlOrPath || typeof urlOrPath !== 'string') {
    throw new Error('Upload failed: server did not return url/path');
  }

  // if backend returns "/uploads/xxx.jpg"
  if (urlOrPath.startsWith('/')) return `${origin}${urlOrPath}`;

  // if backend returns "uploads/xxx.jpg"
  if (!/^https?:\/\//i.test(urlOrPath) && urlOrPath.startsWith('uploads/')) {
    return `${origin}/${urlOrPath}`;
  }

  return urlOrPath;
}

/**
 * ✅ Alias for older components that import `uploadImage`
 * (HeroAdmin.tsx is importing uploadImage)
 */
export const uploadImage = uploadFile;
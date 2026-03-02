// src/api/uploads.ts
import { API_BASE } from './client';

function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Upload a single file and return its public URL.
 * Backend returns: { status: true, urls: string[] }
 */
export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();

  // ✅ MUST match Laravel: $request->file('files')
  fd.append('files', file);

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

  // ✅ Your Laravel controller returns `urls`
  const url =
    (Array.isArray(json?.urls) && json.urls[0]) ||
    json?.url ||
    json?.data?.url ||
    json?.path ||
    json?.data?.path;

  if (!url || typeof url !== 'string') {
    throw new Error('Upload failed: server did not return url/path');
  }

  // If backend returns "/storage/uploads/xxx.jpg"
  if (url.startsWith('/')) return `${origin}${url}`;

  // If backend returns "storage/uploads/xxx.jpg"
  if (!/^https?:\/\//i.test(url) && url.startsWith('storage/')) {
    return `${origin}/${url}`;
  }

  return url;
}

/** ✅ Alias for older components */
export const uploadImage = uploadFile;
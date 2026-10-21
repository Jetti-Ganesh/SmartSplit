const envApiUrl = import.meta.env.VITE_API_URL;
const isProd = import.meta.env.PROD;
const fallbackOrigin = isProd ? 'https://smart-split-flame.vercel.app' : 'http://localhost:5000';
const apiOrigin = (envApiUrl || fallbackOrigin).replace(/\/+$/, '');

export const API_BASE_URL = `${apiOrigin}/api`;

export function apiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiOrigin}${cleanPath}`;
}

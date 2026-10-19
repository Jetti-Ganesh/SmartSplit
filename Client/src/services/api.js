const apiOrigin = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

export const API_BASE_URL = `${apiOrigin}/api`

export function apiUrl(path) {
  return `${apiOrigin}${path.startsWith('/') ? path : `/${path}`}`
}

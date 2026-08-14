const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options })
  const body = response.status === 204 ? null : await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Request failed.')
  return body
}

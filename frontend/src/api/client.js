const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

let authToken = null

export const setAuthToken = (token) => {
  authToken = token
}

export const clearAuthToken = () => {
  authToken = null
}

function errorMessage(payload) {
  const validationMessages = Array.isArray(payload?.errors)
    ? payload.errors.map((error) => error?.message).filter(Boolean)
    : []

  return validationMessages.join(' ') || payload?.message || 'We could not complete that request.'
}

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...options,
      headers,
    })
  } catch {
    throw new Error('Unable to reach InternX. Check that the API is running.')
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(errorMessage(payload))

  return payload
}

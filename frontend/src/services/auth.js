import { api, setAuthToken, clearAuthToken } from '../api'

export async function login(email, password) {
  const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
  if (res.accessToken || res.token) setAuthToken(res.accessToken || res.token)
  return res
}

export async function register(payload) {
  const res = await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
  if (res.accessToken || res.token) setAuthToken(res.accessToken || res.token)
  return res
}

export async function me() {
  return api('/auth/me')
}

export async function logout() {
  clearAuthToken()
  return api('/auth/logout', { method: 'POST' })
}

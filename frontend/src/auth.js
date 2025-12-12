
import API from './api'

export async function login(email, password) {
  const res = await API.post('/auth/login', { email, password })
  localStorage.setItem('access_token', res.data.access_token)
  localStorage.setItem('refresh_token', res.data.refresh_token)
  return res.data
}

export async function register(email, password) {
  const res = await API.post('/auth/register', { email, password })
  return res.data
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

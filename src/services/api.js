import { getSession, logout } from './session'
const BASE = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')
export async function api(path, { method = 'GET', body, signal, authenticated = true } = {}) {
  const token = authenticated ? getSession()?.token : null
  let response
  try {
    response = await fetch(`${BASE}${path}`, { method, signal,
      headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}) })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error('No se pudo conectar con el servidor. Intenta nuevamente.')
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401 && authenticated && getSession()?.token === token) logout()
    const messages = { 401: 'Credenciales inválidas o sesión vencida.', 403: 'No tienes permisos para esta operación.', 404: 'Recurso no encontrado.', 409: 'Hay datos duplicados o relacionados.' }
    const err = new Error(data?.detalle || data?.message || data?.error || messages[response.status] || 'No se pudo completar la operación.')
    err.status = response.status
    throw err
  }
  return data
}

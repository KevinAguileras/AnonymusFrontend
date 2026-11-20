import { api } from './api'
import { saveSession, getSession } from './session'
async function authenticate(path, credentials) {
  const result = await api(`/auth/${path}`, { method: 'POST', body: credentials, authenticated: false })
  saveSession({ ...result, email: credentials.email })
  return result
}
export const login = (credentials) => authenticate('login', credentials)
export const register = (credentials) => authenticate('registro', credentials)
export const getAccount = (options) => api('/cuenta', options)
export async function updateAccount(nombre) {
  const account = await api('/cuenta', { method: 'PUT', body: { nombre } })
  const session = getSession()
  if (session) saveSession({ ...session, ...account })
  return account
}

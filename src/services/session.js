const KEY = 'anonymusSession'
export function getSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY))
    const p = JSON.parse(atob(s.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return Number.isFinite(p.exp) && p.exp * 1000 > Date.now() ? s : null
  } catch { return null }
}
export function saveSession(data) {
  const { token, nombre, email, rol } = data
  sessionStorage.setItem(KEY, JSON.stringify({ token, nombre, email, rol }))
  localStorage.removeItem('usuarioActivo'); localStorage.removeItem('usuarios')
  window.dispatchEvent(new Event('authUpdated'))
}
export function logout() {
  sessionStorage.removeItem(KEY); localStorage.removeItem('usuarioActivo')
  window.dispatchEvent(new Event('authUpdated'))
}

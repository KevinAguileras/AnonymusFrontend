import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import useSession from '../hooks/useSession'
import { getAccount } from '../services/authService'
import { saveSession } from '../services/session'
export default function ProtectedRoute({ roles, children }) {
  const session = useSession()
  const token = session?.token
  const [verified, setVerified] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    setError('')
    getAccount({ signal: controller.signal }).then((account) => {
      if (!controller.signal.aborted) { saveSession({ token, ...account }); setVerified({ token, rol: account.rol }) }
    }).catch((err) => { if (!controller.signal.aborted) setError(err.message) })
    return () => controller.abort()
  }, [token])
  if (!session) return <Navigate to="/login" replace />
  if (error) return <div role="alert" className="alert alert-danger">{error}</div>
  if (verified?.token !== token) return <p role="status">Verificando sesión…</p>
  if (roles && !roles.includes(verified.rol)) return <div role="alert" className="alert alert-warning">No tienes permisos para acceder a esta página.</div>
  return children
}

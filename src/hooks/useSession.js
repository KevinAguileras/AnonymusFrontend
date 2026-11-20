import { useEffect, useState } from 'react'
import { getSession } from '../services/session'
export default function useSession() {
  const [session, setSession] = useState(getSession)
  useEffect(() => {
    const update = () => setSession(getSession())
    window.addEventListener('authUpdated', update); window.addEventListener('storage', update)
    const timer = setInterval(update, 1000)
    return () => { window.removeEventListener('authUpdated', update); window.removeEventListener('storage', update); clearInterval(timer) }
  }, [])
  return session
}

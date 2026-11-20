import { useState } from 'react'
import { api } from '../services/api'
import useResource from '../hooks/useResource'
import ResourceStatus from '../components/ResourceStatus'
const load = () => api('/admin/usuarios')
export default function Users() {
  const { data, loading, error } = useResource(load)
  const [updated, setUpdated] = useState({})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const change = async (user, rol) => {
    if (!window.confirm(`¿Cambiar el rol de ${user.nombre} a ${rol}?`)) return
    setBusy(true); setMessage('')
    try {
      const result = await api(`/admin/usuarios/${user.id}/rol`, { method: 'PUT', body: { rol } })
      setUpdated((old) => ({ ...old, [user.id]: result.rol })); setMessage('Rol actualizado. El usuario debe volver a iniciar sesión para actualizar su menú.')
    } catch (err) { setMessage(err.message) }
    finally { setBusy(false) }
  }
  return <section><h2>Usuarios</h2><ResourceStatus loading={loading} error={error} />{message && <p role="status">{message}</p>}
    <table className="table"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr></thead><tbody>{data.map((u) => <tr key={u.id}><td>{u.nombre}</td><td>{u.email}</td><td><select aria-label={`Rol de ${u.nombre}`} disabled={busy} value={updated[u.id] || u.rol} onChange={(e) => change(u, e.target.value)}>{['ADMINISTRADOR','VENDEDOR','CLIENTE'].map((role) => <option key={role}>{role}</option>)}</select></td></tr>)}</tbody></table>
  </section>
}

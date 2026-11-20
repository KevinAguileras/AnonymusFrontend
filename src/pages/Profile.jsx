import { useState } from 'react'
import useSession from '../hooks/useSession'
import { updateAccount } from '../services/authService'
export default function Profile() {
  const user = useSession()
  const [nombre, setNombre] = useState(user?.nombre || '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const save = async (event) => {
    event.preventDefault()
    if (busy) return
    setError(''); setMessage(''); setBusy(true)
    try { await updateAccount(nombre.trim()); setMessage('Datos actualizados correctamente.') }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  return <section><h2>Mi perfil</h2><form className="card p-4" onSubmit={save}>
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    {message && <p role="status" className="alert alert-success">{message}</p>}
    <div className="grupo-input"><label>Nombre</label><input value={nombre} required onChange={(e) => setNombre(e.target.value)} /></div>
    <div className="grupo-input"><label>Correo</label><input value={user?.email || ''} readOnly /></div>
    <p>Rol: {user?.rol}</p><button className="btn btn-primary" disabled={busy}>Guardar cambios</button>
  </form></section>
}

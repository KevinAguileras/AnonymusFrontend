import { register } from '../services/authService'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    if (!form.nombre || !form.email || !form.password) {
      setError('Todos los campos son obligatorios.')
      return
    }
    if (busy) return
    setBusy(true); setError('')
    try { await register({ ...form, nombre: form.nombre.trim(), email: form.email.trim() }); navigate('/perfil') }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  return (
    <section className="d-flex justify-content-center">
      <form className="login-caja" onSubmit={submit}>
        <h2>Crear cuenta</h2>
        <p>Regístrate en TecnoShop</p>
        {error && <div className="alerta-error">{error}</div>}
        <div className="grupo-input"><label>Nombre</label><input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} /></div>
        <div className="grupo-input"><label>Correo</label><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
        <div className="grupo-input"><label>Contraseña</label><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></div>
        <button className="btn-primario" type="submit" disabled={busy}>Registrarme</button>
        <Link className="btn-secundario mt-2" to="/login">Ya tengo una cuenta</Link>
      </form>
    </section>
  )
}

export default Register

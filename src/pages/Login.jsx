import { login } from '../services/authService'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError('Ingresa un correo y contraseña para continuar.')
      return
    }
    if (busy) return
    setBusy(true); setError('')
    try { await login({ email: email.trim(), password }); navigate('/perfil') }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  return (
    <section className="d-flex justify-content-center">
      <form className="login-caja" onSubmit={submit}>
        <h2>Iniciar sesión</h2>
        <p>Accede a tu cuenta TecnoShop</p>
        {error && <div className="alerta-error">{error}</div>}
        <div className="grupo-input"><label>Correo</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
        <div className="grupo-input"><label>Contraseña</label><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
        <button className="btn-primario" type="submit" disabled={busy}>Ingresar</button>
        <Link className="btn-secundario mt-2" to="/registro">Crear cuenta</Link>
      </form>
    </section>
  )
}

export default Login

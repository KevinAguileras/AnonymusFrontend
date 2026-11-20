import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartTotal, clearCart, getCart } from '../services/cartService'
import { purchase } from '../services/orderService'
export default function Checkout() {
  const navigate = useNavigate()
  const [cart] = useState(getCart)
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    if (pending.current) return
    pending.current = true; setBusy(true); setError('')
    try {
      const order = await purchase(cart)
      clearCart(); window.dispatchEvent(new Event('cartUpdated'))
      navigate('/compra-exitosa', { state: { total: order.total, orderId: order.id } })
    } catch (err) { setError(err.message) }
    finally { pending.current = false; setBusy(false) }
  }
  if (!cart.length) return <p>No tienes productos para comprar. <Link to="/productos">Volver al catálogo</Link></p>
  return <section><h2>Confirmar compra</h2><form className="card p-4" onSubmit={submit}>
    <p>Demostración académica: registra una compra sin realizar un cobro real.</p>
    <ul>{cart.map((item) => <li key={item.id}>{item.nombre} × {item.cantidad}</li>)}</ul>
    <p>Total estimado: ${Number(cartTotal(cart)).toLocaleString('es-CL')}. El servidor confirma los precios y el stock.</p>
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    <button className="btn btn-primary" disabled={busy}>{busy ? 'Registrando…' : 'Confirmar compra'}</button>
    <Link to="/carrito">Volver al carrito</Link>
  </form></section>
}

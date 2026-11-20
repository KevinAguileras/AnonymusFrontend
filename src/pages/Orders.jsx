import { useState } from 'react'
import useResource from '../hooks/useResource'
import ResourceStatus from '../components/ResourceStatus'
import { getOrders, getOrder } from '../services/orderService'
export default function Orders() {
  const { data: orders, loading, error } = useResource(getOrders)
  const [detail, setDetail] = useState(null)
  const [detailError, setDetailError] = useState('')
  const [busy, setBusy] = useState(false)
  const show = async (id) => {
    setDetail(null); setDetailError(''); setBusy(true)
    try { setDetail(await getOrder(id)) } catch (err) { setDetailError(err.message) }
    finally { setBusy(false) }
  }
  return <section><h2>Órdenes de compra</h2><ResourceStatus loading={loading} error={error} />
    {!loading && !error && !orders.length && <p>No hay compras registradas.</p>}
    <table className="table"><thead><tr><th>Boleta</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>
    {orders.map((o) => <tr key={o.id}><td>#{o.id}</td><td>{new Date(o.fecha).toLocaleString('es-CL')}</td><td>${Number(o.total).toLocaleString('es-CL')}</td><td>{o.estado}</td><td><button disabled={busy} onClick={() => show(o.id)}>Ver detalle</button></td></tr>)}
    </tbody></table><ResourceStatus loading={busy} error={detailError} />
    {detail && <div className="card p-3"><h3>Boleta #{detail.boleta.id}</h3><ul>{detail.detalles.map((d) => <li key={d.id}>{d.producto.nombre} × {d.cantidad} — ${Number(d.precioUnitario).toLocaleString('es-CL')} c/u</li>)}</ul></div>}
  </section>
}

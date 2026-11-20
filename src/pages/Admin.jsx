import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createProduct, deleteProduct, getProducts, updateProduct, getCategories, createCategory, updateCategory, deleteCategory } from '../services/productService'
import useSession from '../hooks/useSession'
const empty = { id: null, nombre: '', categoriaId: '', precio: '', stock: '0', img: '', oferta: false, precioAnterior: '' }
export default function Admin() {
  const admin = useSession()?.rol === 'ADMINISTRADOR'
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(empty)
  const [category, setCategory] = useState({ id: null, nombre: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const refresh = async () => {
    const [p, c] = await Promise.all([getProducts(), getCategories()])
    setProducts(p); setCategories(c)
  }
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getProducts({ signal: controller.signal }), getCategories({ signal: controller.signal })])
      .then(([p, c]) => { if (!controller.signal.aborted) { setProducts(p); setCategories(c) } })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const operation = async (action, text) => {
    if (busy) return
    setBusy(true); setError(''); setMessage('')
    try { await action(); setMessage(text); await refresh() }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }
  const save = (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || Number(form.precio) <= 0 || !form.categoriaId || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      setError('Completa el nombre, categoría, precio mayor a 0 y stock válido.'); return
    }
    operation(async () => { if (form.id) await updateProduct(form); else await createProduct(form); setForm(empty) }, 'Producto guardado correctamente.')
  }
  return <section><h2>{admin ? 'Panel administrativo' : 'Productos'}</h2>
    {loading && <p role="status">Cargando…</p>}
    {error && <p role="alert" className="alert alert-danger">{error}</p>}
    {message && <p role="status" className="alert alert-success">{message}</p>}
    {admin && <div className="row g-4"><div className="col-lg-6"><form className="card p-3" onSubmit={save}>
      <h3>{form.id ? `Editar #${form.id}` : 'Nuevo producto'}</h3>
      <fieldset disabled={busy || loading}>
      <div className="grupo-input"><label>Nombre</label><input name="nombre" value={form.nombre} onChange={change} /></div>
      <div className="grupo-input"><label>Categoría</label><select name="categoriaId" value={form.categoriaId} onChange={change}><option value="">Seleccionar</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
      <div className="grupo-input"><label>Precio</label><input type="number" name="precio" value={form.precio} onChange={change} /></div>
      <div className="grupo-input"><label>Stock</label><input type="number" name="stock" min="0" step="1" value={form.stock} onChange={change} /></div>
      <div className="grupo-input"><label>Ruta de imagen</label><input name="img" value={form.img} onChange={change} /></div>
      <div className="grupo-input"><label>Precio anterior</label><input type="number" name="precioAnterior" value={form.precioAnterior ?? ''} onChange={change} /></div>
      <label><input name="oferta" type="checkbox" checked={form.oferta} onChange={change} /> Oferta</label>
      <button className="btn btn-primary" type="submit">{form.id ? 'Guardar cambios' : 'Crear producto'}</button>
      {form.id && <button type="button" onClick={() => setForm(empty)}>Cancelar edición</button>}
      </fieldset></form></div>
      <div className="col-lg-6"><form className="card p-3" onSubmit={(e) => {
        e.preventDefault()
        if (!category.nombre.trim()) return
        operation(async () => { if (category.id) await updateCategory(category.id, category.nombre); else await createCategory(category.nombre); setCategory({ id: null, nombre: '' }) }, 'Categoría guardada.')
      }}><h3>Categorías</h3><label htmlFor="categoryName">Nombre de categoría</label>
      <input id="categoryName" value={category.nombre} onChange={(e) => setCategory({ ...category, nombre: e.target.value })} required />
      <button disabled={busy || loading}>{category.id ? 'Guardar categoría' : 'Crear categoría'}</button>
      {category.id && <button type="button" onClick={() => setCategory({ id: null, nombre: '' })}>Cancelar</button>}
      </form><ul>{categories.map((c) => <li key={c.id}>{c.nombre} <button disabled={busy} onClick={() => setCategory(c)}>Editar categoría</button> <button disabled={busy} onClick={() => {
        if (window.confirm('¿Eliminar esta categoría?')) operation(() => deleteCategory(c.id), 'Categoría eliminada.')
      }}>Eliminar categoría</button></li>)}</ul></div></div>}
    <div className="table-responsive mt-4"><table className="table"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>
    {products.map((p) => <tr key={p.id}><td>{p.nombre}</td><td>{p.categoria}</td><td>${Number(p.precio).toLocaleString('es-CL')}</td><td>{p.stock}</td><td>
      <Link to={`/producto/${p.id}`}>Detalle</Link> {admin && <><button disabled={busy} onClick={() => setForm(p)}>Editar</button> <button disabled={busy} onClick={() => {
        if (window.confirm('¿Eliminar este producto?')) operation(() => deleteProduct(p.id), 'Producto eliminado.')
      }}>Eliminar</button></>}</td></tr>)}
    </tbody></table>{!loading && !error && !products.length && <p>Todavía no hay productos. Crea una categoría y luego un producto.</p>}</div>
  </section>
}

import fallbackImage from '../assets/LogoTienda.jpg'
import { api } from './api'
function normalize(p) {
  return { ...p, categoriaId: p.categoria.id, categoria: p.categoria.nombre, img: p.img ? (p.img.startsWith('/images/') ? `${import.meta.env.BASE_URL}${p.img.slice(1)}` : p.img) : fallbackImage }
}
function payload(p) {
  return { nombre: p.nombre.trim(), categoriaId: Number(p.categoriaId), precio: Number(p.precio), img: p.img,
    oferta: Boolean(p.oferta), precioAnterior: p.oferta && p.precioAnterior !== '' && p.precioAnterior != null ? Number(p.precioAnterior) : null, stock: Number(p.stock) }
}
export const getProducts = async (options) => (await api('/productos', options)).map(normalize)
export const getProductById = async (id, options) => normalize(await api(`/productos/${id}`, options))
export const createProduct = async (p) => normalize(await api('/productos', { method: 'POST', body: payload(p) }))
export const updateProduct = async (p) => normalize(await api(`/productos/${p.id}`, { method: 'PUT', body: payload(p) }))
export const deleteProduct = (id) => api(`/productos/${id}`, { method: 'DELETE' })
export const getCategories = (options) => api('/categorias', options)
export const createCategory = (nombre) => api('/categorias', { method: 'POST', body: { nombre: nombre.trim() } })
export const updateCategory = (id, nombre) => api(`/categorias/${id}`, { method: 'PUT', body: { nombre: nombre.trim() } })
export const deleteCategory = (id) => api(`/categorias/${id}`, { method: 'DELETE' })

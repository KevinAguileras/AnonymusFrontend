import { api } from './api'
export const getOrders = (options) => api('/boletas', options)
export const getOrder = (id, options) => api(`/boletas/${id}`, options)
export const purchase = (cart) => api('/boletas', { method: 'POST', body: { items: cart.map(({ id, cantidad }) => ({ productoId: Number(id), cantidad })) } })

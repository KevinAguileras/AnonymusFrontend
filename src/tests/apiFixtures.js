import { productosIniciales } from '../data/productos'
export const categories = ['notebooks', 'perifericos', 'monitores', 'componentes'].map((nombre, i) => ({ id: i + 1, nombre }))
export const products = productosIniciales.map((p) => ({ ...p, stock: 10, categoria: categories.find((c) => c.nombre === p.categoria) }))
export const token = (exp = Math.floor(Date.now() / 1000) + 3600) => `e30.${btoa(JSON.stringify({ sub: 'ana@example.test', exp }))}.test`
export const session = (rol = 'CLIENTE') => ({ token: token(), nombre: 'Ana', email: 'ana@example.test', rol })
export const response = (data, status = 200) => Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(data) })
export function mockCatalog() {
  return spyOn(window, 'fetch').and.callFake((url) => {
    if (url === '/api/v1/productos') return response(products)
    if (url === '/api/v1/categorias') return response(categories)
    const id = Number(url.split('/').at(-1))
    const product = products.find((p) => p.id === id)
    return product ? response(product) : response({ error: 'Producto no encontrado.' }, 404)
  })
}

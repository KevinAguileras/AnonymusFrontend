import { mockCatalog } from './apiFixtures'
import { esperar } from './ayudas'
import React from 'react'
import { enviarFormulario, montar, simularLocalStorage } from './ayudas'
import Categories from '../pages/Categories'
import Offers from '../pages/Offers'
import Home from '../pages/Home'
import Contact from '../pages/Contact'
import PurchaseResult from '../pages/PurchaseResult'
import About from '../pages/About'
import Blogs from '../pages/Blogs'
import Layout from '../components/Layout'
import { productosIniciales } from '../data/productos'

describe('Páginas informativas', () => {
  let pagina

  beforeEach(() => {
    simularLocalStorage()
    mockCatalog()
  })

  afterEach(() => pagina.desmontar())

  it('Categories debe mostrar las 4 categorías con enlace al catálogo filtrado', async () => {
    pagina = montar(<Categories />)
    await esperar()
    expect(pagina.contenedor.querySelectorAll('.product-card').length).toBe(4)
    expect(pagina.contenedor.querySelector('a[href="/productos?categoria=monitores"]')).not.toBeNull()
  })

  it('Offers debe mostrar solo los productos en oferta', async () => {
    pagina = montar(<Offers />)
    await esperar()
    const enOferta = productosIniciales.filter((producto) => producto.oferta).length
    expect(pagina.contenedor.querySelectorAll('.product-card').length).toBe(enOferta)
  })

  it('Home debe mostrar productos destacados', async () => {
    pagina = montar(<Home />)
    await esperar()
    expect(pagina.contenedor.textContent).toContain('Productos Destacados')
    expect(pagina.contenedor.querySelectorAll('.product-card').length).toBeGreaterThan(0)
  })

  it('Contact debe mostrar la confirmación al enviar el formulario', async () => {
    pagina = montar(<Contact />)
    await esperar()
    expect(pagina.contenedor.textContent).not.toContain('Mensaje enviado correctamente')
    enviarFormulario(pagina.contenedor.querySelector('form'))
    expect(pagina.contenedor.textContent).toContain('Mensaje enviado correctamente')
  })

  it('PurchaseResult debe mostrar el total cuando la compra fue exitosa', async () => {
    pagina = montar(<PurchaseResult success />, { ruta: { pathname: '/compra-exitosa', state: { total: 25000, orderId: 5 } } })
    await esperar()
    expect(pagina.contenedor.textContent).toContain('Compra realizada')
    expect(pagina.contenedor.textContent).toContain('$25.000')
  })

  it('PurchaseResult debe ofrecer volver al carrito cuando el pago falla', async () => {
    pagina = montar(<PurchaseResult success={false} />, { ruta: '/compra-fallida' })
    await esperar()
    expect(pagina.contenedor.textContent).toContain('No se pudo realizar el pago')
    expect(pagina.contenedor.querySelector('a[href="/carrito"]')).not.toBeNull()
  })

  it('About debe presentar a la tienda', async () => {
    pagina = montar(<About />)
    await esperar()
    expect(pagina.contenedor.querySelector('h1').textContent).toBe('Nosotros')
  })

  it('Blogs debe mostrar una tarjeta por cada artículo', async () => {
    pagina = montar(<Blogs />)
    await esperar()
    expect(pagina.contenedor.querySelectorAll('.blog-card').length).toBe(3)
  })

  it('Layout debe mostrar el encabezado, el contenido y el pie de página', async () => {
    pagina = montar(<Layout><p id="contenido-prueba">Hola</p></Layout>)
    await esperar()
    expect(pagina.contenedor.querySelector('header')).not.toBeNull()
    expect(pagina.contenedor.querySelector('#contenido-prueba')).not.toBeNull()
    expect(pagina.contenedor.querySelector('footer')).not.toBeNull()
  })
})

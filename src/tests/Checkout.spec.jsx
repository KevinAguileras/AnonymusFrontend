import React from 'react'
import { response, session } from './apiFixtures'
import { enviarFormulario, montar, simularLocalStorage, esperar } from './ayudas'
import Checkout from '../pages/Checkout'
const cart=[{id:1,nombre:'Mouse',precio:1,cantidad:2}]
describe('Compra REST', () => {
  let pagina, memoria, fetchMock
  beforeEach(() => { sessionStorage.setItem('anonymusSession',JSON.stringify(session())); memoria=simularLocalStorage({tecnoShopCart:JSON.stringify(cart)}); fetchMock=spyOn(window,'fetch'); pagina=montar(<Checkout />,{ruta:'/checkout'}) })
  afterEach(() => { pagina.desmontar(); sessionStorage.clear() })
  it('envía solo IDs y cantidades y usa el total confirmado por el servidor', async () => {
    fetchMock.and.returnValue(response({id:9,total:10000},201)); enviarFormulario(pagina.contenedor.querySelector('form')); await esperar()
    expect(JSON.parse(fetchMock.calls.mostRecent().args[1].body)).toEqual({items:[{productoId:1,cantidad:2}]})
    expect(memoria.tecnoShopCart).toBeUndefined(); expect(pagina.rutaActual()).toBe('/compra-exitosa')
  })
  it('conserva el carrito si falta stock', async () => {
    fetchMock.and.returnValue(response({error:'Stock insuficiente'},400)); enviarFormulario(pagina.contenedor.querySelector('form')); await esperar()
    expect(memoria.tecnoShopCart).toBeDefined(); expect(pagina.rutaActual()).toBe('/checkout'); expect(pagina.contenedor.textContent).toContain('Stock insuficiente')
  })
  it('evita un segundo envío mientras la compra está pendiente', async () => {
    let resolve
    fetchMock.and.returnValue(new Promise((r) => { resolve=r }))
    enviarFormulario(pagina.contenedor.querySelector('form')); enviarFormulario(pagina.contenedor.querySelector('form'))
    expect(fetchMock.calls.count()).toBe(1)
    resolve(await response({id:9,total:10000},201)); await esperar()
  })
})

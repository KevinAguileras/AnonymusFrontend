import React from 'react'
import { products, categories, response, session } from './apiFixtures'
import { montar, esperar, campoDeEtiqueta, escribir, enviarFormulario, clic, botonConTexto, simularLocalStorage } from './ayudas'
import Admin from '../pages/Admin'
describe('Administración conectada a REST', () => {
  let pagina, items
  beforeEach(() => {
    simularLocalStorage(); sessionStorage.setItem('anonymusSession',JSON.stringify(session('ADMINISTRADOR'))); items=[]
    spyOn(window,'fetch').and.callFake((url,options) => {
      if (url==='/api/v1/categorias') return response(categories)
      if (options.method==='POST') { const item={...JSON.parse(options.body),id:50,categoria:categories[1]}; items.push(item); return response(item,201) }
      if (options.method==='DELETE') { items=[]; return response(null,204) }
      return response(items)
    })
  })
  afterEach(() => { pagina?.desmontar(); sessionStorage.clear() })
  it('crea y vuelve a consultar productos persistidos', async () => {
    pagina=montar(<Admin />); await esperar()
    escribir(campoDeEtiqueta(pagina.contenedor,'Nombre'),'Mouse'); escribir(campoDeEtiqueta(pagina.contenedor,'Precio'),'5000'); escribir(campoDeEtiqueta(pagina.contenedor,'Categoría'),'2'); escribir(campoDeEtiqueta(pagina.contenedor,'Stock'),'4')
    enviarFormulario(pagina.contenedor.querySelector('form')); await esperar()
    expect(pagina.contenedor.querySelector('tbody').textContent).toContain('Mouse'); expect(pagina.contenedor.textContent).toContain('Producto guardado correctamente')
  })
  it('elimina solo tras confirmar y refresca el catálogo', async () => {
    items=[products[0]]; spyOn(window,'confirm').and.returnValue(true); pagina=montar(<Admin />); await esperar()
    const remove=Array.from(pagina.contenedor.querySelectorAll('tbody button')).find((b)=>b.textContent==='Eliminar')
    clic(remove); await esperar(); expect(pagina.contenedor.querySelector('tbody').textContent).toBe('')
  })
  it('vendedor ve productos pero no formularios ni botones de edición', async () => {
    sessionStorage.setItem('anonymusSession',JSON.stringify(session('VENDEDOR'))); items=[products[0]]; pagina=montar(<Admin />); await esperar()
    expect(pagina.contenedor.querySelector('form')).toBeNull(); expect(botonConTexto(pagina.contenedor,'Eliminar')).toBeUndefined()
    expect(pagina.contenedor.querySelector('tbody').textContent).toContain(products[0].nombre)
  })
})

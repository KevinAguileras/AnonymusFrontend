import React from 'react'
import { session, response } from './apiFixtures'
import { campoDeEtiqueta, escribir, enviarFormulario, montar, simularLocalStorage, esperar } from './ayudas'
import Profile from '../pages/Profile'
describe('Perfil persistente', () => {
  let pagina
  beforeEach(() => { simularLocalStorage(); sessionStorage.setItem('anonymusSession',JSON.stringify(session())); pagina=montar(<Profile />) })
  afterEach(() => { pagina.desmontar(); sessionStorage.clear() })
  it('guarda el nombre mediante la API', async () => {
    spyOn(window,'fetch').and.returnValue(response({nombre:'Ana nueva',email:'ana@example.test',rol:'CLIENTE'}))
    escribir(campoDeEtiqueta(pagina.contenedor,'Nombre'),'Ana nueva'); enviarFormulario(pagina.contenedor.querySelector('form')); await esperar()
    expect(window.fetch.calls.mostRecent().args[0]).toBe('/api/v1/cuenta')
    expect(pagina.contenedor.textContent).toContain('Datos actualizados correctamente')
    expect(JSON.parse(sessionStorage.getItem('anonymusSession')).nombre).toBe('Ana nueva')
  })
  it('no muestra éxito si la actualización falla', async () => {
    spyOn(window,'fetch').and.returnValue(response({error:'No disponible'},500))
    enviarFormulario(pagina.contenedor.querySelector('form')); await esperar()
    expect(pagina.contenedor.textContent).not.toContain('Datos actualizados correctamente')
  })
})

import React from 'react'
import { campoDeEtiqueta, escribir, enviarFormulario, montar, simularLocalStorage, esperar } from './ayudas'
import { response, session } from './apiFixtures'
import Register from '../pages/Register'
describe('Registro REST', () => {
  let pagina, memoria, fetchMock
  beforeEach(() => { sessionStorage.clear(); memoria = simularLocalStorage(); fetchMock = spyOn(window, 'fetch'); pagina = montar(<Register />, { ruta: '/registro' }) })
  afterEach(() => { pagina.desmontar(); sessionStorage.clear() })
  function submit() { for (const [label,value] of [['Nombre','Ana'],['Correo','ana@example.test'],['Contraseña','Prueba123']]) escribir(campoDeEtiqueta(pagina.contenedor,label),value); enviarFormulario(pagina.contenedor.querySelector('form')) }
  it('valida campos vacíos', () => { enviarFormulario(pagina.contenedor.querySelector('form')); expect(fetchMock).not.toHaveBeenCalled() })
  it('registra por API y no almacena contraseñas', async () => {
    fetchMock.and.returnValue(response(session(),201)); submit(); await esperar()
    expect(fetchMock.calls.mostRecent().args[0]).toBe('/api/v1/auth/registro')
    expect(memoria.usuarios).toBeUndefined(); expect(pagina.rutaActual()).toBe('/perfil')
    expect(sessionStorage.getItem('anonymusSession')).not.toContain('Prueba123')
  })
  it('muestra el conflicto de correo duplicado', async () => {
    fetchMock.and.returnValue(response({error:'Correo registrado'},409)); submit(); await esperar()
    expect(pagina.contenedor.textContent).toContain('Correo registrado'); expect(pagina.rutaActual()).toBe('/registro')
  })
})

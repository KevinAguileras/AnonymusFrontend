import React from 'react'
import { campoDeEtiqueta, escribir, enviarFormulario, montar, simularLocalStorage, esperar } from './ayudas'
import { response, session } from './apiFixtures'
import Login from '../pages/Login'
describe('Login REST', () => {
  let pagina, memoria, fetchMock
  beforeEach(() => { sessionStorage.clear(); memoria = simularLocalStorage(); fetchMock = spyOn(window, 'fetch'); pagina = montar(<Login />, { ruta: '/login' }) })
  afterEach(() => { pagina.desmontar(); sessionStorage.clear() })
  function submit() { escribir(campoDeEtiqueta(pagina.contenedor, 'Correo'), 'ana@example.test'); escribir(campoDeEtiqueta(pagina.contenedor, 'Contraseña'), 'Prueba123'); enviarFormulario(pagina.contenedor.querySelector('form')) }
  it('no envía campos vacíos', () => { enviarFormulario(pagina.contenedor.querySelector('form')); expect(fetchMock).not.toHaveBeenCalled() })
  it('envía credenciales y guarda solo sesión, sin contraseña', async () => {
    fetchMock.and.returnValue(response(session())); submit(); await esperar()
    expect(fetchMock.calls.mostRecent().args[0]).toBe('/api/v1/auth/login')
    expect(JSON.parse(fetchMock.calls.mostRecent().args[1].body).password).toBe('Prueba123')
    expect(sessionStorage.getItem('anonymusSession')).not.toContain('Prueba123')
    expect(memoria.usuarios).toBeUndefined(); expect(pagina.rutaActual()).toBe('/perfil')
  })
  it('no inicia sesión con contraseña incorrecta', async () => {
    fetchMock.and.returnValue(response({ error: 'Credenciales inválidas' }, 401)); submit(); await esperar()
    expect(pagina.rutaActual()).toBe('/login'); expect(sessionStorage.getItem('anonymusSession')).toBeNull()
    expect(pagina.contenedor.textContent).toContain('Credenciales inválidas')
  })
  it('informa cuando no hay conexión', async () => {
    fetchMock.and.rejectWith(new TypeError('Failed to fetch')); submit(); await esperar()
    expect(pagina.contenedor.textContent).toContain('No se pudo conectar')
  })
})

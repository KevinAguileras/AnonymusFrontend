import React from 'react'
import { getSession, saveSession, logout } from '../services/session'
import { api } from '../services/api'
import ProtectedRoute from '../components/ProtectedRoute'
import { token, session, response } from './apiFixtures'
import { montar, esperar, simularLocalStorage } from './ayudas'
describe('Sesión y permisos', () => {
  let pagina
  beforeEach(() => { sessionStorage.clear(); simularLocalStorage() })
  afterEach(() => { pagina?.desmontar(); pagina=null; sessionStorage.clear() })
  it('restaura una sesión guardada y no persiste password', () => { saveSession({...session(),password:'secreto'}); expect(getSession().nombre).toBe('Ana'); expect(sessionStorage.getItem('anonymusSession')).not.toContain('secreto') })
  it('rechaza tokens vencidos y datos corruptos', () => { saveSession({...session(),token:token(1)}); expect(getSession()).toBeNull(); sessionStorage.setItem('anonymusSession','invalid'); expect(getSession()).toBeNull() })
  it('logout elimina la sesión', () => { saveSession(session()); logout(); expect(getSession()).toBeNull() })
  it('redirige al login si no hay sesión', () => { pagina=montar(<ProtectedRoute><p>Privado</p></ProtectedRoute>); expect(pagina.rutaActual()).toBe('/login'); expect(pagina.contenedor.textContent).not.toContain('Privado') })
  it('verifica el rol en el servidor incluso si el navegador dice administrador', async () => {
    saveSession(session('ADMINISTRADOR')); spyOn(window,'fetch').and.returnValue(response({nombre:'Ana',email:'ana@example.test',rol:'CLIENTE'}))
    pagina=montar(<ProtectedRoute roles={['ADMINISTRADOR']}><p>Privado</p></ProtectedRoute>); await esperar()
    expect(pagina.contenedor.textContent).toContain('No tienes permisos'); expect(pagina.contenedor.textContent).not.toContain('Privado')
  })
  it('401 borra la sesión mientras 403 conserva la identidad', async () => {
    saveSession(session()); const fetchMock=spyOn(window,'fetch').and.returnValue(response({},403))
    await expectAsync(api('/admin/usuarios')).toBeRejected(); expect(getSession()).not.toBeNull()
    fetchMock.and.returnValue(response({},401)); await expectAsync(api('/cuenta')).toBeRejected(); expect(getSession()).toBeNull()
  })
})

import { createProduct, deleteProduct, getProducts, updateProduct } from '../services/productService'
import { products, response, session } from './apiFixtures'
describe('Servicio de productos REST', () => {
  beforeEach(() => { sessionStorage.setItem('anonymusSession',JSON.stringify(session('ADMINISTRADOR'))); spyOn(window,'fetch') })
  afterEach(() => sessionStorage.clear())
  it('normaliza la categoría de la respuesta SQL', async () => {
    window.fetch.and.returnValue(response(products)); const result=await getProducts()
    expect(result[0].categoria).toBe(products[0].categoria.nombre); expect(result[0].categoriaId).toBe(products[0].categoria.id)
  })
  it('crea con categoría ID, stock y token', async () => {
    window.fetch.and.returnValue(response(products[0],201)); await createProduct({nombre:' Mouse ',categoriaId:'2',precio:'5000',stock:'3',oferta:false})
    const request=window.fetch.calls.mostRecent().args[1]
    expect(JSON.parse(request.body)).toEqual({nombre:'Mouse',categoriaId:2,precio:5000,stock:3,oferta:false,precioAnterior:null})
    expect(request.headers.Authorization).toContain('Bearer ')
  })
  it('actualiza con PUT sobre el ID persistido', async () => {
    window.fetch.and.returnValue(response(products[0])); await updateProduct({id:4,nombre:'Mouse',categoriaId:2,precio:5000,stock:3})
    expect(window.fetch.calls.mostRecent().args[0]).toBe('/api/v1/productos/4'); expect(window.fetch.calls.mostRecent().args[1].method).toBe('PUT')
  })
  it('acepta DELETE 204 sin intentar usar una respuesta JSON', async () => {
    window.fetch.and.returnValue(response(null,204)); expect(await deleteProduct(4)).toBeNull()
  })
  it('propaga errores de integridad y no simula éxito local', async () => {
    window.fetch.and.returnValue(response({error:'Hay boletas relacionadas'},409)); await expectAsync(deleteProduct(4)).toBeRejectedWithError('Hay boletas relacionadas')
  })
})

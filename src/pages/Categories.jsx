import useResource from '../hooks/useResource'
import ResourceStatus from '../components/ResourceStatus'
import { Link } from 'react-router-dom'
import { getProducts, getCategories } from '../services/productService'

const load = async (options) => {
  const [products, categories] = await Promise.all([getProducts(options), getCategories(options)])
  return { products, categories }
}
function Categories() {
  const { data: { products, categories }, loading, error } = useResource(load, { products: [], categories: [] })

  return (
    <section>
      <div className="section-title-bar" style={{ borderColor: 'var(--border-color)' }}>
        <h2 style={{ color: 'var(--purple-700)' }}>Categorías</h2>
      </div>
      <ResourceStatus loading={loading} error={error} />
      <div className="row g-4">
        {categories.map((category) => {
          const amount = products.filter((product) => product.categoriaId === category.id).length
          return (
            <div className="col-12 col-sm-6 col-lg-3" key={category.id}>
              <div className="product-card h-100">
                <span className="product-category">Categoría</span>
                <h3 style={{ textTransform: 'capitalize' }}>{category.nombre}</h3>
                <p>{amount} producto(s) disponibles.</p>
                <Link to={`/productos?categoria=${encodeURIComponent(category.nombre)}`} className="btn-primary btn-inline mt-auto">Ver productos</Link>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Categories

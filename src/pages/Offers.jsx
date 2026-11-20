import useResource from '../hooks/useResource'
import ResourceStatus from '../components/ResourceStatus'
import { getProducts } from '../services/productService'
import ProductGrid from '../components/ProductGrid'

function Offers() {
  const { data, loading, error } = useResource(getProducts)
  const products = data.filter((product) => product.oferta)
  return (
    <section>
      <div className="section-title-bar" style={{ borderColor: 'var(--border-color)' }}>
        <h2 style={{ color: 'var(--purple-700)' }}>Ofertas</h2>
        <span>Productos con precio especial</span>
      </div>
      <ResourceStatus loading={loading} error={error} />
      {!loading && !error && <ProductGrid products={products} />}
    </section>
  )
}

export default Offers

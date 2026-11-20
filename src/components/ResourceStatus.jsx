export default function ResourceStatus({ loading, error }) {
  if (loading) return <p role="status">Cargando…</p>
  if (error) return <div role="alert" className="alert alert-danger">{error}</div>
  return null
}

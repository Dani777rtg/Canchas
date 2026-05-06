import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page page--center">
      <h1>404</h1>
      <p className="muted">No encontramos esa página.</p>
      <Link to="/" className="btn btn--primary">
        Volver al inicio
      </Link>
    </div>
  )
}

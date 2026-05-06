import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { fetchHealth } from '../api/health'
import type { HealthResponse } from '../api/health'

export function HomePage() {
  const { user } = useAuth()
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch(() => setError(true))
  }, [])

  return (
    <div className="page">
      <h1>Reservá tu cancha</h1>
      <p className="lede">
        Plataforma de reservas: consultá disponibilidad, reservá turnos y gestioná tus partidos. El
        backend Spring Boot expone la API bajo <code>/api</code>.
      </p>

      <div className="card">
        <h2>Estado del servicio</h2>
        {error && <p className="form-error">No se pudo contactar la API. ¿Está el backend en el puerto 8080?</p>}
        {health && (
          <p>
            <strong>{health.service}</strong>: {health.status}
          </p>
        )}
        {!health && !error && <p className="muted">Comprobando…</p>}
      </div>

      {!user && (
        <div className="cta-row">
          <Link to="/registro" className="btn btn--primary">
            Crear cuenta
          </Link>
          <Link to="/iniciar-sesion" className="btn btn--secondary">
            Ya tengo cuenta
          </Link>
        </div>
      )}
      {user && (
        <div className="cta-row">
          <Link to="/panel" className="btn btn--primary">
            Ir a mi panel
          </Link>
        </div>
      )}
    </div>
  )
}

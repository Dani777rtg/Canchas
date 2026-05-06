import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function DashboardPage() {
  const { user, refreshUser } = useAuth()

  return (
    <div className="page">
      <h1>Mi panel</h1>
      <p className="lede">
        Sesión iniciada como <strong>{user?.fullName}</strong> ({user?.email}).
      </p>

      <div className="admin-cards">
        <Link to="/panel/reservar" className="card admin-cards__item">
          <h2>Nueva reserva</h2>
          <p className="muted">Elegí fecha, duración y horario disponible.</p>
        </Link>
        <Link to="/panel/reservas" className="card admin-cards__item">
          <h2>Mis reservas</h2>
          <p className="muted">Ver turnos, comprobante y cancelar si aplica.</p>
        </Link>
      </div>

      <div className="card">
        <h2>Perfil</h2>
        <dl className="dl-grid">
          <dt>Rol</dt>
          <dd>{user?.role}</dd>
          <dt>Estado</dt>
          <dd>{user?.status}</dd>
          <dt>Teléfono</dt>
          <dd>{user?.phone ?? '—'}</dd>
        </dl>
        <button type="button" className="btn btn--secondary" onClick={() => refreshUser()}>
          Actualizar datos
        </button>
      </div>
    </div>
  )
}

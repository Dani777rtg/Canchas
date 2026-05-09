import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import './AppLayout.css'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const mainWide = pathname === '/'

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="shell">
      <header className="shell__header">
        <Link to="/" className="shell__brand">
          <span className="shell__brand-title">Canchas</span>
          <span className="shell__brand-tagline">Reservá tu turno</span>
        </Link>
        <nav className="shell__nav" aria-label="Principal">
          {user ? (
            <>
              <Link to="/panel">Mi panel</Link>
              {user.role === 'ADMINISTRADOR' && <Link to="/admin">Administración</Link>}
              <button type="button" className="btn btn--ghost" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/registro" className="btn btn--primary btn--sm">
                Crear cuenta
              </Link>
              <Link to="/iniciar-sesion">Iniciar sesión</Link>
            </>
          )}
        </nav>
      </header>
      <main className={mainWide ? 'shell__main shell__main--wide' : 'shell__main'}>
        <Outlet />
      </main>
      <footer className="shell__footer">
        <span className="muted">Reservas de canchas deportivas</span>
      </footer>
    </div>
  )
}

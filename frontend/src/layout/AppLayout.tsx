import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import './AppLayout.css'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="shell">
      <header className="shell__header">
        <Link to="/" className="shell__brand">
          Canchas
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
              <Link to="/iniciar-sesion">Iniciar sesión</Link>
              <Link to="/registro" className="btn btn--primary btn--sm">
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="shell__main">
        <Outlet />
      </main>
      <footer className="shell__footer">
        <span className="muted">API en /api · Vite + React</span>
      </footer>
    </div>
  )
}

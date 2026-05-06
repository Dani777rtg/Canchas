import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="page page--center">
        <p className="muted">Cargando sesión…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/iniciar-sesion" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

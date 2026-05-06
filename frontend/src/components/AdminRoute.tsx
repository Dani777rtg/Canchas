import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()

  if (!ready) {
    return (
      <div className="page page--center">
        <p className="muted">Cargando sesión…</p>
      </div>
    )
  }

  if (!user || user.role !== 'ADMINISTRADOR') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

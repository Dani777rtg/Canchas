import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Cargando sesión…
      </div>
    )
  }

  if (!user || user.role !== 'ADMINISTRADOR') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

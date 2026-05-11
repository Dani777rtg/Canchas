import { CalendarDays, LayoutDashboard, LogIn, LogOut, ShieldCheck, UserPlus } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { Brand } from '@/components/Brand'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg p-1 -m-1 transition-colors hover:bg-secondary"
          >
            <Brand />
          </Link>

          <nav
            className="flex items-center gap-1 sm:gap-2"
            aria-label="Principal"
          >
            {user ? (
              <>
                <NavLink
                  to="/panel"
                  className={({ isActive }) =>
                    cn(
                      'hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex',
                      isActive && 'bg-secondary text-foreground',
                    )
                  }
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Mi panel
                </NavLink>
                {user.role === 'ADMINISTRADOR' && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      cn(
                        'hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:inline-flex',
                        isActive && 'bg-secondary text-foreground',
                      )
                    }
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Administración
                  </NavLink>
                )}
                <ThemeToggle />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </Button>
              </>
            ) : (
              <>
                <NavLink
                  to="/iniciar-sesion"
                  className={({ isActive }) =>
                    cn(
                      'hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex',
                      isActive && 'bg-secondary text-foreground',
                    )
                  }
                >
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </NavLink>
                <ThemeToggle />
                <Button asChild size="sm">
                  <Link to="/registro">
                    <UserPlus className="h-4 w-4" />
                    Crear cuenta
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main
        className={cn(
          'mx-auto w-full flex-1 px-4 py-6 sm:px-6 sm:py-8',
          mainWide ? 'max-w-7xl' : 'max-w-4xl',
        )}
      >
        <Outlet />
      </main>

      <footer className="border-t border-border/70 bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Reservas de canchas deportivas — hora Colombia (Bogotá)
          </span>
          <span>© {new Date().getFullYear()} CanchaYa</span>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}

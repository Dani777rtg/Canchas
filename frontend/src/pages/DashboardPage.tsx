import { ArrowRight, CalendarPlus, ListChecks, MapPin, RefreshCw, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { useCity } from '@/lib/city-context'
import { usePageTitle } from '@/lib/use-page-title'

export function DashboardPage() {
  usePageTitle('Mi panel')
  const { user, refreshUser } = useAuth()
  const { selectedCity } = useCity()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Mi panel
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bienvenido, <strong className="text-foreground">{user?.fullName}</strong>.
          </p>
        </div>
        {selectedCity && (
          <Badge variant="muted" className="h-7 px-3 text-sm">
            <MapPin className="h-3.5 w-3.5" />
            {selectedCity.name}
          </Badge>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/panel/reservar" className="group">
          <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <CalendarPlus className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 text-base font-semibold">
                  Nueva reserva
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Elegí fecha, duración y horario disponible.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/panel/reservas" className="group">
          <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="rounded-lg bg-accent/15 p-3 text-accent-foreground dark:text-accent">
                <ListChecks className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 text-base font-semibold">
                  Mis reservas
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ver turnos, comprobantes y cancelar si aplica.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" />
              Perfil
            </CardTitle>
            <CardDescription>Tus datos de cuenta.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refreshUser()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nombre
              </dt>
              <dd className="mt-0.5 font-medium">{user?.fullName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Correo
              </dt>
              <dd className="mt-0.5 font-medium">{user?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Teléfono
              </dt>
              <dd className="mt-0.5 font-medium">{user?.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Rol
              </dt>
              <dd className="mt-0.5">
                <Badge variant={user?.role === 'ADMINISTRADOR' ? 'accent' : 'muted'}>
                  {user?.role ?? '—'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Estado
              </dt>
              <dd className="mt-0.5">
                {user?.status ? <StatusBadge status={user.status} /> : '—'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

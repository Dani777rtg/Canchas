import { ArrowRight, BarChart3, Building2, ListChecks, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { usePageTitle } from '@/lib/use-page-title'

const cards = [
  {
    to: '/admin/canchas',
    icon: Building2,
    title: 'Canchas',
    description: 'Listado y estado operativo de cada cancha por ciudad.',
  },
  {
    to: '/admin/reservas',
    icon: ListChecks,
    title: 'Reservas',
    description: 'Detalle de reservas por fecha, cliente, cancha y estado de pago.',
  },
  {
    to: '/admin/usuarios',
    icon: Users,
    title: 'Usuarios',
    description: 'Buscar clientes y revisar roles.',
  },
  {
    to: '/admin/informes',
    icon: BarChart3,
    title: 'Informes',
    description: 'Reservas, ocupación aproximada e ingresos en COP.',
  },
]

export function AdminHomePage() {
  usePageTitle('Administración')
  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Administración
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestioná canchas, reservas, usuarios e informes del sistema.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ to, icon: Icon, title, description }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
              <CardContent className="flex items-start gap-3 p-5">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 text-base font-semibold">
                    {title}
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

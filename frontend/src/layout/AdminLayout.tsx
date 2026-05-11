import { BarChart3, Building2, ShieldCheck, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const items = [
  { to: '/admin', label: 'Inicio', icon: ShieldCheck, end: true },
  { to: '/admin/canchas', label: 'Canchas', icon: Building2, end: false },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users, end: false },
  { to: '/admin/informes', label: 'Informes', icon: BarChart3, end: false },
]

export function AdminLayout() {
  return (
    <div className="space-y-6">
      <nav
        className="-mx-1 flex flex-wrap gap-1 border-b border-border pb-2"
        aria-label="Administración"
      >
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}

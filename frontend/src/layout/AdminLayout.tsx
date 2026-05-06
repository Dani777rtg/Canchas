import { NavLink, Outlet } from 'react-router-dom'
import './PanelLayout.css'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  'subnav__link' + (isActive ? ' subnav__link--active' : '')

export function AdminLayout() {
  return (
    <div className="panel">
      <nav className="subnav" aria-label="Administración">
        <NavLink to="/admin" end className={linkClass}>
          Inicio
        </NavLink>
        <NavLink to="/admin/canchas" className={linkClass}>
          Canchas
        </NavLink>
        <NavLink to="/admin/usuarios" className={linkClass}>
          Usuarios
        </NavLink>
        <NavLink to="/admin/informes" className={linkClass}>
          Informes
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}

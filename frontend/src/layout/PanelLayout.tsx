import { NavLink, Outlet } from 'react-router-dom'
import './PanelLayout.css'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  'subnav__link' + (isActive ? ' subnav__link--active' : '')

export function PanelLayout() {
  return (
    <div className="panel">
      <nav className="subnav" aria-label="Panel de usuario">
        <NavLink to="/panel" end className={linkClass}>
          Resumen
        </NavLink>
        <NavLink to="/panel/reservar" className={linkClass}>
          Nueva reserva
        </NavLink>
        <NavLink to="/panel/reservas" className={linkClass}>
          Mis reservas
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}

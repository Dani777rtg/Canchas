import { Link } from 'react-router-dom'

export function AdminHomePage() {
  return (
    <div className="page">
      <h1>Administración</h1>
      <p className="lede">
        Gestioná canchas, usuarios e informes. Requiere rol <code>ADMINISTRADOR</code>.
      </p>
      <div className="admin-cards">
        <Link to="/admin/canchas" className="card admin-cards__item">
          <h2>Canchas</h2>
          <p className="muted">Listado y estado operativo de cada cancha.</p>
        </Link>
        <Link to="/admin/usuarios" className="card admin-cards__item">
          <h2>Usuarios</h2>
          <p className="muted">Buscar clientes y revisar roles.</p>
        </Link>
        <Link to="/admin/informes" className="card admin-cards__item">
          <h2>Informes</h2>
          <p className="muted">Reservas, ocupación aproximada e ingresos en COP.</p>
        </Link>
      </div>
    </div>
  )
}

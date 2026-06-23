import { NavLink } from 'react-router-dom'
import './styles/Navbar.css'

function Navbar() {
  const modalidad = localStorage.getItem('modalidadTorneo')

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-brand-icon">⚽</span>
        <span>Torneo FIFA</span>
      </div>
      <ul className="navbar-links">
        <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Inicio</NavLink></li>
        <li><NavLink to="/registrar-jugadores" className={({ isActive }) => isActive ? 'active' : ''}>Jugadores</NavLink></li>
        {modalidad === 'grupos' ? (
          <li><NavLink to="/fase-grupos" className={({ isActive }) => isActive ? 'active' : ''}>Grupos ⚡</NavLink></li>
        ) : (
          <>
            <li><NavLink to="/calendario" className={({ isActive }) => isActive ? 'active' : ''}>Calendario</NavLink></li>
            <li><NavLink to="/registrar-partido" className={({ isActive }) => isActive ? 'active' : ''}>Partido</NavLink></li>
          </>
        )}
        <li><NavLink to="/tabla-posiciones" className={({ isActive }) => isActive ? 'active' : ''}>Tabla</NavLink></li>
      </ul>
    </nav>
  )
}

export default Navbar

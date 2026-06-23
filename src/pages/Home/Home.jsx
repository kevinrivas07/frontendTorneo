import { useNavigate } from 'react-router-dom'
import './styles/Home.css'

function Home() {
  const navigate = useNavigate()

  const reiniciarTorneo = async () => {
    if (!window.confirm('¿Seguro que quieres reiniciar el torneo?')) return
    await fetch('https://backend-torneo.vercel.app/api/torneo/reiniciar', { method: 'DELETE' })
    localStorage.removeItem('modalidadTorneo')
    localStorage.removeItem('gruposTorneo')
    localStorage.removeItem('faseActual')
    localStorage.removeItem('eliminatoriaRondas')
    localStorage.removeItem('calendarioTodos')
    alert('Torneo reiniciado')
  }

  const seleccionarModalidad = (modalidad) => {
    localStorage.setItem('modalidadTorneo', modalidad)
    navigate('/registrar-jugadores')
  }

  const modalidadActual = localStorage.getItem('modalidadTorneo')

  return (
    <div className="home">
      <div className="home-hero">
        <div className="home-hero-label">⚽ FIFA Tournament Manager</div>
        <h1>Gestiona tu Torneo</h1>
        <p>Registra jugadores, carga resultados y consulta la tabla de posiciones en tiempo real.</p>
      </div>

      <div className="home-modalidad-section">
        <h2 className="home-modalidad-titulo">Selecciona el tipo de torneo</h2>
        {modalidadActual && (
          <div className="home-modalidad-actual">
            Modalidad activa: <strong>{modalidadActual === 'todos' ? '🔄 Todos contra todos' : '🏆 Fase de grupos + Eliminación directa'}</strong>
          </div>
        )}
        <div className="home-modalidad-btns">
          <button
            className={`btn-modalidad ${modalidadActual === 'todos' ? 'activo' : ''}`}
            onClick={() => seleccionarModalidad('todos')}
          >
            <span className="btn-modalidad-icon">🔄</span>
            <span className="btn-modalidad-titulo">Todos contra todos</span>
            <span className="btn-modalidad-desc">Cada equipo juega contra todos los demás. Gana quien más puntos acumule.</span>
          </button>
          <button
            className={`btn-modalidad ${modalidadActual === 'grupos' ? 'activo' : ''}`}
            onClick={() => seleccionarModalidad('grupos')}
          >
            <span className="btn-modalidad-icon">🏆</span>
            <span className="btn-modalidad-titulo">Fase de grupos + Eliminación directa</span>
            <span className="btn-modalidad-desc">Los equipos se dividen en grupos. Los mejores avanzan a cuartos, semis y final.</span>
          </button>
        </div>
      </div>

      <div className="home-cards">
        <div className="home-card" onClick={() => navigate('/registrar-jugadores')}>
          <div className="card-icon-wrap blue">👥</div>
          <h3>Registrar Jugadores</h3>
          <p>Ingresa los participantes y sus equipos manualmente o con rifa aleatoria.</p>
          <div className="card-arrow">Ir →</div>
        </div>
        <div className="home-card" onClick={() => navigate('/registrar-partido')}>
          <div className="card-icon-wrap green">🎮</div>
          <h3>Registrar Partido</h3>
          <p>Carga el resultado de cada partido con los goles de cada equipo.</p>
          <div className="card-arrow">Ir →</div>
        </div>
        <div className="home-card" onClick={() => navigate('/tabla-posiciones')}>
          <div className="card-icon-wrap amber">🏆</div>
          <h3>Tabla de Posiciones</h3>
          <p>Consulta el ranking con puntos, goles y diferencia de goles.</p>
          <div className="card-arrow">Ir →</div>
        </div>
        {modalidadActual === 'todos' && (
          <div className="home-card" onClick={() => navigate('/calendario')}>
            <div className="card-icon-wrap" style={{background:'#dcfce7'}}>📅</div>
            <h3>Calendario de Partidos</h3>
            <p>Ve las fechas programadas y registra los resultados en orden.</p>
            <div className="card-arrow">Ir →</div>
          </div>
        )}
        {modalidadActual === 'grupos' && (
          <div className="home-card" onClick={() => navigate('/fase-grupos')}>
            <div className="card-icon-wrap" style={{background:'#f3e8ff'}}>⚡</div>
            <h3>Fase de Grupos</h3>
            <p>Consulta los grupos, los partidos programados y el cuadro de eliminación directa.</p>
            <div className="card-arrow">Ir →</div>
          </div>
        )}
      </div>

      <div className="home-reset">
        <button className="btn-reiniciar" onClick={reiniciarTorneo}>
          🔄 Reiniciar Torneo
        </button>
      </div>
      <p className="created">
      Created by:{" "}
      <a
        href="https://elmundodelatecnologiaf.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="created-link"
      >
        El Mundo de la tecnología
      </a>
</p>
    </div>
  )
}

export default Home

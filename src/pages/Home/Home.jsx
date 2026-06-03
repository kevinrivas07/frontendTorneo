import { useNavigate } from 'react-router-dom'
import './styles/Home.css'

function Home() {
  const navigate = useNavigate()

  const reiniciarTorneo = async () => {
    if (!window.confirm('¿Seguro que quieres reiniciar el torneo?')) return
    await fetch('http://localhost:5000/api/torneo/reiniciar', { method: 'DELETE' })
    alert('Torneo reiniciado')
  }

  return (
    <div className="home">
      <div className="home-hero">
        <div className="home-hero-label">⚽ FIFA Tournament Manager</div>
        <h1>Gestiona tu Torneo</h1>
        <p>Registra jugadores, carga resultados y consulta la tabla de posiciones en tiempo real.</p>
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

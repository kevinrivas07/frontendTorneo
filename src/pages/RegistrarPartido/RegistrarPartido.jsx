import { useState, useEffect } from 'react'
import './styles/RegistrarPartido.css'

function RegistrarPartido() {
  const [tabla, setTabla] = useState([])
  const [idEquipo1, setIdEquipo1] = useState('')
  const [idEquipo2, setIdEquipo2] = useState('')
  const [golesEquipo1, setGolesEquipo1] = useState(0)
  const [golesEquipo2, setGolesEquipo2] = useState(0)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => { obtenerTabla() }, [])

  const obtenerTabla = async () => {
    const res = await fetch('http://localhost:5000/api/torneo')
    const data = await res.json()
    setTabla(data)
  }

  const determinarResultado = () => {
    const g1 = parseInt(golesEquipo1)
    const g2 = parseInt(golesEquipo2)
    if (g1 > g2) return 'gana1'
    if (g2 > g1) return 'gana2'
    return 'empate'
  }

  const registrarPartido = async (e) => {
    e.preventDefault()
    if (!idEquipo1 || !idEquipo2) return alert('Selecciona ambos equipos')
    if (idEquipo1 === idEquipo2) return alert('Los equipos deben ser diferentes')

    const resultado = determinarResultado()
    await fetch('http://localhost:5000/api/torneo/partido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idEquipo1, idEquipo2, resultado, golesEquipo1: parseInt(golesEquipo1), golesEquipo2: parseInt(golesEquipo2) })
    })

    const eq1 = tabla.find(e => String(e.id) === String(idEquipo1))
    const eq2 = tabla.find(e => String(e.id) === String(idEquipo2))
    setMensaje(`✅ ${eq1?.equipo} ${golesEquipo1} - ${golesEquipo2} ${eq2?.equipo}`)
    setIdEquipo1(''); setIdEquipo2(''); setGolesEquipo1(0); setGolesEquipo2(0)
    obtenerTabla()
  }

  return (
    <div className="registrar-partido">
      <div className="page-header">
        <h2>Registrar Partido</h2>
        <p>Selecciona los equipos e ingresa los goles de cada uno.</p>
      </div>
      <div className="page-divider" />

      {tabla.length === 0 ? (
        <div className="rp-aviso">
          No hay equipos registrados. Primero ve a <strong>Jugadores</strong> y registra los participantes.
        </div>
      ) : (
        <form className="rp-form" onSubmit={registrarPartido}>
          <div className="rp-scoreboard">
            <div className="rp-equipo">
              <div className="rp-equipo-label">Local</div>
              <select value={idEquipo1} onChange={(e) => setIdEquipo1(e.target.value)} required>
                <option value="">— Seleccionar —</option>
                {tabla.map(e => (
                  <option key={e.id} value={e.id}>{e.equipo} ({e.jugador})</option>
                ))}
              </select>
              <div className="rp-goles-wrap">
                <input type="number" min="0" value={golesEquipo1} onChange={(e) => setGolesEquipo1(e.target.value)} className="rp-goles" />
              </div>
            </div>

            <div className="rp-vs">VS</div>

            <div className="rp-equipo">
              <div className="rp-equipo-label">Visitante</div>
              <select value={idEquipo2} onChange={(e) => setIdEquipo2(e.target.value)} required>
                <option value="">— Seleccionar —</option>
                {tabla.map(e => (
                  <option key={e.id} value={e.id}>{e.equipo} ({e.jugador})</option>
                ))}
              </select>
              <div className="rp-goles-wrap">
                <input type="number" min="0" value={golesEquipo2} onChange={(e) => setGolesEquipo2(e.target.value)} className="rp-goles" />
              </div>
            </div>
          </div>

          <div className="rp-preview">
            {idEquipo1 && idEquipo2 && (
              <span className={`rp-badge ${determinarResultado()}`}>
                {determinarResultado() === 'gana1' && '🏆 Gana Local'}
                {determinarResultado() === 'gana2' && '🏆 Gana Visitante'}
                {determinarResultado() === 'empate' && '🤝 Empate'}
              </span>
            )}
          </div>

          {mensaje && <div className="rp-mensaje">{mensaje}</div>}

          <button type="submit" className="btn-registrar">Subir Resultado</button>
        </form>
      )}
    </div>
  )
}

export default RegistrarPartido

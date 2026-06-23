import { useState, useEffect } from 'react'
import './styles/CalendarioTodos.css'

function generarCalendario(equipos) {
  const n = equipos.length
  const lista = [...equipos]
  if (n % 2 !== 0) lista.push({ id: 'libre', equipo: 'LIBRE', jugador: '' })
  const total = lista.length
  const rondas = []
  const fijos = lista.slice(0, 1)
  let rotables = lista.slice(1)

  for (let r = 0; r < total - 1; r++) {
    const grupo = [...fijos, ...rotables]
    const partidos = []
    for (let i = 0; i < total / 2; i++) {
      const eq1 = grupo[i]
      const eq2 = grupo[total - 1 - i]
      if (eq1.id !== 'libre' && eq2.id !== 'libre') {
        partidos.push({ eq1, eq2, goles1: null, goles2: null, jugado: false })
      }
    }
    if (partidos.length > 0) rondas.push({ nombre: `Fecha ${r + 1}`, partidos })
    rotables = [rotables[rotables.length - 1], ...rotables.slice(0, rotables.length - 1)]
  }
  return rondas
}

function CalendarioTodos() {
  const [equipos, setEquipos] = useState([])
  const [calendario, setCalendario] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [partidoActivo, setPartidoActivo] = useState(null)
  const [goles1, setGoles1] = useState(0)
  const [goles2, setGoles2] = useState(0)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const res = await fetch('https://backend-torneo.vercel.app/api/torneo')
      const data = await res.json()
      setEquipos(data)
      const guardado = localStorage.getItem('calendarioTodos')
      if (guardado) setCalendario(JSON.parse(guardado))
    } catch (e) { console.error(e) }
    setCargando(false)
  }

  const generarFechas = () => {
    if (equipos.length < 2) { setMensaje('⚠️ Necesitas al menos 2 equipos.'); return }
    const cal = generarCalendario(equipos)
    setCalendario(cal)
    localStorage.setItem('calendarioTodos', JSON.stringify(cal))
    setMensaje('✅ Calendario generado.')
  }

  const abrirPartido = (rondaIdx, partidoIdx) => {
    setPartidoActivo({ rondaIdx, partidoIdx })
    setGoles1(0)
    setGoles2(0)
  }

  const registrarResultado = async () => {
    const { rondaIdx, partidoIdx } = partidoActivo
    const g1 = parseInt(goles1)
    const g2 = parseInt(goles2)
    const cal = JSON.parse(JSON.stringify(calendario))
    const p = cal[rondaIdx].partidos[partidoIdx]
    p.goles1 = g1
    p.goles2 = g2
    p.jugado = true

    let resultado = 'empate'
    if (g1 > g2) resultado = 'gana1'
    if (g2 > g1) resultado = 'gana2'

    try {
      await fetch('https://backend-torneo.vercel.app/api/torneo/partido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idEquipo1: p.eq1.id,
          idEquipo2: p.eq2.id,
          resultado,
          golesEquipo1: g1,
          golesEquipo2: g2
        })
      })
    } catch (e) { console.error(e) }

    setCalendario(cal)
    localStorage.setItem('calendarioTodos', JSON.stringify(cal))
    setPartidoActivo(null)
    setMensaje(`✅ ${p.eq1.equipo} ${g1} - ${g2} ${p.eq2.equipo} registrado`)
  }

  const resetCalendario = () => {
    if (!window.confirm('¿Regenerar el calendario? Se perderá el progreso local.')) return
    const cal = generarCalendario(equipos)
    setCalendario(cal)
    localStorage.setItem('calendarioTodos', JSON.stringify(cal))
    setMensaje('🔀 Calendario regenerado.')
  }

  const totalPartidos = calendario.reduce((s, r) => s + r.partidos.length, 0)
  const jugados = calendario.reduce((s, r) => s + r.partidos.filter(p => p.jugado).length, 0)

  if (cargando) return <div className="ct-loading">Cargando…</div>

  return (
    <div className="calendario-todos">
      <div className="page-header">
        <h2>Calendario — Todos contra todos</h2>
        <p>Partidos distribuidos en fechas para que todos se enfrenten.</p>
      </div>
      <div className="page-divider" />

      {equipos.length === 0 ? (
        <div className="ct-aviso">Primero registra los jugadores.</div>
      ) : calendario.length === 0 ? (
        <div className="ct-setup">
          <p><strong>{equipos.length} equipos</strong> → se necesitan <strong>{equipos.length % 2 === 0 ? equipos.length - 1 : equipos.length} fechas</strong>, <strong>{(equipos.length * (equipos.length - 1)) / 2} partidos</strong> en total.</p>
          <button className="btn-generar-cal" onClick={generarFechas}>⚡ Generar Calendario</button>
        </div>
      ) : (
        <>
          {mensaje && <div className="ct-mensaje">{mensaje}</div>}

          <div className="ct-progreso">
            <span>Partidos jugados: <strong>{jugados} / {totalPartidos}</strong></span>
            <div className="ct-barra-wrap">
              <div className="ct-barra" style={{ width: `${totalPartidos ? (jugados / totalPartidos) * 100 : 0}%` }} />
            </div>
            <button className="btn-reset-cal" onClick={resetCalendario}>🔀 Regenerar</button>
          </div>

          {/* Modal */}
          {partidoActivo && (
            <div className="ct-modal-overlay">
              <div className="ct-modal">
                <h3>Registrar Resultado</h3>
                <div className="ct-modal-equipos">
                  <span>{calendario[partidoActivo.rondaIdx]?.partidos[partidoActivo.partidoIdx]?.eq1?.equipo}</span>
                  <span className="ct-modal-vs">VS</span>
                  <span>{calendario[partidoActivo.rondaIdx]?.partidos[partidoActivo.partidoIdx]?.eq2?.equipo}</span>
                </div>
                <div className="ct-modal-score">
                  <input type="number" min="0" value={goles1} onChange={e => setGoles1(e.target.value)} className="ct-modal-input" />
                  <span>-</span>
                  <input type="number" min="0" value={goles2} onChange={e => setGoles2(e.target.value)} className="ct-modal-input" />
                </div>
                <div className="ct-modal-btns">
                  <button className="btn-guardar-ct" onClick={registrarResultado}>💾 Guardar</button>
                  <button className="btn-cancelar-ct" onClick={() => setPartidoActivo(null)}>✕ Cancelar</button>
                </div>
              </div>
            </div>
          )}

          <div className="ct-fechas">
            {calendario.map((ronda, ri) => {
              const todos = ronda.partidos.every(p => p.jugado)
              const algunos = ronda.partidos.some(p => p.jugado)
              return (
                <div key={ri} className={`ct-fecha ${todos ? 'completa' : algunos ? 'parcial' : ''}`}>
                  <div className="ct-fecha-header">
                    <span className="ct-fecha-nombre">{ronda.nombre}</span>
                    <span className="ct-fecha-estado">
                      {todos ? '✅ Completa' : algunos ? `${ronda.partidos.filter(p=>p.jugado).length}/${ronda.partidos.length} jugados` : 'Pendiente'}
                    </span>
                  </div>
                  <div className="ct-fecha-partidos">
                    {ronda.partidos.map((p, pi) => (
                      <div key={pi} className={`ct-partido ${p.jugado ? 'jugado' : ''}`}>
                        <span className={`ct-eq ${p.jugado && p.goles1 > p.goles2 ? 'ganador' : ''}`}>
                          <span className="ct-eq-nombre">{p.eq1.equipo}</span>
                          <span className="ct-eq-jugador">{p.eq1.jugador}</span>
                        </span>
                        <span className="ct-score">
                          {p.jugado ? <strong>{p.goles1} - {p.goles2}</strong> : <span className="ct-vs">vs</span>}
                        </span>
                        <span className={`ct-eq ct-eq-right ${p.jugado && p.goles2 > p.goles1 ? 'ganador' : ''}`}>
                          <span className="ct-eq-nombre">{p.eq2.equipo}</span>
                          <span className="ct-eq-jugador">{p.eq2.jugador}</span>
                        </span>
                        {!p.jugado ? (
                          <button className="btn-jugar-ct" onClick={() => abrirPartido(ri, pi)}>Registrar</button>
                        ) : (
                          <span className="ct-ok">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <p className="created">
        Created by:{" "}
        <a href="https://elmundodelatecnologiaf.vercel.app/" target="_blank" rel="noopener noreferrer" className="created-link">
          El Mundo de la tecnología
        </a>
      </p>
    </div>
  )
}

export default CalendarioTodos

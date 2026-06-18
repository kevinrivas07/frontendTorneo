import { useState, useEffect } from 'react'
import './styles/FaseGrupos.css'

function FaseGrupos() {
  const [equipos, setEquipos] = useState([])
  const [grupos, setGrupos] = useState([])
  const [faseActual, setFaseActual] = useState('grupos') // 'grupos' | 'eliminacion'
  const [eliminatoria, setEliminatoria] = useState(null) // { cuartos, semis, final }
  const [partidos, setPartidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  // Partido en curso
  const [partidoActivo, setPartidoActivo] = useState(null)
  const [goles1, setGoles1] = useState(0)
  const [goles2, setGoles2] = useState(0)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const res = await fetch('https://backend-torneo.vercel.app/api/torneo')
      const data = await res.json()
      setEquipos(data)

      const resP = await fetch('https://backend-torneo.vercel.app/api/torneo/partidos')
      const dataP = await resP.json()
      setPartidos(dataP)

      // Cargar estado guardado
      const gruposGuardados = localStorage.getItem('gruposTorneo')
      const faseGuardada = localStorage.getItem('faseActual')
      const eliminatoriaGuardada = localStorage.getItem('eliminatoriaRondas')

      if (gruposGuardados) setGrupos(JSON.parse(gruposGuardados))
      if (faseGuardada) setFaseActual(faseGuardada)
      if (eliminatoriaGuardada) setEliminatoria(JSON.parse(eliminatoriaGuardada))
    } catch (e) {
      console.error(e)
    }
    setCargando(false)
  }

  const distribuirGrupos = () => {
    if (equipos.length < 4) {
      setMensaje('⚠️ Necesitas al menos 4 equipos para crear grupos.')
      return
    }
    const mezclados = [...equipos].sort(() => Math.random() - 0.5)
    const numGrupos = equipos.length <= 8 ? 2 : equipos.length <= 12 ? 3 : 4
    const nuevosGrupos = []
    for (let i = 0; i < numGrupos; i++) {
      nuevosGrupos.push({
        nombre: `Grupo ${String.fromCharCode(65 + i)}`,
        equipos: [],
        partidos: []
      })
    }
    mezclados.forEach((eq, idx) => {
      nuevosGrupos[idx % numGrupos].equipos.push({ ...eq, pg: 0, pe: 0, pp: 0, pj: 0, gf: 0, gc: 0, pts: 0 })
    })
    // Generar partidos dentro de cada grupo (todos contra todos)
    nuevosGrupos.forEach(g => {
      const ps = []
      for (let i = 0; i < g.equipos.length; i++) {
        for (let j = i + 1; j < g.equipos.length; j++) {
          ps.push({ eq1: g.equipos[i], eq2: g.equipos[j], goles1: null, goles2: null, jugado: false })
        }
      }
      g.partidos = ps
    })
    setGrupos(nuevosGrupos)
    localStorage.setItem('gruposTorneo', JSON.stringify(nuevosGrupos))
    setFaseActual('grupos')
    localStorage.setItem('faseActual', 'grupos')
    setEliminatoria(null)
    localStorage.removeItem('eliminatoriaRondas')
    setMensaje('✅ Grupos generados. Ahora registra los partidos de cada grupo.')
  }

  const abrirPartido = (grupoIdx, partidoIdx) => {
    setPartidoActivo({ grupoIdx, partidoIdx, tipo: 'grupo' })
    setGoles1(0)
    setGoles2(0)
  }

  const abrirPartidoElim = (ronda, idx) => {
    setPartidoActivo({ ronda, idx, tipo: 'elim' })
    setGoles1(0)
    setGoles2(0)
  }

  const registrarResultadoGrupo = () => {
    if (partidoActivo === null) return
    const { grupoIdx, partidoIdx } = partidoActivo
    const g1 = parseInt(goles1)
    const g2 = parseInt(goles2)
    const nuevosGrupos = JSON.parse(JSON.stringify(grupos))
    const partido = nuevosGrupos[grupoIdx].partidos[partidoIdx]
    partido.goles1 = g1
    partido.goles2 = g2
    partido.jugado = true

    // Actualizar stats del grupo
    const eq1 = nuevosGrupos[grupoIdx].equipos.find(e => e.id === partido.eq1.id)
    const eq2 = nuevosGrupos[grupoIdx].equipos.find(e => e.id === partido.eq2.id)
    if (eq1 && eq2) {
      eq1.pj++; eq2.pj++
      eq1.gf += g1; eq1.gc += g2
      eq2.gf += g2; eq2.gc += g1
      if (g1 > g2) { eq1.pg++; eq1.pts += 3; eq2.pp++ }
      else if (g2 > g1) { eq2.pg++; eq2.pts += 3; eq1.pp++ }
      else { eq1.pe++; eq1.pts++; eq2.pe++; eq2.pts++ }
    }

    setGrupos(nuevosGrupos)
    localStorage.setItem('gruposTorneo', JSON.stringify(nuevosGrupos))
    setPartidoActivo(null)
    setMensaje(`✅ Resultado registrado`)
  }

  const todosLosPartidosGrupoJugados = () => {
    return grupos.every(g => g.partidos.every(p => p.jugado))
  }

  const generarEliminatoria = () => {
    // Top 2 de cada grupo
    const clasificados = grupos.flatMap(g => {
      const ordenados = [...g.equipos].sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts
        return (b.gf - b.gc) - (a.gf - a.gc)
      })
      return ordenados.slice(0, 2)
    })

    // Emparejar: 1ro Grupo A vs 2do Grupo B, 1ro Grupo B vs 2do Grupo A, etc.
    const rondas = construirLlave(clasificados)
    setEliminatoria(rondas)
    localStorage.setItem('eliminatoriaRondas', JSON.stringify(rondas))
    setFaseActual('eliminacion')
    localStorage.setItem('faseActual', 'eliminacion')
    setMensaje('🏆 ¡Eliminación directa generada! Registra los resultados.')
  }

  const construirLlave = (clasificados) => {
    // Emparejar alternando grupos: 1A vs 2B, 1B vs 2A, 1C vs 2D, etc.
    const mitad = Math.floor(clasificados.length / 2)
    const cuartos = []
    for (let i = 0; i < clasificados.length; i += 2) {
      cuartos.push({
        eq1: clasificados[i],
        eq2: clasificados[i + 1] || null,
        goles1: null, goles2: null, jugado: false, ganador: null
      })
    }
    return { cuartos, semis: [], final: null, campeon: null }
  }

  const registrarResultadoElim = () => {
    if (partidoActivo === null) return
    const { ronda, idx } = partidoActivo
    const g1 = parseInt(goles1)
    const g2 = parseInt(goles2)
    if (g1 === g2) { setMensaje('⚠️ En eliminación directa no puede haber empate. Define un ganador.'); return }

    const nuevaElim = JSON.parse(JSON.stringify(eliminatoria))
    const partido = nuevaElim[ronda][idx]
    partido.goles1 = g1
    partido.goles2 = g2
    partido.jugado = true
    partido.ganador = g1 > g2 ? partido.eq1 : partido.eq2

    // Si todos los partidos de cuartos están jugados, generar semis
    if (ronda === 'cuartos' && nuevaElim.cuartos.every(p => p.jugado)) {
      const ganadores = nuevaElim.cuartos.map(p => p.ganador)
      nuevaElim.semis = []
      for (let i = 0; i < ganadores.length; i += 2) {
        nuevaElim.semis.push({
          eq1: ganadores[i], eq2: ganadores[i + 1] || null,
          goles1: null, goles2: null, jugado: false, ganador: null
        })
      }
      setMensaje('✅ Cuartos terminados. ¡Hora de las semis!')
    }

    // Si solo hay 2 equipos en cuartos, ir directo a final
    if (ronda === 'cuartos' && nuevaElim.cuartos.length <= 2 && nuevaElim.cuartos.every(p => p.jugado)) {
      if (nuevaElim.cuartos.length === 1) {
        nuevaElim.campeon = nuevaElim.cuartos[0].ganador
        setMensaje(`🏆 ¡Campeón: ${nuevaElim.campeon.equipo} (${nuevaElim.campeon.jugador})!`)
      }
    }

    if (ronda === 'semis' && nuevaElim.semis.every(p => p.jugado)) {
      const ganadores = nuevaElim.semis.map(p => p.ganador)
      nuevaElim.final = {
        eq1: ganadores[0], eq2: ganadores[1] || null,
        goles1: null, goles2: null, jugado: false, ganador: null
      }
      setMensaje('✅ Semis terminadas. ¡A la FINAL!')
    }

    if (ronda === 'final') {
      nuevaElim.campeon = nuevaElim.final.ganador
      setMensaje(`🏆 ¡Campeón: ${nuevaElim.final.ganador?.equipo} (${nuevaElim.final.ganador?.jugador})!`)
    }

    setEliminatoria(nuevaElim)
    localStorage.setItem('eliminatoriaRondas', JSON.stringify(nuevaElim))
    setPartidoActivo(null)
  }

  const sortGrupo = (equiposGrupo) => {
    return [...equiposGrupo].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      return (b.gf - b.gc) - (a.gf - a.gc)
    })
  }

  if (cargando) return <div className="fg-loading">Cargando…</div>

  return (
    <div className="fase-grupos">
      <div className="page-header">
        <h2>Fase de Grupos + Eliminación</h2>
        <p>Distribución de equipos, partidos y cuadro eliminatorio.</p>
      </div>
      <div className="page-divider" />

      {equipos.length === 0 ? (
        <div className="fg-aviso">Primero registra los jugadores en la sección <strong>Registrar Jugadores</strong>.</div>
      ) : grupos.length === 0 ? (
        <div className="fg-setup">
          <p>Hay <strong>{equipos.length} equipos</strong> registrados. Se crearán <strong>{equipos.length <= 8 ? 2 : equipos.length <= 12 ? 3 : 4} grupos</strong> automáticamente.</p>
          <button className="btn-distribuir" onClick={distribuirGrupos}>⚡ Distribuir equipos en grupos</button>
        </div>
      ) : (
        <>
          {mensaje && <div className="fg-mensaje">{mensaje}</div>}

          {/* MODAL resultado */}
          {partidoActivo && (
            <div className="fg-modal-overlay">
              <div className="fg-modal">
                <h3>Registrar Resultado</h3>
                {partidoActivo.tipo === 'grupo' ? (
                  <p>
                    {grupos[partidoActivo.grupoIdx]?.partidos[partidoActivo.partidoIdx]?.eq1?.equipo} vs {grupos[partidoActivo.grupoIdx]?.partidos[partidoActivo.partidoIdx]?.eq2?.equipo}
                  </p>
                ) : (
                  <p>Partido eliminatorio</p>
                )}
                <div className="fg-modal-score">
                  <input type="number" min="0" value={goles1} onChange={e => setGoles1(e.target.value)} className="fg-modal-input" />
                  <span>-</span>
                  <input type="number" min="0" value={goles2} onChange={e => setGoles2(e.target.value)} className="fg-modal-input" />
                </div>
                <div className="fg-modal-btns">
                  <button className="btn-guardar" onClick={partidoActivo.tipo === 'grupo' ? registrarResultadoGrupo : registrarResultadoElim}>💾 Guardar</button>
                  <button className="btn-cancelar" onClick={() => setPartidoActivo(null)}>✕ Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {/* TABS */}
          <div className="fg-tabs">
            <button className={`fg-tab ${faseActual === 'grupos' ? 'activo' : ''}`} onClick={() => setFaseActual('grupos')}>👥 Grupos</button>
            <button className={`fg-tab ${faseActual === 'eliminacion' ? 'activo' : ''}`} onClick={() => setFaseActual('eliminacion')}>⚡ Eliminación</button>
          </div>

          {faseActual === 'grupos' && (
            <div className="fg-grupos-section">
              {grupos.map((grupo, gi) => (
                <div key={gi} className="fg-grupo">
                  <h3 className="fg-grupo-nombre">{grupo.nombre}</h3>
                  <div className="fg-grupo-body">
                    {/* Tabla del grupo */}
                    <div className="fg-grupo-tabla-wrap">
                      <table className="fg-tabla">
                        <thead>
                          <tr>
                            <th style={{textAlign:'left'}}>Equipo</th>
                            <th>PJ</th><th>PG</th><th>PE</th><th>PP</th>
                            <th>GF</th><th>GC</th><th>Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortGrupo(grupo.equipos).map((eq, ei) => (
                            <tr key={eq.id} className={ei < 2 ? 'clasifica' : ''}>
                              <td className="fg-eq-nombre">
                                {ei < 2 && <span className="fg-clasifica-dot" />}
                                {eq.equipo} <span className="fg-jugador">({eq.jugador})</span>
                              </td>
                              <td>{eq.pj}</td><td>{eq.pg}</td><td>{eq.pe}</td><td>{eq.pp}</td>
                              <td>{eq.gf}</td><td>{eq.gc}</td>
                              <td><strong>{eq.pts}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Partidos del grupo */}
                    <div className="fg-grupo-partidos">
                      <h4>Partidos</h4>
                      {grupo.partidos.map((p, pi) => (
                        <div key={pi} className={`fg-partido-fila ${p.jugado ? 'jugado' : ''}`}>
                          <span className="fg-partido-eq">{p.eq1.equipo}</span>
                          <span className="fg-partido-score">
                            {p.jugado ? `${p.goles1} - ${p.goles2}` : 'vs'}
                          </span>
                          <span className="fg-partido-eq">{p.eq2.equipo}</span>
                          {!p.jugado && (
                            <button className="btn-jugar" onClick={() => abrirPartido(gi, pi)}>Registrar</button>
                          )}
                          {p.jugado && <span className="fg-partido-ok">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {todosLosPartidosGrupoJugados() && !eliminatoria && (
                <div className="fg-avanzar">
                  <p>✅ Todos los partidos de grupo están jugados.</p>
                  <button className="btn-distribuir" onClick={generarEliminatoria}>🏆 Generar Eliminación Directa</button>
                </div>
              )}

              <div className="fg-acciones-bottom">
                <button className="btn-redistribuir" onClick={distribuirGrupos}>🔀 Redistribuir grupos</button>
              </div>
            </div>
          )}

          {faseActual === 'eliminacion' && (
            <div className="fg-elim-section">
              {!eliminatoria ? (
                <div className="fg-aviso">
                  Termina todos los partidos de grupo y luego genera la eliminación directa.
                </div>
              ) : (
                <>
                  {eliminatoria.campeon && (
                    <div className="fg-campeon">
                      🏆 ¡CAMPEÓN: <strong>{eliminatoria.campeon.equipo}</strong> ({eliminatoria.campeon.jugador})!
                    </div>
                  )}

                  {/* Cuartos */}
                  {eliminatoria.cuartos?.length > 0 && (
                    <div className="fg-ronda">
                      <h3 className="fg-ronda-titulo">
                        {eliminatoria.cuartos.length === 1 ? '🏆 Final' :
                         eliminatoria.cuartos.length === 2 ? '⚡ Semifinales' : '⚡ Cuartos de Final'}
                      </h3>
                      {eliminatoria.cuartos.map((p, i) => (
                        <div key={i} className={`fg-elim-partido ${p.jugado ? 'jugado' : ''}`}>
                          <span className={`fg-elim-eq ${p.ganador?.id === p.eq1?.id ? 'ganador' : ''}`}>{p.eq1?.equipo} <small>({p.eq1?.jugador})</small></span>
                          <span className="fg-elim-score">{p.jugado ? `${p.goles1} - ${p.goles2}` : 'vs'}</span>
                          <span className={`fg-elim-eq ${p.ganador?.id === p.eq2?.id ? 'ganador' : ''}`}>{p.eq2?.equipo} <small>({p.eq2?.jugador})</small></span>
                          {!p.jugado && p.eq2 && (
                            <button className="btn-jugar" onClick={() => abrirPartidoElim('cuartos', i)}>Registrar</button>
                          )}
                          {p.jugado && <span className="fg-partido-ok">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Semis */}
                  {eliminatoria.semis?.length > 0 && (
                    <div className="fg-ronda">
                      <h3 className="fg-ronda-titulo">⚡ Semifinales</h3>
                      {eliminatoria.semis.map((p, i) => (
                        <div key={i} className={`fg-elim-partido ${p.jugado ? 'jugado' : ''}`}>
                          <span className={`fg-elim-eq ${p.ganador?.id === p.eq1?.id ? 'ganador' : ''}`}>{p.eq1?.equipo} <small>({p.eq1?.jugador})</small></span>
                          <span className="fg-elim-score">{p.jugado ? `${p.goles1} - ${p.goles2}` : 'vs'}</span>
                          <span className={`fg-elim-eq ${p.ganador?.id === p.eq2?.id ? 'ganador' : ''}`}>{p.eq2?.equipo} <small>({p.eq2?.jugador})</small></span>
                          {!p.jugado && p.eq2 && (
                            <button className="btn-jugar" onClick={() => abrirPartidoElim('semis', i)}>Registrar</button>
                          )}
                          {p.jugado && <span className="fg-partido-ok">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Final */}
                  {eliminatoria.final && (
                    <div className="fg-ronda">
                      <h3 className="fg-ronda-titulo">🏆 FINAL</h3>
                      <div className={`fg-elim-partido final ${eliminatoria.final.jugado ? 'jugado' : ''}`}>
                        <span className={`fg-elim-eq ${eliminatoria.final.ganador?.id === eliminatoria.final.eq1?.id ? 'ganador' : ''}`}>
                          {eliminatoria.final.eq1?.equipo} <small>({eliminatoria.final.eq1?.jugador})</small>
                        </span>
                        <span className="fg-elim-score">{eliminatoria.final.jugado ? `${eliminatoria.final.goles1} - ${eliminatoria.final.goles2}` : 'vs'}</span>
                        <span className={`fg-elim-eq ${eliminatoria.final.ganador?.id === eliminatoria.final.eq2?.id ? 'ganador' : ''}`}>
                          {eliminatoria.final.eq2?.equipo} <small>({eliminatoria.final.eq2?.jugador})</small>
                        </span>
                        {!eliminatoria.final.jugado && eliminatoria.final.eq2 && (
                          <button className="btn-jugar" onClick={() => abrirPartidoElim('final', 0)}>Registrar</button>
                        )}
                        {eliminatoria.final.jugado && <span className="fg-partido-ok">✓</span>}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
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

export default FaseGrupos

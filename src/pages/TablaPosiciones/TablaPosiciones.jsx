import { useState, useEffect } from 'react'
import './styles/TablaPosiciones.css'

function TablaPosiciones() {
  const [tabla, setTabla] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { obtenerTabla() }, [])

  const obtenerTabla = async () => {
    setCargando(true)
    const res = await fetch('https://backend-torneo.vercel.app/api/torneo')
    const data = await res.json()
    setTabla(data)
    setCargando(false)
  }

  const getMedalla = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `${index + 1}°`
  }

  return (
    <div className="tabla-posiciones">
      <div className="tp-top">
        <div className="page-header">
          <h2>Tabla de Posiciones</h2>
          <p>Ranking actualizado del torneo</p>
        </div>
        <button className="btn-actualizar" onClick={obtenerTabla}>↻ Actualizar</button>
      </div>
      <div className="page-divider" />

      {cargando ? (
        <div className="tp-loading">Cargando tabla…</div>
      ) : tabla.length === 0 ? (
        <div className="tp-vacia">No hay datos. Registra jugadores y partidos primero.</div>
      ) : (
        <div>
          <div className="tp-tabla-wrapper">
            <table className="tp-tabla">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th style={{textAlign:'left'}}>Jugador</th>
                  <th style={{textAlign:'left'}}>Equipo</th>
                  <th title="Partidos Jugados">PJ</th>
                  <th title="Partidos Ganados">PG</th>
                  <th title="Partidos Empatados">PE</th>
                  <th title="Partidos Perdidos">PP</th>
                  <th title="Goles a Favor">GF</th>
                  <th title="Goles en Contra">GC</th>
                  <th title="Diferencia de Goles">DG</th>
                  <th title="Puntos">Pts</th>
                </tr>
              </thead>
              <tbody>
                {tabla.map((item, index) => {
                  const gf = item.goles_favor ?? item.gf ?? 0
                  const gc = item.goles_contra ?? item.gc ?? 0
                  const dg = gf - gc
                  return (
                    <tr key={item.id} className={index === 0 ? 'lider' : ''}>
                      <td className="td-pos">{getMedalla(index)}</td>
                      <td className="td-jugador">{item.jugador}</td>
                      <td className="td-equipo">{item.equipo}</td>
                      <td>{item.pj}</td>
                      <td className="td-verde">{item.pg}</td>
                      <td className="td-naranja">{item.pe}</td>
                      <td className="td-rojo">{item.pp}</td>
                      <td className="td-verde">{gf}</td>
                      <td className="td-rojo">{gc}</td>
                      <td className={`td-dg ${dg > 0 ? 'td-verde' : dg < 0 ? 'td-rojo' : ''}`}>
                        {dg > 0 ? `+${dg}` : dg}
                      </td>
                      <td className="td-puntos">
                        <span className="tp-pts-pill">{item.puntos}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="tp-leyenda">
            <span><strong>PJ</strong> Jugados</span>
            <span><strong>PG</strong> Ganados</span>
            <span><strong>PE</strong> Empatados</span>
            <span><strong>PP</strong> Perdidos</span>
            <span><strong>GF</strong> Goles a Favor</span>
            <span><strong>GC</strong> Goles en Contra</span>
            <span><strong>DG</strong> Diferencia</span>
            <span><strong>Pts</strong> Puntos</span>
          </div>
        </div>
      )}
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

export default TablaPosiciones

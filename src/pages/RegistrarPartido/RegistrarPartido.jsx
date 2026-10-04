import { useState, useEffect } from 'react'
import './styles/RegistrarPartido.css'

const API = 'https://backend-torneo.vercel.app/api/torneo'

function RegistrarPartido() {
  const [tabla, setTabla] = useState([])
  const [idEquipo1, setIdEquipo1] = useState('')
  const [idEquipo2, setIdEquipo2] = useState('')
  const [golesEquipo1, setGolesEquipo1] = useState(0)
  const [golesEquipo2, setGolesEquipo2] = useState(0)
  const [mensaje, setMensaje] = useState('')
  const [partidos, setPartidos] = useState([])
  const [editando, setEditando] = useState(null)
  const [editGoles1, setEditGoles1] = useState(0)
  const [editGoles2, setEditGoles2] = useState(0)

  useEffect(() => {
    obtenerTabla()
    obtenerPartidos()
  }, [])

  const obtenerTabla = async () => {
    try {
      const res = await fetch(API)

      if (!res.ok) {
        throw new Error(`Error ${res.status}`)
      }

      const data = await res.json()
      setTabla(data)
    } catch (error) {
      console.error('Error obteniendo tabla:', error)
    }
  }

  const obtenerPartidos = async () => {
    try {
      const res = await fetch(`${API}/partidos`)

      if (!res.ok) {
        throw new Error(`Error ${res.status}`)
      }

      const data = await res.json()
      setPartidos(data)
    } catch (error) {
      console.error(
        'Error obteniendo partidos:',
        error
      )
    }
  }

  const determinarResultado = (g1, g2) => {
    const goles1 = Number(g1) || 0
    const goles2 = Number(g2) || 0

    if (goles1 > goles2) return 'gana1'
    if (goles2 > goles1) return 'gana2'

    return 'empate'
  }

  const registrarPartido = async (e) => {
    e.preventDefault()

    if (!idEquipo1 || !idEquipo2) {
      alert('Selecciona ambos equipos')
      return
    }

    if (idEquipo1 === idEquipo2) {
      alert('Los equipos deben ser diferentes')
      return
    }

    const g1 = Number(golesEquipo1) || 0
    const g2 = Number(golesEquipo2) || 0

    const resultado = determinarResultado(
      g1,
      g2
    )

    try {
      const res = await fetch(
        `${API}/partido`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            idEquipo1,
            idEquipo2,
            resultado,
            golesEquipo1: g1,
            golesEquipo2: g2
          })
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.mensaje ||
          `Error ${res.status}`
        )
      }

      const eq1 = tabla.find(
        e =>
          String(e.id) ===
          String(idEquipo1)
      )

      const eq2 = tabla.find(
        e =>
          String(e.id) ===
          String(idEquipo2)
      )

      setMensaje(
        `✅ ${eq1?.equipo || 'Equipo'} ${g1} - ${g2} ${
          eq2?.equipo || 'Equipo'
        }`
      )

      setIdEquipo1('')
      setIdEquipo2('')
      setGolesEquipo1(0)
      setGolesEquipo2(0)

      await obtenerTabla()
      await obtenerPartidos()

    } catch (error) {
      console.error(
        'Error registrando partido:',
        error
      )

      alert(
        `❌ No se pudo registrar el partido.\n\n${error.message}`
      )
    }
  }

  const eliminarPartido = async (id) => {
    if (
      !window.confirm(
        '¿Eliminar este partido? Se revertirán los puntos en la tabla.'
      )
    ) {
      return
    }

    try {
      const res = await fetch(
        `${API}/partido/${id}`,
        {
          method: 'DELETE'
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.mensaje ||
          `Error ${res.status}`
        )
      }

      await obtenerTabla()
      await obtenerPartidos()

    } catch (error) {
      console.error(
        'Error eliminando partido:',
        error
      )

      alert(
        `❌ No se pudo eliminar.\n\n${error.message}`
      )
    }
  }

  const abrirEditar = (partido) => {
    setEditando(partido.id)
    setEditGoles1(
      partido.goles_equipo1
    )
    setEditGoles2(
      partido.goles_equipo2
    )
  }

  const guardarEdicion = async (partido) => {
    const g1 = Number(editGoles1) || 0
    const g2 = Number(editGoles2) || 0

    const resultado = determinarResultado(
      g1,
      g2
    )

    try {
      const res = await fetch(
        `${API}/partido/${partido.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            golesEquipo1: g1,
            golesEquipo2: g2,
            resultado
          })
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.mensaje ||
          `Error ${res.status}`
        )
      }

      setEditando(null)

      await obtenerTabla()
      await obtenerPartidos()

    } catch (error) {
      console.error(
        'Error editando partido:',
        error
      )

      alert(
        `❌ No se pudo editar.\n\n${error.message}`
      )
    }
  }

  return (
    <div className="registrar-partido">

      <div className="page-header">
        <h2>Registrar Partido</h2>

        <p>
          Selecciona los equipos e ingresa
          los goles de cada uno.
        </p>
      </div>

      <div className="page-divider" />

      {tabla.length === 0 ? (

        <div className="rp-aviso">
          No hay equipos registrados.
          Primero ve a{' '}
          <strong>Jugadores</strong>{' '}
          y registra los participantes.
        </div>

      ) : (

        <form
          className="rp-form"
          onSubmit={registrarPartido}
        >

          <div className="rp-scoreboard">

            <div className="rp-equipo">

              <div className="rp-equipo-label">
                Local
              </div>

              <select
                value={idEquipo1}
                onChange={e =>
                  setIdEquipo1(
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  — Seleccionar —
                </option>

                {tabla.map(e => (
                  <option
                    key={e.id}
                    value={e.id}
                  >
                    {e.equipo} ({e.jugador})
                  </option>
                ))}
              </select>

              <div className="rp-goles-wrap">

                <input
                  type="number"
                  min="0"
                  value={golesEquipo1}
                  onChange={e =>
                    setGolesEquipo1(
                      e.target.value === ''
                        ? 0
                        : Number(
                            e.target.value
                          )
                    )
                  }
                  className="rp-goles"
                />

              </div>

            </div>

            <div className="rp-vs">
              VS
            </div>

            <div className="rp-equipo">

              <div className="rp-equipo-label">
                Visitante
              </div>

              <select
                value={idEquipo2}
                onChange={e =>
                  setIdEquipo2(
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  — Seleccionar —
                </option>

                {tabla.map(e => (
                  <option
                    key={e.id}
                    value={e.id}
                  >
                    {e.equipo} ({e.jugador})
                  </option>
                ))}
              </select>

              <div className="rp-goles-wrap">

                <input
                  type="number"
                  min="0"
                  value={golesEquipo2}
                  onChange={e =>
                    setGolesEquipo2(
                      e.target.value === ''
                        ? 0
                        : Number(
                            e.target.value
                          )
                    )
                  }
                  className="rp-goles"
                />

              </div>

            </div>

          </div>

          <div className="rp-preview">

            {idEquipo1 &&
              idEquipo2 && (

                <span
                  className={`rp-badge ${determinarResultado(
                    golesEquipo1,
                    golesEquipo2
                  )}`}
                >

                  {determinarResultado(
                    golesEquipo1,
                    golesEquipo2
                  ) === 'gana1' &&
                    '🏆 Gana Local'}

                  {determinarResultado(
                    golesEquipo1,
                    golesEquipo2
                  ) === 'gana2' &&
                    '🏆 Gana Visitante'}

                  {determinarResultado(
                    golesEquipo1,
                    golesEquipo2
                  ) === 'empate' &&
                    '🤝 Empate'}

                </span>

              )}

          </div>

          {mensaje && (
            <div className="rp-mensaje">
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            className="btn-registrar"
          >
            Subir Resultado
          </button>

        </form>
      )}

      {partidos.length > 0 && (

        <div className="rp-historial">

          <h3 className="rp-historial-titulo">
            Historial de Partidos
          </h3>

          <div className="rp-historial-tabla-wrapper">

            <table className="rp-historial-tabla">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Local</th>
                  <th>Resultado</th>
                  <th>Visitante</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>

                {partidos.map(
                  (p, i) => (

                    <tr key={p.id}>

                      <td>
                        {i + 1}
                      </td>

                      <td>
                        {p.equipo1}
                      </td>

                      <td className="td-resultado">

                        {editando ===
                        p.id ? (

                          <div className="rp-edit-score">

                            <input
                              type="number"
                              min="0"
                              value={
                                editGoles1
                              }
                              onChange={e =>
                                setEditGoles1(
                                  e.target
                                    .value === ''
                                    ? 0
                                    : Number(
                                        e.target
                                          .value
                                      )
                                )
                              }
                              className="rp-edit-input"
                            />

                            <span>-</span>

                            <input
                              type="number"
                              min="0"
                              value={
                                editGoles2
                              }
                              onChange={e =>
                                setEditGoles2(
                                  e.target
                                    .value === ''
                                    ? 0
                                    : Number(
                                        e.target
                                          .value
                                      )
                                )
                              }
                              className="rp-edit-input"
                            />

                          </div>

                        ) : (

                          <span className="rp-score-pill">
                            {
                              p.goles_equipo1
                            }{' '}
                            -{' '}
                            {
                              p.goles_equipo2
                            }
                          </span>

                        )}

                      </td>

                      <td>
                        {p.equipo2}
                      </td>

                      <td className="td-acciones">

                        {editando ===
                        p.id ? (

                          <>

                            <button
                              className="btn-guardar"
                              onClick={() =>
                                guardarEdicion(
                                  p
                                )
                              }
                            >
                              💾 Guardar
                            </button>

                            <button
                              className="btn-cancelar"
                              onClick={() =>
                                setEditando(
                                  null
                                )
                              }
                            >
                              ✕ Cancelar
                            </button>

                          </>

                        ) : (

                          <>

                            <button
                              className="btn-editar"
                              onClick={() =>
                                abrirEditar(
                                  p
                                )
                              }
                            >
                              ✏️ Editar
                            </button>

                            <button
                              className="btn-eliminar"
                              onClick={() =>
                                eliminarPartido(
                                  p.id
                                )
                              }
                            >
                              🗑️ Eliminar
                            </button>

                          </>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

      <p className="created">
        Created by:{' '}

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

export default RegistrarPartido
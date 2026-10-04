import { useState, useEffect } from 'react'
import './styles/CalendarioTodos.css'

const API = 'https://backend-torneo.vercel.app/api/torneo'

// =====================================================
// GENERAR CALENDARIO TODOS CONTRA TODOS
// =====================================================

function generarCalendario(equipos) {
  const n = equipos.length
  const lista = [...equipos]

  if (n % 2 !== 0) {
    lista.push({
      id: 'libre',
      equipo: 'LIBRE',
      jugador: ''
    })
  }

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
        partidos.push({
          eq1,
          eq2,
          goles1: null,
          goles2: null,
          jugado: false
        })
      }
    }

    if (partidos.length > 0) {
      rondas.push({
        nombre: `Fecha ${r + 1}`,
        partidos
      })
    }

    rotables = [
      rotables[rotables.length - 1],
      ...rotables.slice(0, rotables.length - 1)
    ]
  }

  return rondas
}

// =====================================================
// OBTENER ID DE EQUIPO
// =====================================================

function obtenerIdEquipo(equipo) {
  return equipo?.id || equipo?._id || null
}

// =====================================================
// COMPONENTE
// =====================================================

function CalendarioTodos() {
  const [equipos, setEquipos] = useState([])
  const [calendario, setCalendario] = useState([])

  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  // Partido del todos contra todos
  const [partidoActivo, setPartidoActivo] = useState(null)

  // Partido de eliminatoria
  const [partidoEliminatoriaActivo, setPartidoEliminatoriaActivo] =
    useState(null)

  const [goles1, setGoles1] = useState(0)
  const [goles2, setGoles2] = useState(0)

  // ===================================================
  // FASE DEL TORNEO
  // ===================================================

  const [fase, setFase] = useState('todos')

  // semifinales
  const [semifinales, setSemifinales] = useState([])

  // final
  const [final, setFinal] = useState(null)

  // tercer puesto
  const [tercerPuesto, setTercerPuesto] = useState(null)

  // posiciones clasificadas
  const [clasificados, setClasificados] = useState([])

  // resultados finales
  const [campeon, setCampeon] = useState(null)
  const [subcampeon, setSubcampeon] = useState(null)
  const [tercerLugar, setTercerLugar] = useState(null)

  // ===================================================
  // CARGAR DATOS
  // ===================================================

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setCargando(true)

    try {
      const res = await fetch(API)

      if (!res.ok) {
        throw new Error(`Error ${res.status} al obtener equipos`)
      }

      const data = await res.json()

      setEquipos(data)

      // -----------------------------------------------
      // CALENDARIO TODOS CONTRA TODOS
      // -----------------------------------------------

      const guardado = localStorage.getItem('calendarioTodos')

      if (guardado) {
        try {
          setCalendario(JSON.parse(guardado))
        } catch {
          localStorage.removeItem('calendarioTodos')
        }
      }

      // -----------------------------------------------
      // FASE DEL TORNEO
      // -----------------------------------------------

      const faseGuardada = localStorage.getItem('faseTodos')

      if (faseGuardada) {
        setFase(faseGuardada)
      }

      // -----------------------------------------------
      // ELIMINATORIAS
      // -----------------------------------------------

      const eliminatoriaGuardada =
        localStorage.getItem('eliminatoriaTodos')

      if (eliminatoriaGuardada) {
        try {
          const datos = JSON.parse(eliminatoriaGuardada)

          setSemifinales(datos.semifinales || [])
          setFinal(datos.final || null)
          setTercerPuesto(datos.tercerPuesto || null)
          setClasificados(datos.clasificados || [])
          setCampeon(datos.campeon || null)
          setSubcampeon(datos.subcampeon || null)
          setTercerLugar(datos.tercerLugar || null)
        } catch {
          localStorage.removeItem('eliminatoriaTodos')
        }
      }
    } catch (error) {
      console.error('Error cargando calendario:', error)
      setMensaje(`❌ ${error.message}`)
    } finally {
      setCargando(false)
    }
  }

  // ===================================================
  // GUARDAR ESTADO DE ELIMINATORIAS
  // ===================================================

  const guardarEliminatorias = ({
    nuevasSemifinales = semifinales,
    nuevaFinal = final,
    nuevoTercerPuesto = tercerPuesto,
    nuevosClasificados = clasificados,
    nuevoCampeon = campeon,
    nuevoSubcampeon = subcampeon,
    nuevoTercerLugar = tercerLugar
  } = {}) => {
    localStorage.setItem(
      'eliminatoriaTodos',
      JSON.stringify({
        semifinales: nuevasSemifinales,
        final: nuevaFinal,
        tercerPuesto: nuevoTercerPuesto,
        clasificados: nuevosClasificados,
        campeon: nuevoCampeon,
        subcampeon: nuevoSubcampeon,
        tercerLugar: nuevoTercerLugar
      })
    )
  }

  // ===================================================
  // GENERAR FECHAS
  // ===================================================

  const generarFechas = () => {
    if (equipos.length < 2) {
      setMensaje('⚠️ Necesitas al menos 2 equipos.')
      return
    }

    const cal = generarCalendario(equipos)

    setCalendario(cal)

    localStorage.setItem(
      'calendarioTodos',
      JSON.stringify(cal)
    )

    setFase('todos')
    localStorage.setItem('faseTodos', 'todos')

    setMensaje('✅ Calendario generado correctamente.')
  }

  // ===================================================
  // ABRIR PARTIDO TODOS CONTRA TODOS
  // ===================================================

  const abrirPartido = (rondaIdx, partidoIdx) => {
    setPartidoActivo({
      rondaIdx,
      partidoIdx
    })

    setPartidoEliminatoriaActivo(null)

    setGoles1(0)
    setGoles2(0)
    setMensaje('')
  }

  // ===================================================
  // ABRIR PARTIDO DE ELIMINATORIA
  // ===================================================

  const abrirPartidoEliminatoria = (tipo, index = null) => {
    setPartidoEliminatoriaActivo({
      tipo,
      index
    })

    setPartidoActivo(null)

    setGoles1(0)
    setGoles2(0)
    setMensaje('')
  }

  // ===================================================
  // REGISTRAR RESULTADO
  // TODOS CONTRA TODOS
  // ===================================================

  const registrarResultado = async () => {
    if (!partidoActivo) return

    const { rondaIdx, partidoIdx } = partidoActivo

    const g1 = Number(goles1)
    const g2 = Number(goles2)

    if (!Number.isFinite(g1) || !Number.isFinite(g2)) {
      alert('Ingresa goles válidos.')
      return
    }

    if (g1 < 0 || g2 < 0) {
      alert('Los goles no pueden ser negativos.')
      return
    }

    const cal = JSON.parse(
      JSON.stringify(calendario)
    )

    const p =
      cal[rondaIdx]?.partidos?.[partidoIdx]

    if (!p) {
      alert('No se encontró el partido.')
      return
    }

    const idEquipo1 = obtenerIdEquipo(p.eq1)
    const idEquipo2 = obtenerIdEquipo(p.eq2)

    if (!idEquipo1 || !idEquipo2) {
      console.error('IDs de equipos inválidos:', p)

      alert(
        '❌ Error: los equipos no tienen un ID válido.'
      )

      return
    }

    let resultado = 'empate'

    if (g1 > g2) {
      resultado = 'gana1'
    } else if (g2 > g1) {
      resultado = 'gana2'
    }

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
          `Error ${res.status} al registrar el partido`
        )
      }

      p.goles1 = g1
      p.goles2 = g2
      p.jugado = true

      setCalendario(cal)

      localStorage.setItem(
        'calendarioTodos',
        JSON.stringify(cal)
      )

      setPartidoActivo(null)

      setMensaje(
        `✅ ${p.eq1.equipo} ${g1} - ${g2} ${p.eq2.equipo} registrado`
      )
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

  // ===================================================
  // PARTIDOS Y PROGRESO
  // ===================================================

  const totalPartidos = calendario.reduce(
    (s, r) => s + r.partidos.length,
    0
  )

  const jugados = calendario.reduce(
    (s, r) =>
      s +
      r.partidos.filter(
        p => p.jugado
      ).length,
    0
  )

  const todosContraTodosTerminado =
    totalPartidos > 0 &&
    jugados === totalPartidos

  // ===================================================
  // OBTENER CLASIFICACIÓN
  // ===================================================

  const obtenerClasificacion = async () => {
    try {
      const res = await fetch(API)

      if (!res.ok) {
        throw new Error(
          `Error ${res.status} al obtener la tabla`
        )
      }

      const data = await res.json()

      const ordenados = [...data].sort(
        (a, b) => {
          // 1. PUNTOS
          if (b.puntos !== a.puntos) {
            return b.puntos - a.puntos
          }

          // 2. DIFERENCIA DE GOLES
          const difA =
            (a.goles_favor || 0) -
            (a.goles_contra || 0)

          const difB =
            (b.goles_favor || 0) -
            (b.goles_contra || 0)

          if (difB !== difA) {
            return difB - difA
          }

          // 3. GOLES A FAVOR
          return (
            (b.goles_favor || 0) -
            (a.goles_favor || 0)
          )
        }
      )

      return ordenados
    } catch (error) {
      console.error(
        'Error obteniendo clasificación:',
        error
      )

      throw error
    }
  }

  // ===================================================
  // CREAR SEMIFINALES
  // ===================================================

  const crearSemifinales = async () => {
    if (!todosContraTodosTerminado) {
      alert(
        '⚠️ Primero debes terminar todos los partidos del todos contra todos.'
      )

      return
    }

    if (equipos.length < 4) {
      alert(
        '⚠️ Se necesitan al menos 4 equipos para jugar semifinales.'
      )

      return
    }

    try {
      const tabla = await obtenerClasificacion()

      const primerosCuatro = tabla.slice(0, 4)

      if (primerosCuatro.length < 4) {
        alert(
          '❌ No hay 4 equipos disponibles para las semifinales.'
        )

        return
      }

      const nuevasSemifinales = [
        {
          nombre: 'Semifinal 1',
          posicion1: 1,
          posicion2: 4,
          eq1: primerosCuatro[0],
          eq2: primerosCuatro[3],
          goles1: null,
          goles2: null,
          jugado: false,
          ganador: null,
          perdedor: null
        },
        {
          nombre: 'Semifinal 2',
          posicion1: 2,
          posicion2: 3,
          eq1: primerosCuatro[1],
          eq2: primerosCuatro[2],
          goles1: null,
          goles2: null,
          jugado: false,
          ganador: null,
          perdedor: null
        }
      ]

      setClasificados(primerosCuatro)
      setSemifinales(nuevasSemifinales)

      setFinal(null)
      setTercerPuesto(null)
      setCampeon(null)
      setSubcampeon(null)
      setTercerLugar(null)

      setFase('semifinales')

      localStorage.setItem(
        'faseTodos',
        'semifinales'
      )

      guardarEliminatorias({
        nuevasSemifinales,
        nuevaFinal: null,
        nuevoTercerPuesto: null,
        nuevosClasificados: primerosCuatro,
        nuevoCampeon: null,
        nuevoSubcampeon: null,
        nuevoTercerLugar: null
      })

      setMensaje(
        '🏆 Semifinales creadas con los 4 primeros de la tabla.'
      )
    } catch (error) {
      alert(
        `❌ No se pudieron crear las semifinales.\n\n${error.message}`
      )
    }
  }

  // ===================================================
  // REGISTRAR ELIMINATORIA
  // ===================================================

  const registrarEliminatoria = async () => {
    if (!partidoEliminatoriaActivo) return

    const { tipo, index } =
      partidoEliminatoriaActivo

    const g1 = Number(goles1)
    const g2 = Number(goles2)

    if (!Number.isFinite(g1) || !Number.isFinite(g2)) {
      alert('Ingresa goles válidos.')
      return
    }

    if (g1 < 0 || g2 < 0) {
      alert('Los goles no pueden ser negativos.')
      return
    }

    // -----------------------------------------------
    // NO SE PERMITEN EMPATES EN ELIMINATORIAS
    // -----------------------------------------------

    if (g1 === g2) {
      alert(
        '⚠️ En una eliminatoria no puede haber empate.\n\nIngresa un resultado con ganador.'
      )

      return
    }

    let partido

    if (tipo === 'semifinal') {
      partido = semifinales[index]
    } else if (tipo === 'final') {
      partido = final
    } else if (tipo === 'tercer') {
      partido = tercerPuesto
    }

    if (!partido) {
      alert('❌ No se encontró el partido.')
      return
    }

    const idEquipo1 = obtenerIdEquipo(
      partido.eq1
    )

    const idEquipo2 = obtenerIdEquipo(
      partido.eq2
    )

    if (!idEquipo1 || !idEquipo2) {
      alert(
        '❌ Los equipos no tienen un ID válido.'
      )

      return
    }

    const resultado =
      g1 > g2
        ? 'gana1'
        : 'gana2'

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
          `Error ${res.status} al registrar el partido`
        )
      }

      const ganador =
        g1 > g2
          ? partido.eq1
          : partido.eq2

      const perdedor =
        g1 > g2
          ? partido.eq2
          : partido.eq1

      const partidoActualizado = {
        ...partido,
        goles1: g1,
        goles2: g2,
        jugado: true,
        ganador,
        perdedor
      }

      // =============================================
      // SEMIFINAL
      // =============================================

      if (tipo === 'semifinal') {
        const nuevasSemifinales = [
          ...semifinales
        ]

        nuevasSemifinales[index] =
          partidoActualizado

        setSemifinales(
          nuevasSemifinales
        )

        // ¿Ya terminaron las dos semifinales?
        const semifinalesTerminadas =
          nuevasSemifinales.every(
            p => p.jugado
          )

        if (semifinalesTerminadas) {
          const ganador1 =
            nuevasSemifinales[0].ganador

          const ganador2 =
            nuevasSemifinales[1].ganador

          const perdedor1 =
            nuevasSemifinales[0].perdedor

          const perdedor2 =
            nuevasSemifinales[1].perdedor

          const nuevaFinal = {
            nombre: 'Final',
            eq1: ganador1,
            eq2: ganador2,
            goles1: null,
            goles2: null,
            jugado: false,
            ganador: null,
            perdedor: null
          }

          const nuevoTercerPuesto = {
            nombre: 'Tercer Puesto',
            eq1: perdedor1,
            eq2: perdedor2,
            goles1: null,
            goles2: null,
            jugado: false,
            ganador: null,
            perdedor: null
          }

          setFinal(nuevaFinal)
          setTercerPuesto(
            nuevoTercerPuesto
          )

          setFase('finales')

          localStorage.setItem(
            'faseTodos',
            'finales'
          )

          guardarEliminatorias({
            nuevasSemifinales,
            nuevaFinal,
            nuevoTercerPuesto,
            nuevosClasificados: clasificados,
            nuevoCampeon: null,
            nuevoSubcampeon: null,
            nuevoTercerLugar: null
          })

          setMensaje(
            '🏆 ¡Semifinales terminadas! Ya están disponibles la final y el tercer puesto.'
          )
        } else {
          guardarEliminatorias({
            nuevasSemifinales,
            nuevaFinal: final,
            nuevoTercerPuesto: tercerPuesto,
            nuevosClasificados: clasificados,
            nuevoCampeon: campeon,
            nuevoSubcampeon: subcampeon,
            nuevoTercerLugar: tercerLugar
          })

          setMensaje(
            `✅ ${partido.eq1.equipo} ${g1} - ${g2} ${partido.eq2.equipo}`
          )
        }
      }

      // =============================================
      // FINAL
      // =============================================

      else if (tipo === 'final') {
        const nuevaFinal =
          partidoActualizado

        setFinal(nuevaFinal)

        setCampeon(ganador)
        setSubcampeon(perdedor)

        setFase('terminado')

        localStorage.setItem(
          'faseTodos',
          'terminado'
        )

        guardarEliminatorias({
          nuevasSemifinales: semifinales,
          nuevaFinal,
          nuevoTercerPuesto: tercerPuesto,
          nuevosClasificados: clasificados,
          nuevoCampeon: ganador,
          nuevoSubcampeon: perdedor,
          nuevoTercerLugar: tercerLugar
        })

        setMensaje(
          `🏆 ¡Tenemos campeón! ${ganador.equipo}`
        )
      }

      // =============================================
      // TERCER PUESTO
      // =============================================

      else if (tipo === 'tercer') {
        const nuevoTercerPuesto =
          partidoActualizado

        setTercerPuesto(
          nuevoTercerPuesto
        )

        setTercerLugar(ganador)

        guardarEliminatorias({
          nuevasSemifinales: semifinales,
          nuevaFinal: final,
          nuevoTercerPuesto,
          nuevosClasificados: clasificados,
          nuevoCampeon: campeon,
          nuevoSubcampeon: subcampeon,
          nuevoTercerLugar: ganador
        })

        setMensaje(
          `🥉 Tercer puesto: ${ganador.equipo}`
        )
      }

      setPartidoEliminatoriaActivo(null)
    } catch (error) {
      console.error(
        'Error registrando eliminatoria:',
        error
      )

      alert(
        `❌ No se pudo registrar el partido.\n\n${error.message}`
      )
    }
  }

  // ===================================================
  // REGENERAR CALENDARIO
  // ===================================================

  const resetCalendario = () => {
    if (
      !window.confirm(
        '¿Regenerar el calendario? Se perderá el progreso local.'
      )
    ) {
      return
    }

    const cal = generarCalendario(equipos)

    setCalendario(cal)

    localStorage.setItem(
      'calendarioTodos',
      JSON.stringify(cal)
    )

    // Reiniciar fase
    setFase('todos')
    localStorage.setItem(
      'faseTodos',
      'todos'
    )

    setSemifinales([])
    setFinal(null)
    setTercerPuesto(null)
    setClasificados([])
    setCampeon(null)
    setSubcampeon(null)
    setTercerLugar(null)

    localStorage.removeItem(
      'eliminatoriaTodos'
    )

    setMensaje(
      '🔀 Calendario regenerado.'
    )
  }

  // ===================================================
  // CARGANDO
  // ===================================================

  if (cargando) {
    return (
      <div className="ct-loading">
        Cargando…
      </div>
    )
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="calendario-todos">

      {/* ==============================================
          ENCABEZADO
      ============================================== */}

      <div className="page-header">

        <h2>
          Calendario — Todos contra todos
        </h2>

        <p>
          Partidos distribuidos en fechas para
          que todos se enfrenten.
        </p>

      </div>

      <div className="page-divider" />

      {/* ==============================================
          SIN EQUIPOS
      ============================================== */}

      {equipos.length === 0 ? (

        <div className="ct-aviso">
          Primero registra los jugadores.
        </div>

      ) : calendario.length === 0 ? (

        /* ============================================
           GENERAR CALENDARIO
        ============================================ */

        <div className="ct-setup">

          <p>

            <strong>
              {equipos.length} equipos
            </strong>{' '}

            → se necesitan{' '}

            <strong>
              {equipos.length % 2 === 0
                ? equipos.length - 1
                : equipos.length}{' '}
              fechas
            </strong>

            ,{' '}

            <strong>
              {(equipos.length *
                (equipos.length - 1)) /
                2}{' '}
              partidos
            </strong>{' '}

            en total.

          </p>

          <button
            className="btn-generar-cal"
            onClick={generarFechas}
          >
            ⚡ Generar Calendario
          </button>

        </div>

      ) : (

        <>

          {/* ==========================================
              MENSAJE
          ========================================== */}

          {mensaje && (
            <div className="ct-mensaje">
              {mensaje}
            </div>
          )}

          {/* ==========================================
              PROGRESO
          ========================================== */}

          {fase === 'todos' && (

            <div className="ct-progreso">

              <span>
                Partidos jugados:{' '}

                <strong>
                  {jugados} / {totalPartidos}
                </strong>
              </span>

              <div className="ct-barra-wrap">

                <div
                  className="ct-barra"
                  style={{
                    width: `${
                      totalPartidos
                        ? (jugados /
                            totalPartidos) *
                          100
                        : 0
                    }%`
                  }}
                />

              </div>

              <button
                className="btn-reset-cal"
                onClick={resetCalendario}
              >
                🔀 Regenerar
              </button>

            </div>

          )}

          {/* ==========================================
              BOTÓN PASAR A SEMIFINALES
          ========================================== */}

          {fase === 'todos' &&
            todosContraTodosTerminado && (
              <div
                className="ct-setup"
                style={{
                  marginBottom: '20px'
                }}
              >

                <h3>
                  🏆 Todos contra todos terminado
                </h3>

                <p>
                  Los 4 primeros de la tabla
                  pasarán a semifinales.
                </p>

                <button
                  className="btn-generar-cal"
                  onClick={crearSemifinales}
                >
                  🏆 Pasar a semifinales
                </button>

              </div>
            )}

          {/* ==========================================
              MODAL TODOS CONTRA TODOS
          ========================================== */}

          {partidoActivo && (

            <div className="ct-modal-overlay">

              <div className="ct-modal">

                <h3>
                  Registrar Resultado
                </h3>

                <div className="ct-modal-equipos">

                  <span>
                    {
                      calendario[
                        partidoActivo.rondaIdx
                      ]?.partidos[
                        partidoActivo.partidoIdx
                      ]?.eq1?.equipo
                    }
                  </span>

                  <span className="ct-modal-vs">
                    VS
                  </span>

                  <span>
                    {
                      calendario[
                        partidoActivo.rondaIdx
                      ]?.partidos[
                        partidoActivo.partidoIdx
                      ]?.eq2?.equipo
                    }
                  </span>

                </div>

                <div className="ct-modal-score">

                  <input
                    type="number"
                    min="0"
                    value={goles1}
                    onChange={e =>
                      setGoles1(
                        e.target.value === ''
                          ? 0
                          : Number(e.target.value)
                      )
                    }
                    className="ct-modal-input"
                  />

                  <span>-</span>

                  <input
                    type="number"
                    min="0"
                    value={goles2}
                    onChange={e =>
                      setGoles2(
                        e.target.value === ''
                          ? 0
                          : Number(e.target.value)
                      )
                    }
                    className="ct-modal-input"
                  />

                </div>

                <div className="ct-modal-btns">

                  <button
                    className="btn-guardar-ct"
                    onClick={registrarResultado}
                  >
                    💾 Guardar
                  </button>

                  <button
                    className="btn-cancelar-ct"
                    onClick={() =>
                      setPartidoActivo(null)
                    }
                  >
                    ✕ Cancelar
                  </button>

                </div>

              </div>

            </div>

          )}

          {/* ==========================================
              MODAL ELIMINATORIAS
          ========================================== */}

          {partidoEliminatoriaActivo && (

            <div className="ct-modal-overlay">

              <div className="ct-modal">

                <h3>
                  Registrar Resultado
                </h3>

                <p
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  {partidoEliminatoriaActivo.tipo ===
                  'semifinal'
                    ? semifinales[
                        partidoEliminatoriaActivo.index
                      ]?.nombre
                    : partidoEliminatoriaActivo.tipo ===
                      'final'
                    ? '🏆 FINAL'
                    : '🥉 TERCER PUESTO'}
                </p>

                <div className="ct-modal-equipos">

                  <span>
                    {(
                      partidoEliminatoriaActivo.tipo ===
                      'semifinal'
                        ? semifinales[
                            partidoEliminatoriaActivo.index
                          ]
                        : partidoEliminatoriaActivo.tipo ===
                          'final'
                        ? final
                        : tercerPuesto
                    )?.eq1?.equipo}
                  </span>

                  <span className="ct-modal-vs">
                    VS
                  </span>

                  <span>
                    {(
                      partidoEliminatoriaActivo.tipo ===
                      'semifinal'
                        ? semifinales[
                            partidoEliminatoriaActivo.index
                          ]
                        : partidoEliminatoriaActivo.tipo ===
                          'final'
                        ? final
                        : tercerPuesto
                    )?.eq2?.equipo}
                  </span>

                </div>

                <div className="ct-modal-score">

                  <input
                    type="number"
                    min="0"
                    value={goles1}
                    onChange={e =>
                      setGoles1(
                        e.target.value === ''
                          ? 0
                          : Number(e.target.value)
                      )
                    }
                    className="ct-modal-input"
                  />

                  <span>-</span>

                  <input
                    type="number"
                    min="0"
                    value={goles2}
                    onChange={e =>
                      setGoles2(
                        e.target.value === ''
                          ? 0
                          : Number(e.target.value)
                      )
                    }
                    className="ct-modal-input"
                  />

                </div>

                <p
                  style={{
                    textAlign: 'center',
                    fontSize: '14px'
                  }}
                >
                  ⚠️ Las eliminatorias no pueden
                  terminar en empate.
                </p>

                <div className="ct-modal-btns">

                  <button
                    className="btn-guardar-ct"
                    onClick={
                      registrarEliminatoria
                    }
                  >
                    💾 Guardar
                  </button>

                  <button
                    className="btn-cancelar-ct"
                    onClick={() =>
                      setPartidoEliminatoriaActivo(
                        null
                      )
                    }
                  >
                    ✕ Cancelar
                  </button>

                </div>

              </div>

            </div>

          )}

          {/* ==========================================
              TODOS CONTRA TODOS
          ========================================== */}

          {fase === 'todos' && (

            <div className="ct-fechas">

              {calendario.map(
                (ronda, ri) => {

                  const todos =
                    ronda.partidos.every(
                      p => p.jugado
                    )

                  const algunos =
                    ronda.partidos.some(
                      p => p.jugado
                    )

                  return (

                    <div
                      key={ri}
                      className={`ct-fecha ${
                        todos
                          ? 'completa'
                          : algunos
                          ? 'parcial'
                          : ''
                      }`}
                    >

                      <div className="ct-fecha-header">

                        <span className="ct-fecha-nombre">
                          {ronda.nombre}
                        </span>

                        <span className="ct-fecha-estado">

                          {todos
                            ? '✅ Completa'
                            : algunos
                            ? `${
                                ronda.partidos.filter(
                                  p => p.jugado
                                ).length
                              }/${
                                ronda.partidos.length
                              } jugados`
                            : 'Pendiente'}

                        </span>

                      </div>

                      <div className="ct-fecha-partidos">

                        {ronda.partidos.map(
                          (p, pi) => (

                            <div
                              key={pi}
                              className={`ct-partido ${
                                p.jugado
                                  ? 'jugado'
                                  : ''
                              }`}
                            >

                              <span
                                className={`ct-eq ${
                                  p.jugado &&
                                  p.goles1 >
                                    p.goles2
                                    ? 'ganador'
                                    : ''
                                }`}
                              >

                                <span className="ct-eq-nombre">
                                  {p.eq1.equipo}
                                </span>

                                <span className="ct-eq-jugador">
                                  {p.eq1.jugador}
                                </span>

                              </span>

                              <span className="ct-score">

                                {p.jugado ? (

                                  <strong>
                                    {p.goles1} - {p.goles2}
                                  </strong>

                                ) : (

                                  <span className="ct-vs">
                                    vs
                                  </span>

                                )}

                              </span>

                              <span
                                className={`ct-eq ct-eq-right ${
                                  p.jugado &&
                                  p.goles2 >
                                    p.goles1
                                    ? 'ganador'
                                    : ''
                                }`}
                              >

                                <span className="ct-eq-nombre">
                                  {p.eq2.equipo}
                                </span>

                                <span className="ct-eq-jugador">
                                  {p.eq2.jugador}
                                </span>

                              </span>

                              {!p.jugado ? (

                                <button
                                  className="btn-jugar-ct"
                                  onClick={() =>
                                    abrirPartido(
                                      ri,
                                      pi
                                    )
                                  }
                                >
                                  Registrar
                                </button>

                              ) : (

                                <span className="ct-ok">
                                  ✓
                                </span>

                              )}

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )
                }
              )}

            </div>

          )}

          {/* ==========================================
              CLASIFICADOS
          ========================================== */}

          {fase !== 'todos' &&
            clasificados.length > 0 && (

              <div
                className="ct-setup"
                style={{
                  marginBottom: '20px'
                }}
              >

                <h3>
                  🏆 Clasificados a semifinales
                </h3>

                {clasificados.map(
                  (equipo, index) => (

                    <div
                      key={
                        obtenerIdEquipo(equipo) ||
                        index
                      }
                      style={{
                        padding: '8px',
                        fontWeight:
                          index < 4
                            ? 'bold'
                            : 'normal'
                      }}
                    >

                      {index + 1}.{' '}
                      {equipo.equipo}{' '}

                      <span
                        style={{
                          fontWeight: 'normal'
                        }}
                      >
                        — {equipo.puntos} pts
                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          {/* ==========================================
              SEMIFINALES
          ========================================== */}

          {fase !== 'todos' &&
            semifinales.length > 0 && (

              <div
                className="ct-fechas"
                style={{
                  marginTop: '20px'
                }}
              >

                <div className="ct-fecha completa">

                  <div className="ct-fecha-header">

                    <span className="ct-fecha-nombre">
                      🏆 SEMIFINALES
                    </span>

                    <span className="ct-fecha-estado">
                      1.º vs 4.º / 2.º vs 3.º
                    </span>

                  </div>

                  <div className="ct-fecha-partidos">

                    {semifinales.map(
                      (p, index) => (

                        <div
                          key={index}
                          className={`ct-partido ${
                            p.jugado
                              ? 'jugado'
                              : ''
                          }`}
                        >

                          <span
                            className={`ct-eq ${
                              p.jugado &&
                              p.goles1 >
                                p.goles2
                                ? 'ganador'
                                : ''
                            }`}
                          >

                            <span className="ct-eq-nombre">
                              {p.eq1.equipo}
                            </span>

                            <span className="ct-eq-jugador">
                              {p.eq1.jugador}
                            </span>

                          </span>

                          <span className="ct-score">

                            {p.jugado ? (

                              <strong>
                                {p.goles1} - {p.goles2}
                              </strong>

                            ) : (

                              <span className="ct-vs">
                                vs
                              </span>

                            )}

                          </span>

                          <span
                            className={`ct-eq ct-eq-right ${
                              p.jugado &&
                              p.goles2 >
                                p.goles1
                                ? 'ganador'
                                : ''
                            }`}
                          >

                            <span className="ct-eq-nombre">
                              {p.eq2.equipo}
                            </span>

                            <span className="ct-eq-jugador">
                              {p.eq2.jugador}
                            </span>

                          </span>

                          {!p.jugado ? (

                            <button
                              className="btn-jugar-ct"
                              onClick={() =>
                                abrirPartidoEliminatoria(
                                  'semifinal',
                                  index
                                )
                              }
                            >
                              Registrar
                            </button>

                          ) : (

                            <span className="ct-ok">
                              ✓
                            </span>

                          )}

                        </div>

                      )
                    )}

                  </div>

                </div>

              </div>

            )}

          {/* ==========================================
              FINAL Y TERCER PUESTO
          ========================================== */}

          {(fase === 'finales' ||
            fase === 'terminado') && (

            <div
              className="ct-fechas"
              style={{
                marginTop: '20px'
              }}
            >

              {/* ======================================
                  FINAL
              ====================================== */}

              {final && (

                <div className="ct-fecha completa">

                  <div className="ct-fecha-header">

                    <span className="ct-fecha-nombre">
                      🏆 FINAL
                    </span>

                    <span className="ct-fecha-estado">
                      {final.jugado
                        ? '✅ Jugada'
                        : 'Pendiente'}
                    </span>

                  </div>

                  <div className="ct-fecha-partidos">

                    <div
                      className={`ct-partido ${
                        final.jugado
                          ? 'jugado'
                          : ''
                      }`}
                    >

                      <span
                        className={`ct-eq ${
                          final.jugado &&
                          final.goles1 >
                            final.goles2
                            ? 'ganador'
                            : ''
                        }`}
                      >

                        <span className="ct-eq-nombre">
                          {final.eq1.equipo}
                        </span>

                        <span className="ct-eq-jugador">
                          {final.eq1.jugador}
                        </span>

                      </span>

                      <span className="ct-score">

                        {final.jugado ? (

                          <strong>
                            {final.goles1} - {final.goles2}
                          </strong>

                        ) : (

                          <span className="ct-vs">
                            vs
                          </span>

                        )}

                      </span>

                      <span
                        className={`ct-eq ct-eq-right ${
                          final.jugado &&
                          final.goles2 >
                            final.goles1
                            ? 'ganador'
                            : ''
                        }`}
                      >

                        <span className="ct-eq-nombre">
                          {final.eq2.equipo}
                        </span>

                        <span className="ct-eq-jugador">
                          {final.eq2.jugador}
                        </span>

                      </span>

                      {!final.jugado ? (

                        <button
                          className="btn-jugar-ct"
                          onClick={() =>
                            abrirPartidoEliminatoria(
                              'final'
                            )
                          }
                        >
                          Registrar
                        </button>

                      ) : (

                        <span className="ct-ok">
                          ✓
                        </span>

                      )}

                    </div>

                  </div>

                </div>

              )}

              {/* ======================================
                  TERCER PUESTO
              ====================================== */}

              {tercerPuesto && (

                <div className="ct-fecha completa">

                  <div className="ct-fecha-header">

                    <span className="ct-fecha-nombre">
                      🥉 TERCER PUESTO
                    </span>

                    <span className="ct-fecha-estado">
                      {tercerPuesto.jugado
                        ? '✅ Jugado'
                        : 'Pendiente'}
                    </span>

                  </div>

                  <div className="ct-fecha-partidos">

                    <div
                      className={`ct-partido ${
                        tercerPuesto.jugado
                          ? 'jugado'
                          : ''
                      }`}
                    >

                      <span
                        className={`ct-eq ${
                          tercerPuesto.jugado &&
                          tercerPuesto.goles1 >
                            tercerPuesto.goles2
                            ? 'ganador'
                            : ''
                        }`}
                      >

                        <span className="ct-eq-nombre">
                          {tercerPuesto.eq1.equipo}
                        </span>

                        <span className="ct-eq-jugador">
                          {tercerPuesto.eq1.jugador}
                        </span>

                      </span>

                      <span className="ct-score">

                        {tercerPuesto.jugado ? (

                          <strong>
                            {tercerPuesto.goles1} -{' '}
                            {tercerPuesto.goles2}
                          </strong>

                        ) : (

                          <span className="ct-vs">
                            vs
                          </span>

                        )}

                      </span>

                      <span
                        className={`ct-eq ct-eq-right ${
                          tercerPuesto.jugado &&
                          tercerPuesto.goles2 >
                            tercerPuesto.goles1
                            ? 'ganador'
                            : ''
                        }`}
                      >

                        <span className="ct-eq-nombre">
                          {tercerPuesto.eq2.equipo}
                        </span>

                        <span className="ct-eq-jugador">
                          {tercerPuesto.eq2.jugador}
                        </span>

                      </span>

                      {!tercerPuesto.jugado ? (

                        <button
                          className="btn-jugar-ct"
                          onClick={() =>
                            abrirPartidoEliminatoria(
                              'tercer'
                            )
                          }
                        >
                          Registrar
                        </button>

                      ) : (

                        <span className="ct-ok">
                          ✓
                        </span>

                      )}

                    </div>

                  </div>

                </div>

              )}

            </div>

          )}

          {/* ==========================================
              PODIO
          ========================================== */}

          {fase === 'terminado' &&
            campeon && (

              <div
                className="ct-setup"
                style={{
                  marginTop: '30px',
                  textAlign: 'center'
                }}
              >

                <h2>
                  🏆 TORNEO TERMINADO 🏆
                </h2>

                <div
                  style={{
                    marginTop: '20px',
                    fontSize: '20px',
                    lineHeight: '1.8'
                  }}
                >

                  <div>
                    🥇{' '}
                    <strong>
                      CAMPEÓN:
                    </strong>{' '}
                    {campeon.equipo}
                  </div>

                  {subcampeon && (
                    <div>
                      🥈{' '}
                      <strong>
                        SUBCAMPEÓN:
                      </strong>{' '}
                      {subcampeon.equipo}
                    </div>
                  )}

                  {tercerLugar && (
                    <div>
                      🥉{' '}
                      <strong>
                        TERCER PUESTO:
                      </strong>{' '}
                      {tercerLugar.equipo}
                    </div>
                  )}

                </div>

              </div>

            )}

        </>

      )}

      {/* ==============================================
          FOOTER
      ============================================== */}

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

export default CalendarioTodos
import { useState } from 'react'
import './styles/RegistrarJugadores.css'

function RegistrarJugadores() {
  const [numParticipantes, setNumParticipantes] = useState(4)
  const [datosIngresados, setDatosIngresados] = useState([])
  const [mensaje, setMensaje] = useState('')

  const inicializarFormulario = () => {
    const campos = Array.from({ length: numParticipantes }, () => ({ jugador: '', equipo: '' }))
    setDatosIngresados(campos)
    setMensaje('')
  }

  const handleInputChange = (index, campo, valor) => {
    const nuevosDatos = [...datosIngresados]
    nuevosDatos[index][campo] = valor
    setDatosIngresados(nuevosDatos)
  }

  const guardarManual = async (e) => {
    e.preventDefault()
    await fetch('http://localhost:5000/api/torneo/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parejas: datosIngresados })
    })
    setMensaje('✅ Jugadores registrados correctamente (manual)')
    setDatosIngresados([])
  }

  const guardarRifa = async (e) => {
    e.preventDefault()
    const nombres = datosIngresados.map(d => d.jugador)
    const nombresEquipos = datosIngresados.map(d => d.equipo)
    await fetch('http://localhost:5000/api/torneo/rifar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombres, nombresEquipos })
    })
    setMensaje('🎲 Equipos rifados y registrados correctamente')
    setDatosIngresados([])
  }

  return (
    <div className="registrar-jugadores">
      <div className="page-header">
        <h2>Registrar Jugadores</h2>
        <p>Ingresa los participantes y asigna los equipos manualmente o por rifa.</p>
      </div>
      <div className="page-divider" />

      <div className="rj-config">
        <label>¿Cuántos jugadores participan?</label>
        <div className="rj-config-row">
          <input
            type="number"
            value={numParticipantes}
            min="2"
            onChange={(e) => setNumParticipantes(parseInt(e.target.value))}
          />
          <button className="btn-generar" onClick={inicializarFormulario}>
            Generar filas
          </button>
        </div>
      </div>

      {mensaje && <div className="rj-mensaje">{mensaje}</div>}

      {datosIngresados.length > 0 && (
        <form className="rj-form">
          <div className="rj-header-row">
            <span>Jugador</span>
            <span>Equipo de Fútbol</span>
          </div>
          {datosIngresados.map((item, index) => (
            <div key={index} className="rj-fila">
              <input
                type="text"
                placeholder={`Jugador ${index + 1}`}
                value={item.jugador}
                onChange={(e) => handleInputChange(index, 'jugador', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder={`Equipo ${index + 1}`}
                value={item.equipo}
                onChange={(e) => handleInputChange(index, 'equipo', e.target.value)}
                required
              />
            </div>
          ))}
          <div className="rj-acciones">
            <button type="button" className="btn-manual" onClick={guardarManual}>
              📝 Asignar Manual
            </button>
            <button type="button" className="btn-rifa" onClick={guardarRifa}>
              🎲 Rifar Equipos
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default RegistrarJugadores

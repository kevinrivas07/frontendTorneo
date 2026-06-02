import React, { useState, useEffect } from 'react';

function App() {
  const [tabla, setTabla] = useState([]);
  
  // Estados para la carga de datos
  const [numParticipantes, setNumParticipantes] = useState(4);
  const [datosIngresados, setDatosIngresados] = useState([]);
  
  // Estados para jugar el partido
  const [idEquipo1, setIdEquipo1] = useState('');
  const [idEquipo2, setIdEquipo2] = useState('');
  const [resultadoPartido, setResultadoPartido] = useState('gana1');

  // Cargar tabla al iniciar
  useEffect(() => {
    obtenerTabla();
  }, []);

  const obtenerTabla = async () => {
    const res = await fetch('http://localhost:5000/api/torneo');
    const data = await res.json();
    setTabla(data);
  };

  // Preparar los campos según el número de participantes elegido
  const inicializarFormulario = () => {
    const campos = Array.from({ length: numParticipantes }, () => ({ jugador: '', equipo: '' }));
    setDatosIngresados(campos);
  };

  const handleInputChange = (index, campo, valor) => {
    const nuevosDatos = [...datosIngresados];
    nuevosDatos[index][campo] = valor;
    setDatosIngresados(nuevosDatos);
  };

  // Enviar para Asignación Manual
  const guardarManual = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/torneo/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parejas: datosIngresados })
    });
    obtenerTabla();
  };

  // Enviar para Rifa Aleatoria
  const guardarRifa = async (e) => {
    e.preventDefault();
    const nombres = datosIngresados.map(d => d.jugador);
    const nombresEquipos = datosIngresados.map(d => d.equipo);

    await fetch('http://localhost:5000/api/torneo/rifar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombres, nombresEquipos })
    });
    obtenerTabla();
  };

  // Enviar resultado del Partido
  const registrarPartido = async (e) => {
    e.preventDefault();
    if(!idEquipo1 || !idEquipo2) return alert("Selecciona ambos equipos");

    await fetch('http://localhost:5000/api/torneo/partido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idEquipo1, idEquipo2, resultado: resultadoPartido })
    });
    
    // Resetear selectores y actualizar
    setIdEquipo1('');
    setIdEquipo2('');
    obtenerTabla();
  };

  const reiniciarTorneo = async () => {
    await fetch('http://localhost:5000/api/torneo/reiniciar', { method: 'DELETE' });
    setTabla([]);
    setDatosIngresados([]);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>⚽ Gestor de Torneo de Fútbol ⚽</h1>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={reiniciarTorneo} style={{ backgroundColor: '#e74c3c', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Reiniciar Todo el Torneo
        </button>
      </div>

      <hr />

      {/* SECCIÓN 1: CONFIGURACIÓN E INGRESO DE DATOS */}
      {tabla.length === 0 && (
        <section style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>1. Registrar Jugadores y Equipos</h2>
          <label>¿Cuántos jugarán? </label>
          <input type="number" value={numParticipantes} onChange={(e) => setNumParticipantes(parseInt(e.target.value))} min="2" style={{ marginRight: '10px', padding: '5px' }} />
          <button onClick={inicializarFormulario} style={{ padding: '5px 10px' }}>Generar Filas</button>

          {datosIngresados.length > 0 && (
            <form style={{ marginTop: '20px' }}>
              {datosIngresados.map((item, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <input type="text" placeholder={`Jugador ${index + 1}`} value={item.jugador} onChange={(e) => handleInputChange(index, 'jugador', e.target.value)} required style={{ marginRight: '10px', padding: '5px' }} />
                  <input type="text" placeholder={`Equipo ${index + 1}`} value={item.equipo} onChange={(e) => handleInputChange(index, 'equipo', e.target.value)} required style={{ padding: '5px' }} />
                </div>
              ))}
              <div style={{ marginTop: '15px' }}>
                <button onClick={guardarManual} style={{ backgroundColor: '#3498db', color: 'white', padding: '10px', border: 'none', marginRight: '10px', borderRadius: '5px', cursor: 'pointer' }}>
                  Asignar tal cual escribí (Manual)
                </button>
                <button onClick={guardarRifa} style={{ backgroundColor: '#2ecc71', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  🎲 Rifar Equipos Aleatoriamente
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {tabla.length > 0 && (
        <>
          {/* SECCIÓN 2: CONTROL DE PARTIDOS */}
          <section style={{ backgroundColor: '#edf2f7', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2>2. Registrar Resultado del Partido</h2>
            <form onSubmit={registrarPartido} style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label>Equipo 1: </label>
                <select value={idEquipo1} onChange={(e) => setIdEquipo1(e.target.value)} style={{ padding: '5px' }}>
                  <option value="">--Seleccionar--</option>
                  {tabla.map(e => <option key={e.id} value={e.id}>{e.equipo} ({e.jugador})</option>)}
                </select>
              </div>

              <div>
                <label>Resultado: </label>
                <select value={resultadoPartido} onChange={(e) => setResultadoPartido(e.target.value)} style={{ padding: '5px', fontWeight: 'bold' }}>
                  <option value="gana1">Ganó Equipo 1 (y perdió Equipo 2)</option>
                  <option value="empate">Empataron (1 pto a cada uno)</option>
                  <option value="gana2">Ganó Equipo 2 (y perdió Equipo 1)</option>
                </select>
              </div>

              <div>
                <label>Equipo 2: </label>
                <select value={idEquipo2} onChange={(e) => setIdEquipo2(e.target.value)} style={{ padding: '5px' }}>
                  <option value="">--Seleccionar--</option>
                  {tabla.map(e => <option key={e.id} value={e.id}>{e.equipo} ({e.jugador})</option>)}
                </select>
              </div>

              <button type="submit" style={{ backgroundColor: '#2c3e50', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Subir Resultado
              </button>
            </form>
          </section>

          {/* SECCIÓN 3: TABLA DE POSICIONES */}
          <section>
            <h2>🏆 Tabla de Posiciones</h2>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                <tr>
                  <th>Pos</th>
                  <th>Jugador</th>
                  <th>Equipo</th>
                  <th>PJ</th>
                  <th>PG</th>
                  <th>PE</th>
                  <th>PP</th>
                  <th>Puntos</th>
                </tr>
              </thead>
              <tbody>
                {tabla.map((item, index) => (
                  <tr key={item.id} style={{ backgroundColor: index === 0 ? '#fff9db' : 'white' }}>
                    <td><strong>{index + 1}°</strong></td>
                    <td>{item.jugador}</td>
                    <td>{item.equipo}</td>
                    <td>{item.pj}</td>
                    <td style={{ color: 'green' }}>{item.pg}</td>
                    <td style={{ color: 'orange' }}>{item.pe}</td>
                    <td style={{ color: 'red' }}>{item.pp}</td>
                    <td><strong>{item.puntos} pts</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

export default App;
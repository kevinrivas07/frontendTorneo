import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home/Home'
import RegistrarJugadores from './pages/RegistrarJugadores/RegistrarJugadores'
import RegistrarPartido from './pages/RegistrarPartido/RegistrarPartido'
import TablaPosiciones from './pages/TablaPosiciones/TablaPosiciones'
import FaseGrupos from './pages/FaseGrupos/FaseGrupos'
import CalendarioTodos from './pages/CalendarioTodos/CalendarioTodos'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registrar-jugadores" element={<RegistrarJugadores />} />
          <Route path="/registrar-partido" element={<RegistrarPartido />} />
          <Route path="/tabla-posiciones" element={<TablaPosiciones />} />
          <Route path="/fase-grupos" element={<FaseGrupos />} />
          <Route path="/calendario" element={<CalendarioTodos />} />
        </Routes>
      </div>
    </>
  )
}

export default App

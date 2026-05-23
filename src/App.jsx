import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import RutaProtegida from './components/RutaProtegida'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Feed from './pages/Feed'
import EditarPerfil from './pages/EditarPerfil'
import VerPerfil from './pages/VerPerfil'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"           element={<Login />} />
          <Route path="/registro"        element={<Registro />} />
          <Route path="/feed"            element={<RutaProtegida><Feed /></RutaProtegida>} />
          <Route path="/perfil/editar"   element={<RutaProtegida><EditarPerfil /></RutaProtegida>} />
          <Route path="/perfil/:id"      element={<RutaProtegida><VerPerfil /></RutaProtegida>} />
          <Route path="*"               element={<Navigate to="/feed" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

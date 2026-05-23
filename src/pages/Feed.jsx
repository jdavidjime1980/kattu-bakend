import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { urlOptimizada } from '../lib/cloudinary'
import { Button } from '../components/ui'

export default function Feed() {
  const { perfil, logout } = useAuth()
  const navigate = useNavigate()

  const foto = urlOptimizada(perfil?.foto_url, { width: 160, height: 160 })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">

        {/* Foto de perfil */}
        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-brand-200 bg-brand-50 flex items-center justify-center">
          {foto ? (
            <img src={foto} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <span className="text-brand-400 text-3xl font-bold">
              {perfil?.nombre?.[0]?.toUpperCase() ?? '?'}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Hola, {perfil?.nombre ?? 'Usuario'} 👋
        </h2>
        <p className="text-gray-500 text-sm mb-2">
          {perfil?.barrio} · {perfil?.edad} años
        </p>
        {perfil?.bio && (
          <p className="text-gray-600 text-sm mb-3 italic">"{perfil.bio}"</p>
        )}
        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6
          ${perfil?.rol === 'mujer' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
          {perfil?.rol === 'mujer' ? '✨ Creadora' : '👀 Explorador'}
        </span>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 text-left">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Semana 2 completada ✓
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex gap-2"><span className="text-green-500">✓</span> Foto de perfil con Cloudinary</li>
            <li className="flex gap-2"><span className="text-green-500">✓</span> Edición de perfil completa</li>
            <li className="flex gap-2"><span className="text-green-500">✓</span> Bio y datos actualizados</li>
            <li className="flex gap-2"><span className="text-gray-300">○</span> Feed de perfiles (semana 3)</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/perfil/editar')}>
            Editar mi perfil
          </Button>
          <Button variant="outline" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  )
}

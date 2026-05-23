import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui'

export default function Feed() {
  const { perfil, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 bg-brand-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-brand-600 text-3xl font-bold">
            {perfil?.nombre?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Hola, {perfil?.nombre ?? 'Usuario'} 👋
        </h2>
        <p className="text-gray-500 text-sm mb-2">
          {perfil?.barrio} · {perfil?.edad} años
        </p>
        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6
          ${perfil?.rol === 'mujer' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
          {perfil?.rol === 'mujer' ? '✨ Creadora' : '👀 Explorador'}
        </span>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 text-left">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Semana 1 completada ✓
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex gap-2"><span className="text-green-500">✓</span> Registro con email y contraseña</li>
            <li className="flex gap-2"><span className="text-green-500">✓</span> Perfil con barrio, edad y rol</li>
            <li className="flex gap-2"><span className="text-green-500">✓</span> Sesión persistente con Supabase</li>
            <li className="flex gap-2"><span className="text-green-500">✓</span> PWA instalable en el dispositivo</li>
          </ul>
          <p className="text-xs text-gray-400 mt-4">
            El feed de perfiles llega en la semana 3.
          </p>
        </div>

        <Button variant="outline" onClick={logout}>Cerrar sesión</Button>
      </div>
    </div>
  )
}

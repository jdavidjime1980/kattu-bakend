import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMatches } from '../hooks/useLikes'
import { useNoLeidos } from '../hooks/useChat'
import { urlOptimizada } from '../lib/cloudinary'
import { Spinner } from '../components/ui'
import { NavBar } from './Feed'

export default function Matches() {
  const navigate       = useNavigate()
  const { user }       = useAuth()
  const { matches, cargando } = useMatches()
  const { noLeidos }   = useNoLeidos(user?.id)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-gray-900">Mis matches</h1>
          <p className="text-xs text-gray-400">{matches.length} conexiones mutuas</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {cargando ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💔</div>
            <p className="text-gray-500 font-medium">Aún no tienes matches</p>
            <p className="text-gray-400 text-sm mt-1">Explora perfiles y da megusta para conectar</p>
            <button onClick={() => navigate('/feed')}
              className="mt-6 px-6 py-3 bg-brand-600 text-white rounded-2xl font-semibold text-sm
                hover:bg-brand-500 transition active:scale-95">
              Explorar perfiles
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map(m => {
              const cantNoLeidos = noLeidos[m.id] || 0
              return (
                <button key={m.id} onClick={() => navigate(`/chat/${m.id}`)}
                  className={`bg-white rounded-2xl p-4 border flex items-center gap-4
                    hover:shadow-sm transition text-left w-full active:scale-95
                    ${cantNoLeidos > 0 ? 'border-brand-300 bg-brand-50/30' : 'border-gray-100 hover:border-brand-200'}`}>

                  {/* Foto */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-200 bg-brand-50">
                      {m.otro?.foto_url ? (
                        <img src={urlOptimizada(m.otro.foto_url, { width: 112, height: 112 })}
                          alt={m.otro.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-brand-400 font-bold text-xl">
                            {m.otro?.nombre?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Punto verde si hay mensajes no leídos */}
                    {cantNoLeidos > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 rounded-full
                        border-2 border-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`truncate ${cantNoLeidos > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>
                        {m.otro?.nombre}
                      </p>
                      {m.otro?.verificada && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{m.otro?.edad} años · {m.otro?.barrio}</p>
                    <p className={`text-xs mt-1 font-medium ${cantNoLeidos > 0 ? 'text-brand-600' : 'text-gray-400'}`}>
                      {cantNoLeidos > 0 ? `💬 ${cantNoLeidos} mensaje${cantNoLeidos > 1 ? 's' : ''} nuevo${cantNoLeidos > 1 ? 's' : ''}` : '💬 Toca para chatear'}
                    </p>
                  </div>

                  {/* Badge número */}
                  {cantNoLeidos > 0 ? (
                    <span className="min-w-[24px] h-6 bg-brand-600 text-white text-xs font-bold
                      rounded-full flex items-center justify-center px-1.5 flex-shrink-0">
                      {cantNoLeidos > 99 ? '99+' : cantNoLeidos}
                    </span>
                  ) : (
                    <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
      <NavBar activo="chats" />
    </div>
  )
}

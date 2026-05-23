import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { urlOptimizada } from '../lib/cloudinary'
import { Spinner } from '../components/ui'

export default function VerPerfil() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', id)
        .single()
      setPerfil(data)
      setCargando(false)
    }
    cargar()
  }, [id])

  if (cargando) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  if (!perfil)  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">Perfil no encontrado</p>
      <button onClick={() => navigate('/feed')} className="text-brand-600 font-medium">Volver al feed</button>
    </div>
  )

  const foto = urlOptimizada(perfil.foto_url, { width: 600, height: 600 })

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Foto grande */}
      <div className="relative w-full aspect-square max-h-96 bg-gradient-to-br from-brand-100 to-brand-200">
        {foto ? (
          <img src={foto} alt={perfil.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-brand-300 text-8xl font-bold">{perfil.nombre?.[0]?.toUpperCase()}</span>
          </div>
        )}
        {/* Botón volver */}
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full
            flex items-center justify-center text-white hover:bg-black/50 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {/* Badge verificada */}
        {perfil.verificada && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verificada
          </div>
        )}
      </div>

      {/* Info */}
      <div className="max-w-lg mx-auto px-5 py-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{perfil.nombre}</h1>
            <p className="text-gray-500">{perfil.edad} años · {perfil.barrio}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-1 ${
            perfil.rol === 'mujer' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {perfil.rol === 'mujer' ? '✨ Creadora' : '👀 Explorador'}
          </span>
        </div>

        {perfil.bio && (
          <p className="text-gray-600 mt-4 leading-relaxed bg-white rounded-2xl p-4 border border-gray-100">
            "{perfil.bio}"
          </p>
        )}

        {/* Info adicional */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-brand-600">{perfil.edad}</p>
            <p className="text-xs text-gray-500 mt-0.5">Años</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <p className="text-lg font-bold text-gray-900 truncate">{perfil.barrio}</p>
            <p className="text-xs text-gray-500 mt-0.5">Barrio</p>
          </div>
        </div>
      </div>

      {/* Acciones fijas abajo — semana 4 añadirá megusta y chat */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={() => alert('El chat llega en la semana 5 😊')}
            className="flex-1 py-3 rounded-2xl border-2 border-brand-600 text-brand-600 font-semibold text-sm
              hover:bg-brand-50 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Mensaje
          </button>
          <button
            onClick={() => alert('Los megusta llegan en la semana 4 ❤️')}
            className="w-14 h-12 rounded-2xl bg-brand-600 text-white font-semibold
              hover:bg-brand-500 transition active:scale-95 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

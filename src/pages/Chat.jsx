import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useChat } from '../hooks/useChat'
import { supabase } from '../lib/supabase'
import { urlOptimizada } from '../lib/cloudinary'
import { Spinner } from '../components/ui'

export default function Chat() {
  const { matchId }        = useParams()
  const navigate           = useNavigate()
  const { user, perfil }   = useAuth()

  const [otroUsuario, setOtroUsuario]   = useState(null)
  const [cargandoOtro, setCargandoOtro] = useState(true)
  const [texto, setTexto]               = useState('')
  const bottomRef                       = useRef(null)
  const inputRef                        = useRef(null)

  // 1. Primero cargar el otro usuario
  useEffect(() => {
    if (!matchId || !user) return
    async function cargarOtro() {
      const { data } = await supabase
        .from('matches')
        .select(`
          usuario1_id, usuario2_id,
          perfil1:perfiles!matches_usuario1_id_fkey(id, nombre, foto_url, verificada),
          perfil2:perfiles!matches_usuario2_id_fkey(id, nombre, foto_url, verificada)
        `)
        .eq('id', matchId)
        .single()
      if (data) {
        setOtroUsuario(data.perfil1.id === user.id ? data.perfil2 : data.perfil1)
      }
      setCargandoOtro(false)
    }
    cargarOtro()
  }, [matchId, user])

  // 2. Solo iniciar chat cuando otroUsuario ya está disponible
  const { mensajes, escribiendo, cargando, enviarMensaje, notificarEscribiendo, conectado } =
    useChat(
      otroUsuario ? matchId : null,   // no iniciar hasta tener al otro
      user?.id,
      otroUsuario?.id,
      perfil?.nombre
    )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, escribiendo])

  function enviar(e) {
    e?.preventDefault()
    if (!texto.trim()) return
    enviarMensaje(texto)
    setTexto('')
    inputRef.current?.focus()
  }

  function manejarTecla(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() }
  }

  function formatHora(fecha) {
    return new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  }

  // Mostrar spinner mientras carga el otro usuario
  if (cargandoOtro) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/matches')} className="text-gray-500 hover:text-gray-800 p-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {otroUsuario && (
          <>
            <button onClick={() => navigate(`/perfil/${otroUsuario.id}`)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-200 bg-brand-50 flex-shrink-0">
              {otroUsuario.foto_url ? (
                <img src={urlOptimizada(otroUsuario.foto_url, { width: 80, height: 80 })}
                  alt={otroUsuario.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-brand-600 font-bold">{otroUsuario.nombre?.[0]?.toUpperCase()}</span>
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-gray-900 truncate">{otroUsuario.nombre}</p>
                {otroUsuario.verificada && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className={`text-xs ${conectado ? 'text-green-500' : 'text-gray-400'}`}>
                {conectado ? '● En línea' : '○ Conectando...'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
        {cargando ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : mensajes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-500 font-medium">¡Rompan el hielo!</p>
            <p className="text-gray-400 text-sm mt-1">Sean los primeros en escribir</p>
          </div>
        ) : (
          mensajes.map((msg, i) => {
            const esMio   = msg.de_usuario_id === user?.id
            const mismoDe = mensajes[i - 1]?.de_usuario_id === msg.de_usuario_id
            return (
              <div key={msg.id}
                className={`flex ${esMio ? 'justify-end' : 'justify-start'} ${mismoDe ? 'mt-0.5' : 'mt-3'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${esMio
                    ? 'bg-brand-600 text-white rounded-br-md'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm'
                  }`}>
                  <p>{msg.contenido}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <p className={`text-[10px] ${esMio ? 'text-white/60' : 'text-gray-400'}`}>
                      {formatHora(msg.creado_en)}
                    </p>
                    {esMio && (
                      <svg className={`w-3 h-3 ${msg.leido ? 'text-blue-300' : 'text-white/40'}`}
                        fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {escribiendo && (
          <div className="flex justify-start mt-1">
            <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
        <div className="flex gap-2 items-end max-w-lg mx-auto">
          <textarea ref={inputRef} rows={1} value={texto}
            onChange={e => { setTexto(e.target.value); notificarEscribiendo() }}
            onKeyDown={manejarTecla}
            placeholder="Escribe un mensaje..." maxLength={1000}
            className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 text-sm resize-none
              focus:outline-none focus:ring-2 focus:ring-brand-200 transition max-h-28 overflow-y-auto"
            style={{ lineHeight: '1.4' }}
          />
          <button onClick={enviar} disabled={!texto.trim() || !conectado}
            className="w-11 h-11 bg-brand-600 text-white rounded-2xl flex items-center justify-center
              hover:bg-brand-500 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
            <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

let socketSingleton = null

function getSocket() {
  if (!socketSingleton) {
    socketSingleton = io(BACKEND_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })
  }
  return socketSingleton
}

export function useSocket(userId) {
  const socket = getSocket()
  const [conectado, setConectado] = useState(socket.connected)

  useEffect(() => {
    if (!userId) return

    if (!socket.connected) socket.connect()
    socket.emit('registrar_usuario', userId)

    function onConnect()    { setConectado(true);  socket.emit('registrar_usuario', userId) }
    function onDisconnect() { setConectado(false) }

    socket.on('connect',    onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect',    onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [userId])

  return { socket, conectado }
}

export function useNoLeidos(userId) {
  const { socket, conectado } = useSocket(userId)
  const [noLeidos, setNoLeidos] = useState({})

  const cargar = useCallback(async () => {
    if (!userId) return
    const { supabase } = await import('../lib/supabase')
    const { data } = await supabase
      .from('mensajes_no_leidos')
      .select('*')
      .or(`usuario1_id.eq.${userId},usuario2_id.eq.${userId}`)

    if (data) {
      const mapa = {}
      data.forEach(row => {
        const count = row.usuario1_id === userId
          ? row.no_leidos_usuario1
          : row.no_leidos_usuario2
        if (count > 0) mapa[row.match_id] = count
      })
      setNoLeidos(mapa)
    }
  }, [userId])

  useEffect(() => { cargar() }, [cargar])

  useEffect(() => {
    if (!conectado) return
    socket.on('notificacion_mensaje', ({ matchId }) => {
      setNoLeidos(prev => ({ ...prev, [matchId]: (prev[matchId] || 0) + 1 }))
    })
    socket.on('mensajes_leidos', ({ matchId, porUsuario }) => {
      if (porUsuario !== userId) {
        setNoLeidos(prev => { const n = { ...prev }; delete n[matchId]; return n })
      }
    })
    return () => {
      socket.off('notificacion_mensaje')
      socket.off('mensajes_leidos')
    }
  }, [conectado, userId])

  const totalNoLeidos = Object.values(noLeidos).reduce((a, b) => a + b, 0)
  return { noLeidos, totalNoLeidos, recargar: cargar }
}

export function useChat(matchId, userId, aUsuarioId, nombreUsuario) {
  const { socket, conectado } = useSocket(userId)
  const [mensajes, setMensajes]       = useState([])
  const [escribiendo, setEscribiendo] = useState(false)
  const [cargando, setCargando]       = useState(true)
  const escribiendoTimer              = useRef(null)
  const unidoRef                      = useRef(false)

  // Función para unirse al chat y pedir historial
  const unirse = useCallback(() => {
    if (!matchId || !userId || !conectado) return
    setCargando(true)
    unidoRef.current = true
    socket.emit('unirse_chat', { matchId, userId })
  }, [matchId, userId, conectado])

  // Unirse cuando el componente monta o cuando reconecta
  useEffect(() => {
    if (!matchId || !conectado) return
    unirse()
  }, [matchId, conectado])

  useEffect(() => {
    function onHistorial(hist) {
      setMensajes(hist)
      setCargando(false)
    }
    function onNuevo(msg) {
      setMensajes(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
    }
    function onEscribiendo()     { setEscribiendo(true) }
    function onDejoEscribir()    { setEscribiendo(false) }

    socket.on('historial_mensajes',    onHistorial)
    socket.on('nuevo_mensaje',         onNuevo)
    socket.on('usuario_escribiendo',   onEscribiendo)
    socket.on('usuario_dejo_escribir', onDejoEscribir)

    return () => {
      socket.off('historial_mensajes',    onHistorial)
      socket.off('nuevo_mensaje',         onNuevo)
      socket.off('usuario_escribiendo',   onEscribiendo)
      socket.off('usuario_dejo_escribir', onDejoEscribir)
      unidoRef.current = false
    }
  }, [matchId])

  function enviarMensaje(contenido) {
    if (!contenido.trim() || !conectado) return
    socket.emit('enviar_mensaje', { matchId, deUsuarioId: userId, contenido, aUsuarioId })
  }

  function notificarEscribiendo() {
    socket.emit('escribiendo', { matchId, userId, nombre: nombreUsuario })
    clearTimeout(escribiendoTimer.current)
    escribiendoTimer.current = setTimeout(() => {
      socket.emit('dejo_de_escribir', { matchId })
    }, 2000)
  }

  return { mensajes, escribiendo, cargando, enviarMensaje, notificarEscribiendo, conectado }
}

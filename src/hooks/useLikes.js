import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useLike(aUsuarioId) {
  const { user } = useAuth()
  const [dioLike, setDioLike] = useState(false)
  const [loading, setLoading] = useState(false)
  const [match, setMatch]     = useState(false)

  useEffect(() => {
    if (!user || !aUsuarioId) return
    verificarLike()
  }, [user, aUsuarioId])

  async function verificarLike() {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('de_usuario_id', user.id)
      .eq('a_usuario_id', aUsuarioId)
      .maybeSingle()
    setDioLike(!!data)
  }

  async function toggleLike() {
    if (loading) return
    setLoading(true)
    try {
      if (dioLike) {
        await supabase.from('likes')
          .delete()
          .eq('de_usuario_id', user.id)
          .eq('a_usuario_id', aUsuarioId)
        setDioLike(false)
        setMatch(false)
      } else {
        await supabase.from('likes').insert({
          de_usuario_id: user.id,
          a_usuario_id: aUsuarioId,
        })
        setDioLike(true)

        // Verificar si hay match mutuo
        const { data: matchData } = await supabase
          .from('matches')
          .select('id')
          .or(`and(usuario1_id.eq.${user.id},usuario2_id.eq.${aUsuarioId}),and(usuario1_id.eq.${aUsuarioId},usuario2_id.eq.${user.id})`)
          .maybeSingle()

        if (matchData) setMatch(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return { dioLike, loading, match, toggleLike, setMatch }
}

export function useMatches() {
  const { user } = useAuth()
  const [matches, setMatches]   = useState([])
  const [cargando, setCargando] = useState(true)
  const [total, setTotal]       = useState(0)

  useEffect(() => {
    if (!user) return
    cargarMatches()
  }, [user])

  async function cargarMatches() {
    setCargando(true)
    const { data } = await supabase
      .from('matches')
      .select(`
        id, creado_en,
        perfil1:perfiles!matches_usuario1_id_fkey(id, nombre, foto_url, barrio, edad, verificada),
        perfil2:perfiles!matches_usuario2_id_fkey(id, nombre, foto_url, barrio, edad, verificada)
      `)
      .or(`usuario1_id.eq.${user.id},usuario2_id.eq.${user.id}`)
      .order('creado_en', { ascending: false })

    if (data) {
      const normalizados = data.map(m => ({
        id: m.id,
        creado_en: m.creado_en,
        otro: m.perfil1?.id === user.id ? m.perfil2 : m.perfil1,
      }))
      setMatches(normalizados)
      setTotal(normalizados.length)
    }
    setCargando(false)
  }

  return { matches, cargando, total, recargar: cargarMatches }
}

// Hook liviano solo para el badge de la navbar
export function useTotalMatches() {
  const { user } = useAuth()
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!user) return
    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .or(`usuario1_id.eq.${user.id},usuario2_id.eq.${user.id}`)
      .then(({ count }) => setTotal(count ?? 0))
  }, [user])

  return total
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { urlOptimizada } from '../lib/cloudinary'
import { useTotalMatches } from '../hooks/useLikes'
import { Spinner } from '../components/ui'
import { BARRIOS_CUCUTA } from '../lib/barrios'

export default function Feed() {
  const { perfil } = useAuth()
  const navigate   = useNavigate()

  const [perfiles, setPerfiles]             = useState([])
  const [cargando, setCargando]             = useState(true)
  const [filtros, setFiltros]               = useState({ barrio: '', edadMin: '', edadMax: '', genero: '' })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [busqueda, setBusqueda]             = useState('')
  const [likesLocales, setLikesLocales]     = useState({}) // id → true/false

  useEffect(() => { cargarPerfiles() }, [filtros])

  async function cargarPerfiles() {
    setCargando(true)
    let query = supabase
      .from('perfiles')
      .select('id, nombre, barrio, edad, genero, foto_url, bio, rol, verificada')
      .eq('activo', true)
      .neq('id', perfil?.id)
      .order('creado_en', { ascending: false })

    if (filtros.barrio)  query = query.eq('barrio', filtros.barrio)
    if (filtros.genero)  query = query.eq('genero', filtros.genero)
    if (filtros.edadMin) query = query.gte('edad', Number(filtros.edadMin))
    if (filtros.edadMax) query = query.lte('edad', Number(filtros.edadMax))

    const { data, error } = await query
    if (!error && data) {
      setPerfiles(data)
      // Cargar qué perfiles ya tienen like del usuario actual
      const { data: misLikes } = await supabase
        .from('likes')
        .select('a_usuario_id')
        .eq('de_usuario_id', perfil?.id)
      if (misLikes) {
        const mapa = {}
        misLikes.forEach(l => { mapa[l.a_usuario_id] = true })
        setLikesLocales(mapa)
      }
    }
    setCargando(false)
  }

  function limpiarFiltros() {
    setFiltros({ barrio: '', edadMin: '', edadMax: '', genero: '' })
    setBusqueda('')
  }

  const filtrosActivos = Object.values(filtros).some(v => v !== '')

  const perfilesFiltrados = busqueda.trim()
    ? perfiles.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.barrio?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : perfiles

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Explorar</h1>
            <p className="text-xs text-gray-400">Cúcuta · {perfiles.length} perfiles</p>
          </div>
          <button
            onClick={() => setMostrarFiltros(f => !f)}
            className={`relative p-2 rounded-xl transition ${
              mostrarFiltros || filtrosActivos
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            {filtrosActivos && <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full" />}
          </button>
          <button
            onClick={() => navigate('/perfil/editar')}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-brand-200 bg-brand-50 flex items-center justify-center flex-shrink-0"
          >
            {perfil?.foto_url ? (
              <img src={urlOptimizada(perfil.foto_url, { width: 72, height: 72 })}
                alt="Mi perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-brand-600 font-bold text-sm">
                {perfil?.nombre?.[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </button>
        </div>

        {/* Buscador */}
        <div className="max-w-lg mx-auto px-4 pb-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Buscar por nombre o barrio..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 text-sm
                focus:outline-none focus:ring-2 focus:ring-brand-200 transition"
            />
          </div>
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <div className="max-w-lg mx-auto px-4 pb-4 border-t border-gray-100 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Barrio</label>
                <select value={filtros.barrio}
                  onChange={e => setFiltros(f => ({ ...f, barrio: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-200">
                  <option value="">Todos los barrios</option>
                  {BARRIOS_CUCUTA.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Edad mín</label>
                <input type="number" min="18" max="80" placeholder="18"
                  value={filtros.edadMin} onChange={e => setFiltros(f => ({ ...f, edadMin: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-200" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Edad máx</label>
                <input type="number" min="18" max="80" placeholder="60"
                  value={filtros.edadMax} onChange={e => setFiltros(f => ({ ...f, edadMax: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-200" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Género</label>
                <div className="flex gap-2">
                  {['', 'mujer', 'hombre', 'otro'].map(g => (
                    <button key={g} onClick={() => setFiltros(f => ({ ...f, genero: g }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${
                        filtros.genero === g ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {g === '' ? 'Todos' : g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {filtrosActivos && (
              <button onClick={limpiarFiltros} className="mt-3 text-xs text-brand-600 font-medium hover:underline">
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        {cargando ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : perfilesFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 font-medium">No hay perfiles aquí</p>
            <p className="text-gray-400 text-sm mt-1">
              {filtrosActivos ? 'Prueba con otros filtros' : 'Sé el primero en tu zona'}
            </p>
            {filtrosActivos && (
              <button onClick={limpiarFiltros} className="mt-4 text-brand-600 text-sm font-medium hover:underline">Ver todos</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {perfilesFiltrados.map(p => (
              <TarjetaPerfil
                key={p.id}
                perfil={p}
                yaLiked={!!likesLocales[p.id]}
                onClick={() => navigate(`/perfil/${p.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <NavBar activo="feed" />
    </div>
  )
}

// Tarjeta con indicador visual de like
function TarjetaPerfil({ perfil, yaLiked, onClick }) {
  const foto = urlOptimizada(perfil.foto_url, { width: 300, height: 360 })
  return (
    <button onClick={onClick}
      className="relative rounded-2xl overflow-hidden bg-gray-200 aspect-[3/4]
        shadow-sm hover:shadow-md transition-shadow active:scale-95 text-left w-full">
      {foto ? (
        <img src={foto} alt={perfil.nombre} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
          <span className="text-brand-400 text-5xl font-bold">{perfil.nombre?.[0]?.toUpperCase()}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{perfil.nombre}</p>
            <p className="text-white/70 text-xs">{perfil.edad} · {perfil.barrio}</p>
          </div>
          {perfil.verificada && (
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Badge like — corazón rosa si ya dio like */}
      <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center
        transition-all duration-200 ${yaLiked
          ? 'bg-pink-500 shadow-lg shadow-pink-300'
          : 'bg-black/20 backdrop-blur-sm'
        }`}>
        <svg className="w-4 h-4" fill={yaLiked ? 'white' : 'none'}
          stroke="white" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>

      {/* Badge creadora */}
      {perfil.rol === 'mujer' && (
        <div className="absolute top-2 right-2 bg-pink-500/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-medium">✨</div>
      )}
    </button>
  )
}

// NavBar con badge de matches
export function NavBar({ activo }) {
  const navigate     = useNavigate()
  const totalMatches = useTotalMatches()

  const items = [
    {
      id: 'feed', label: 'Explorar', ruta: '/feed',
      icono: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
    },
    {
      id: 'chats', label: 'Matches', ruta: '/matches', badge: totalMatches,
      icono: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
    },
    {
      id: 'perfil', label: 'Perfil', ruta: '/perfil/editar',
      icono: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30">
      <div className="max-w-lg mx-auto flex">
        {items.map(item => (
          <button key={item.id} onClick={() => navigate(item.ruta)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition relative ${
              activo === item.id ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
            }`}>
            <div className="relative">
              <svg className="w-6 h-6" fill={item.id === 'chats' && activo === 'chats' ? 'currentColor' : 'none'}
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icono} />
              </svg>
              {/* Badge con número de matches */}
              {item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-pink-500 text-white
                  text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

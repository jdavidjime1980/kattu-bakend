import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  PAQUETES, obtenerSaldo, obtenerTransacciones,
  generarFirmaWompi, abrirPagoWompi, formatCOP
} from '../lib/coins'
import { Spinner } from '../components/ui'
import { NavBar } from './Feed'

export default function Wallet() {
  const { user, perfil }    = useAuth()
  const navigate            = useNavigate()
  const [searchParams]      = useSearchParams()

  const [saldo, setSaldo]           = useState(null)
  const [txs, setTxs]               = useState([])
  const [cargando, setCargando]     = useState(true)
  const [comprando, setComprando]   = useState(null) // índice del paquete
  const [exito, setExito]           = useState(false)

  useEffect(() => { cargar() }, [user])

  // Si viene de Wompi con ?pago=exitoso acreditar coins y recargar
  useEffect(() => {
    if (searchParams.get('pago') === 'exitoso') {
      const ref   = sessionStorage.getItem('wompi_ref')
      const coins = parseInt(sessionStorage.getItem('wompi_coins') || '0')
      if (ref && coins && user) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
        fetch(`${backendUrl}/coins/acreditar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, coins: Number(coins), referencia: ref })
        })
        .then(r => r.json())
        .then(data => {
          console.log('Coins acreditados:', data)
          sessionStorage.removeItem('wompi_ref')
          sessionStorage.removeItem('wompi_coins')
          setExito(true)
          cargar() // recargar saldo inmediatamente
          setTimeout(() => setExito(false), 4000)
        })
        .catch(err => {
          console.error('Error acreditando:', err)
          setExito(true)
          cargar()
          setTimeout(() => setExito(false), 4000)
        })
      } else {
        setExito(true)
        cargar()
        setTimeout(() => setExito(false), 4000)
      }
    }
  }, [searchParams, user])

  async function cargar() {
    if (!user) return
    setCargando(true)
    const [s, t] = await Promise.all([
      obtenerSaldo(user.id),
      obtenerTransacciones(user.id),
    ])
    setSaldo(s)
    setTxs(t)
    setCargando(false)
  }

  async function comprar(paquete, idx) {
    setComprando(idx)
    try {
      const referencia = `coins_${user.id}_${paquete.total}_${Date.now()}`
      const monto      = paquete.precio // en centavos COP

      const { firma } = await generarFirmaWompi(referencia, monto)

      await abrirPagoWompi({
        referencia,
        monto,
        firma,
        email: user.email,
        onExito: () => {
          setExito(true)
          setTimeout(() => { setExito(false); cargar() }, 3000)
        },
        onError: (err) => {
          console.error('Error pago:', err)
          alert('El pago no se completó. Intenta de nuevo.')
        },
      })
    } catch (e) {
      alert('Error al iniciar el pago: ' + e.message)
    } finally {
      setComprando(null)
    }
  }

  function iconoTipo(tipo) {
    const iconos = { compra: '💰', gasto: '💸', ganancia: '✨', retiro: '🏦' }
    return iconos[tipo] || '💱'
  }

  function colorTipo(tipo) {
    return tipo === 'compra' || tipo === 'ganancia'
      ? 'text-green-600'
      : 'text-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">Mi wallet</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Banner éxito */}
        {exito && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-4 py-3 mb-4 text-sm font-medium text-center">
            ✅ ¡Pago exitoso! Tus coins fueron acreditados.
          </div>
        )}

        {/* Saldo */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-6 text-white mb-6 shadow-lg shadow-brand-200">
          <p className="text-white/70 text-sm font-medium mb-1">Saldo disponible</p>
          {cargando ? (
            <div className="h-12 flex items-center"><Spinner small /></div>
          ) : (
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold">{saldo?.toLocaleString('es-CO') ?? 0}</span>
              <span className="text-white/70 text-lg mb-1">coins</span>
            </div>
          )}
          <p className="text-white/50 text-xs mt-3">
            Hola, {perfil?.nombre} · {perfil?.rol === 'mujer' ? 'Cuenta creadora' : 'Cuenta explorador'}
          </p>
        </div>

        {/* Paquetes de coins */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Comprar coins
        </h2>
        <div className="flex flex-col gap-3 mb-8">
          {PAQUETES.map((paq, i) => (
            <button key={i} onClick={() => comprar(paq, i)}
              disabled={comprando !== null}
              className={`relative bg-white rounded-2xl p-4 border-2 text-left transition active:scale-95
                ${paq.popular ? 'border-brand-400 shadow-md shadow-brand-100' : 'border-gray-100 hover:border-brand-200'}`}>

              {paq.popular && (
                <span className="absolute -top-2.5 left-4 bg-brand-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                  MÁS POPULAR
                </span>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {paq.coins.toLocaleString('es-CO')}
                    </span>
                    <span className="text-gray-500 text-sm">coins</span>
                    {paq.bonus && (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {paq.bonus}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">{paq.etiqueta}</p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-brand-600">
                    {formatCOP(paq.precio)}
                  </p>
                  {comprando === i ? (
                    <Spinner small />
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">Pagar →</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Para mujeres: botón de retiro */}
        {perfil?.rol === 'mujer' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Solicitar retiro</p>
                <p className="text-xs text-gray-400 mt-0.5">Recibe tus ganancias por Nequi</p>
              </div>
              <button
                onClick={() => navigate('/retiro')}
                className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl
                  hover:bg-brand-500 transition active:scale-95">
                Retirar
              </button>
            </div>
          </div>
        )}

        {/* Historial */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Historial
        </h2>
        {cargando ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : txs.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-400 text-sm">Aún no hay movimientos</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {txs.map(tx => (
              <div key={tx.id}
                className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                <span className="text-xl">{iconoTipo(tx.tipo)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tx.descripcion}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.creado_en).toLocaleDateString('es-CO', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${colorTipo(tx.tipo)}`}>
                  {tx.coins > 0 ? '+' : ''}{tx.coins.toLocaleString('es-CO')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <NavBar activo="wallet" />
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { obtenerSaldo } from '../lib/coins'
import { supabase } from '../lib/supabase'
import { Button, Input, ErrorMsg } from '../components/ui'
import { useEffect } from 'react'

export default function Retiro() {
  const { user, perfil } = useAuth()
  const navigate         = useNavigate()

  const [saldo, setSaldo]       = useState(0)
  const [form, setForm]         = useState({ nequi: '', nombre_nequi: '', coins: '' })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [exito, setExito]       = useState(false)

  const MINIMO_RETIRO  = 500   // coins mínimos para retirar
  const COINS_POR_PESO = 10    // 10 coins = $1 COP → 1 coin = $100 COP
  const COMISION       = 0.25  // 25% de comisión de la plataforma

  useEffect(() => {
    if (user) obtenerSaldo(user.id).then(setSaldo)
  }, [user])

  function cambiar(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  const coinsASolicitar = parseInt(form.coins) || 0
  const valorBruto      = coinsASolicitar * 100  // 1 coin = $100 COP
  const comision        = Math.floor(valorBruto * COMISION)
  const valorNeto       = valorBruto - comision

  async function enviar(e) {
    e.preventDefault()
    setError('')

    if (!form.nequi || !form.nombre_nequi) { setError('Completa todos los campos'); return }
    if (coinsASolicitar < MINIMO_RETIRO)   { setError(`Mínimo ${MINIMO_RETIRO} coins para retirar`); return }
    if (coinsASolicitar > saldo)           { setError('No tienes suficientes coins'); return }

    setLoading(true)
    try {
      // Registrar solicitud de retiro
      await supabase.from('transacciones').insert({
        usuario_id:  user.id,
        tipo:        'retiro',
        coins:       -coinsASolicitar,
        descripcion: `Retiro por Nequi ${form.nequi} — ${form.nombre_nequi}`,
        estado:      'pendiente',
      })

      // Descontar del saldo
      await supabase.from('wallets')
        .update({ saldo: saldo - coinsASolicitar, actualizado_en: new Date() })
        .eq('usuario_id', user.id)

      setExito(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (exito) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Solicitud enviada</h2>
      <p className="text-gray-500 text-sm mb-2">
        Recibirás <strong>${valorNeto.toLocaleString('es-CO')} COP</strong> en tu Nequi en las próximas 24-48 horas hábiles.
      </p>
      <p className="text-gray-400 text-xs mb-8">El administrador procesará tu retiro manualmente.</p>
      <Button onClick={() => navigate('/wallet')}>Volver a mi wallet</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 p-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Solicitar retiro</h1>
      </div>

      <div className="max-w-sm mx-auto px-5 pt-6">
        {/* Saldo disponible */}
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-6 text-center">
          <p className="text-xs text-brand-500 font-medium mb-1">Saldo disponible</p>
          <p className="text-3xl font-bold text-brand-700">{saldo.toLocaleString('es-CO')}</p>
          <p className="text-xs text-brand-400 mt-0.5">coins · Mínimo {MINIMO_RETIRO} para retirar</p>
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-4">
          <Input label="Número Nequi" name="nequi" type="tel"
            placeholder="3001234567" value={form.nequi} onChange={cambiar} required />
          <Input label="Nombre del titular" name="nombre_nequi"
            placeholder="Como aparece en Nequi" value={form.nombre_nequi} onChange={cambiar} required />
          <Input label={`Coins a retirar (máx ${saldo.toLocaleString('es-CO')})`}
            name="coins" type="number" min={MINIMO_RETIRO} max={saldo}
            placeholder={MINIMO_RETIRO.toString()} value={form.coins} onChange={cambiar} required />

          {/* Simulación de lo que recibirá */}
          {coinsASolicitar >= MINIMO_RETIRO && coinsASolicitar <= saldo && (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 text-sm">
              <div className="flex justify-between text-gray-600 mb-1">
                <span>Valor bruto</span>
                <span>${valorBruto.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between text-gray-400 mb-2">
                <span>Comisión plataforma (25%)</span>
                <span>-${comision.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
                <span>Recibes</span>
                <span className="text-green-600">${valorNeto.toLocaleString('es-CO')} COP</span>
              </div>
            </div>
          )}

          <ErrorMsg message={error} />

          <p className="text-xs text-gray-400 text-center">
            Los retiros se procesan en 24–48 horas hábiles por Nequi.
          </p>

          <Button type="submit" loading={loading}>Solicitar retiro</Button>
        </form>
      </div>
    </div>
  )
}

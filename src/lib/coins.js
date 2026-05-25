import { supabase } from './supabase'

// Paquetes disponibles para comprar
// Precios en centavos COP (Wompi requiere centavos)
// $9.900 COP = 990000 centavos
export const PAQUETES = [
  { coins: 500,  total: 500,  precio: 990000,  etiqueta: 'Básico',  popular: false, bonus: ''            },
  { coins: 1200, total: 1400, precio: 1990000, etiqueta: 'Popular', popular: true,  bonus: '+200 gratis'  },
  { coins: 3000, total: 3500, precio: 4490000, etiqueta: 'Pro',     popular: false, bonus: '+500 gratis'  },
]

// Cuánto vale cada acción en coins
export const COSTOS = {
  desbloquear_foto:  50,
  mensaje_sin_match: 20,
  boost_perfil:      100,
}

// Obtener saldo del usuario
export async function obtenerSaldo(userId) {
  const { data } = await supabase
    .from('wallets')
    .select('saldo')
    .eq('usuario_id', userId)
    .single()
  return data?.saldo ?? 0
}

// Obtener historial de transacciones
export async function obtenerTransacciones(userId, limite = 20) {
  const { data } = await supabase
    .from('transacciones')
    .select('*')
    .eq('usuario_id', userId)
    .order('creado_en', { ascending: false })
    .limit(limite)
  return data || []
}

// Generar firma de integridad para Wompi (llama al backend)
export async function generarFirmaWompi(referencia, monto) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
  const res = await fetch(`${backendUrl}/wompi/firma`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referencia, monto })
  })
  if (!res.ok) throw new Error('No se pudo generar la firma de pago')
  return res.json()
}

// Abrir pago Wompi mediante redirección directa
export async function abrirPagoWompi({ referencia, monto, firma, email }) {
  const publicKey  = import.meta.env.VITE_WOMPI_PUBLIC_KEY
  const redirectUrl = window.location.origin + '/wallet?pago=exitoso'

  // Guardar referencia y coins en sessionStorage para acreditar al volver
  // Extraer coins del formato: coins_{uuid}_{coins}_{timestamp}
  // El UUID tiene guiones, al split('_') ocupa índices 1-5, coins está en índice 6
  const partesRef = referencia.split('_')
  const coinsEnRef = partesRef[partesRef.length - 2] // penúltimo = total de coins con bonus
  sessionStorage.setItem('wompi_ref',   referencia)
  sessionStorage.setItem('wompi_coins', coinsEnRef)

  const params = new URLSearchParams({
    'public-key':          publicKey,
    'currency':            'COP',
    'amount-in-cents':     monto,
    'reference':           referencia,
    'signature:integrity': firma,
    'redirect-url':        redirectUrl,
    'customer-data:email': email,
  })

  window.location.href = `https://checkout.wompi.co/p/?${params.toString()}`
}

// Formatear precio en COP
export function formatCOP(centavos) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  }).format(centavos / 100)
}

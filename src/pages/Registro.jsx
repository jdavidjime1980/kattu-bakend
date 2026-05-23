import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, Select, ErrorMsg } from '../components/ui'
import { BARRIOS_CUCUTA } from '../lib/barrios'

const PASOS = ['Cuenta', 'Perfil', 'Rol']

export default function Registro() {
  const { registrar } = useAuth()
  const navigate = useNavigate()

  const [paso, setPaso]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    email: '', password: '', confirmar: '',
    nombre: '', edad: '', barrio: '', genero: '',
    rol: ''
  })

  function cambiar(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function siguiente(e) {
    e.preventDefault()
    setError('')

    if (paso === 0) {
      if (form.password !== form.confirmar) {
        setError('Las contraseñas no coinciden')
        return
      }
      if (form.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        return
      }
    }
    if (paso === 1) {
      if (!form.nombre || !form.edad || !form.barrio || !form.genero) {
        setError('Completa todos los campos')
        return
      }
      if (Number(form.edad) < 18) {
        setError('Debes tener al menos 18 años para registrarte')
        return
      }
    }

    if (paso < 2) setPaso(p => p + 1)
  }

  async function finalizar(rolElegido) {
    setError('')
    setLoading(true)
    try {
      await registrar({ ...form, rol: rolElegido })
      navigate('/feed')
    } catch (err) {
      setError(err.message)
      setPaso(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-5 py-12">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Paso {paso + 1} de 3 — {PASOS[paso]}</p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex gap-2 mb-8">
          {PASOS.map((_, i) => (
            <div key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= paso ? 'bg-brand-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <ErrorMsg message={error} />

        {/* Paso 0: Cuenta */}
        {paso === 0 && (
          <form onSubmit={siguiente} className="flex flex-col gap-4 mt-4">
            <Input label="Correo electrónico" type="email" name="email"
              placeholder="tu@correo.com" value={form.email} onChange={cambiar} required />
            <Input label="Contraseña" type="password" name="password"
              placeholder="Mínimo 6 caracteres" value={form.password} onChange={cambiar} required />
            <Input label="Confirmar contraseña" type="password" name="confirmar"
              placeholder="Repite la contraseña" value={form.confirmar} onChange={cambiar} required />
            <Button type="submit">Continuar</Button>
          </form>
        )}

        {/* Paso 1: Perfil */}
        {paso === 1 && (
          <form onSubmit={siguiente} className="flex flex-col gap-4 mt-4">
            <Input label="Nombre o apodo" name="nombre"
              placeholder="¿Cómo te llaman?" value={form.nombre} onChange={cambiar} required />
            <Input label="Edad" type="number" name="edad"
              placeholder="18" min="18" max="80" value={form.edad} onChange={cambiar} required />
            <Select label="Barrio en Cúcuta" name="barrio" value={form.barrio} onChange={cambiar} required>
              <option value="">Selecciona tu barrio</option>
              {BARRIOS_CUCUTA.map(b => <option key={b} value={b}>{b}</option>)}
            </Select>
            <Select label="Género" name="genero" value={form.genero} onChange={cambiar} required>
              <option value="">Selecciona</option>
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
              <option value="otro">Otro</option>
            </Select>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" type="button" onClick={() => setPaso(0)}>Atrás</Button>
              <Button type="submit">Continuar</Button>
            </div>
          </form>
        )}

        {/* Paso 2: Elegir rol */}
        {paso === 2 && (
          <div className="flex flex-col gap-4 mt-4">
            <p className="text-sm text-gray-600 text-center mb-2">
              ¿Cómo quieres usar la app?
            </p>

            <button
              onClick={() => finalizar('hombre')}
              disabled={loading}
              className="w-full p-5 rounded-2xl border-2 border-gray-200 hover:border-brand-400
                text-left transition-all hover:bg-brand-50 group"
            >
              <div className="text-2xl mb-2">👀</div>
              <div className="font-semibold text-gray-900 group-hover:text-brand-700">
                Explorar perfiles
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Busca, da megusta y chatea con perfiles cerca de ti
              </div>
            </button>

            <button
              onClick={() => finalizar('mujer')}
              disabled={loading}
              className="w-full p-5 rounded-2xl border-2 border-gray-200 hover:border-brand-400
                text-left transition-all hover:bg-brand-50 group"
            >
              <div className="text-2xl mb-2">✨</div>
              <div className="font-semibold text-gray-900 group-hover:text-brand-700">
                Crear mi perfil y ganar
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Publica contenido, recibe megusta y gana coins
              </div>
            </button>

            <Button variant="ghost" onClick={() => setPaso(1)}>Atrás</Button>

            {loading && <div className="text-center text-sm text-gray-500">Creando tu cuenta...</div>}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

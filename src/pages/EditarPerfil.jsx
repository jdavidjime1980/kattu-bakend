import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Button, Input, Select, ErrorMsg } from '../components/ui'
import FotoPerfil from '../components/ui/FotoPerfil'
import { BARRIOS_CUCUTA } from '../lib/barrios'

export default function EditarPerfil() {
  const { perfil, cargarPerfil, user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre:  perfil?.nombre  || '',
    barrio:  perfil?.barrio  || '',
    edad:    perfil?.edad    || '',
    genero:  perfil?.genero  || '',
    bio:     perfil?.bio     || '',
  })
  const [fotoUrl, setFotoUrl]   = useState(perfil?.foto_url || null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [exito, setExito]       = useState(false)

  function cambiar(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')
    setExito(false)

    if (!form.nombre || !form.barrio || !form.edad) {
      setError('Nombre, barrio y edad son obligatorios')
      return
    }

    setLoading(true)
    try {
      const { error: err } = await supabase
        .from('perfiles')
        .update({
          nombre:   form.nombre,
          barrio:   form.barrio,
          edad:     Number(form.edad),
          genero:   form.genero,
          bio:      form.bio,
          foto_url: fotoUrl,
        })
        .eq('id', user.id)

      if (err) throw err

      await cargarPerfil(user.id)
      setExito(true)
      setTimeout(() => navigate('/feed'), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 p-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-semibold text-gray-900">Editar perfil</h1>
      </div>

      <div className="max-w-sm mx-auto px-5 pt-8">
        {/* Foto de perfil */}
        <div className="flex justify-center mb-8">
          <FotoPerfil
            urlActual={fotoUrl}
            onSubida={(url) => setFotoUrl(url)}
            tamaño={110}
          />
        </div>

        <form onSubmit={guardar} className="flex flex-col gap-4">
          <Input
            label="Nombre o apodo"
            name="nombre"
            placeholder="¿Cómo te llaman?"
            value={form.nombre}
            onChange={cambiar}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Sobre mí
            </label>
            <textarea
              name="bio"
              placeholder="Cuéntale algo a los demás..."
              value={form.bio}
              onChange={cambiar}
              rows={3}
              maxLength={150}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white
                focus:outline-none focus:ring-2 focus:ring-brand-200 transition resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{form.bio.length}/150</p>
          </div>

          <Input
            label="Edad"
            type="number"
            name="edad"
            placeholder="18"
            min="18"
            max="80"
            value={form.edad}
            onChange={cambiar}
            required
          />

          <Select label="Barrio en Cúcuta" name="barrio" value={form.barrio} onChange={cambiar} required>
            <option value="">Selecciona tu barrio</option>
            {BARRIOS_CUCUTA.map(b => <option key={b} value={b}>{b}</option>)}
          </Select>

          <Select label="Género" name="genero" value={form.genero} onChange={cambiar}>
            <option value="">Selecciona</option>
            <option value="mujer">Mujer</option>
            <option value="hombre">Hombre</option>
            <option value="otro">Otro</option>
          </Select>

          <ErrorMsg message={error} />

          {exito && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl text-center">
              ✓ Perfil actualizado
            </div>
          )}

          <Button type="submit" loading={loading} className="mt-2">
            Guardar cambios
          </Button>
        </form>
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import { subirImagen, urlOptimizada } from '../../lib/cloudinary'
import { Spinner } from './index'

export default function FotoPerfil({ urlActual, onSubida, tamaño = 96 }) {
  const [preview, setPreview]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const inputRef                = useRef()

  async function manejarArchivo(e) {
    const archivo = e.target.files[0]
    if (!archivo) return

    // Validar tipo
    if (!archivo.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }
    // Validar tamaño (máx 5 MB)
    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen no puede pesar más de 5 MB')
      return
    }

    setError('')
    // Mostrar preview local inmediato
    setPreview(URL.createObjectURL(archivo))
    setLoading(true)

    try {
      const url = await subirImagen(archivo, 'perfiles')
      onSubida(url)  // Notifica al padre con la URL final de Cloudinary
    } catch (err) {
      setError(err.message)
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  const fotoMostrada = preview || urlOptimizada(urlActual, { width: tamaño * 2, height: tamaño * 2 })
  const iniciales    = '?'

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Círculo de foto */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative group"
        style={{ width: tamaño, height: tamaño }}
        aria-label="Cambiar foto de perfil"
      >
        <div
          className="w-full h-full rounded-full overflow-hidden border-2 border-brand-200 bg-brand-50
            flex items-center justify-center"
        >
          {fotoMostrada ? (
            <img
              src={fotoMostrada}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-brand-400 font-bold" style={{ fontSize: tamaño * 0.35 }}>
              {iniciales}
            </span>
          )}

          {/* Overlay al hover */}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100
            transition-opacity flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* Spinner mientras sube */}
        {loading && (
          <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
            <Spinner small />
          </div>
        )}

        {/* Badge de cámara */}
        {!loading && (
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-brand-600 rounded-full
            flex items-center justify-center border-2 border-white">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M12 4v16m8-8H4" />
            </svg>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={manejarArchivo}
      />

      <p className="text-xs text-gray-400">Toca para cambiar tu foto</p>

      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  )
}

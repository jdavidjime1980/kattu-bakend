import { useNavigate } from 'react-router-dom'
import { urlOptimizada } from '../../lib/cloudinary'

export default function ModalMatch({ perfilPropio, perfilOtro, onCerrar }) {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
      onClick={onCerrar}>
      {/* Fondo */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Contenido */}
      <div className="relative z-10 text-center max-w-sm w-full"
        onClick={e => e.stopPropagation()}>

        {/* Título animado */}
        <div className="mb-6">
          <p className="text-brand-400 font-semibold text-sm uppercase tracking-widest mb-2">
            ¡Es un match!
          </p>
          <h2 className="text-4xl font-bold text-white">
            💘
          </h2>
          <p className="text-white/70 text-sm mt-3">
            Tú y <span className="text-white font-semibold">{perfilOtro?.nombre}</span> se gustaron mutuamente
          </p>
        </div>

        {/* Fotos */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-brand-400 shadow-xl">
            {perfilPropio?.foto_url ? (
              <img src={urlOptimizada(perfilPropio.foto_url, { width: 112, height: 112 })}
                alt="Yo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-200 flex items-center justify-center">
                <span className="text-brand-600 text-3xl font-bold">
                  {perfilPropio?.nombre?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="text-3xl">❤️</div>

          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-pink-400 shadow-xl">
            {perfilOtro?.foto_url ? (
              <img src={urlOptimizada(perfilOtro.foto_url, { width: 112, height: 112 })}
                alt={perfilOtro.nombre} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-pink-200 flex items-center justify-center">
                <span className="text-pink-600 text-3xl font-bold">
                  {perfilOtro?.nombre?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { onCerrar(); navigate('/matches') }}
            className="w-full py-3.5 bg-brand-600 text-white font-semibold rounded-2xl
              hover:bg-brand-500 transition active:scale-95"
          >
            Ver mis matches
          </button>
          <button
            onClick={onCerrar}
            className="w-full py-3.5 bg-white/10 text-white font-semibold rounded-2xl
              hover:bg-white/20 transition active:scale-95"
          >
            Seguir explorando
          </button>
        </div>
      </div>
    </div>
  )
}

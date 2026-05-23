// Botón principal
export function Button({ children, loading, variant = 'primary', className = '', ...props }) {
  const base = 'w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:  'bg-brand-600 text-white hover:bg-brand-500 active:scale-95',
    outline:  'border border-brand-600 text-brand-600 hover:bg-brand-50 active:scale-95',
    ghost:    'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
    danger:   'bg-red-500 text-white hover:bg-red-400 active:scale-95',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner small /> : children}
    </button>
  )
}

// Input con label
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-xl border text-sm bg-white
          ${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-brand-200'}
          focus:outline-none focus:ring-2 transition ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// Select con label
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>}
      <select
        className={`w-full px-4 py-3 rounded-xl border text-sm bg-white appearance-none
          ${error ? 'border-red-400' : 'border-gray-200'}
          focus:outline-none focus:ring-2 focus:ring-brand-200 transition ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// Spinner de carga
export function Spinner({ small }) {
  const size = small ? 'w-4 h-4' : 'w-8 h-8'
  return (
    <div className={`${size} border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto`} />
  )
}

// Mensaje de error tipo toast
export function ErrorMsg({ message }) {
  if (!message) return null
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
      {message}
    </div>
  )
}

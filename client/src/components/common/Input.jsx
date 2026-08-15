// A reusable controlled input component
// Props: label, id, error, and all standard input props (type, value, onChange, etc.)
export default function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-ink-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full px-4 py-3 rounded-lg border font-body text-sm text-ink-900
          bg-white placeholder:text-ink-200
          border-ink-100 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10
          transition-all duration-150
          ${error ? 'border-red-400 focus:border-red-400' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  )
}

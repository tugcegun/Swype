export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-swype-dark dark:text-swype-cream mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 rounded-sm border border-swype-silver/40 dark:border-swype-mid bg-white dark:bg-swype-dark text-sm text-swype-dark dark:text-swype-cream placeholder-swype-silver focus:outline-none focus:ring-1 focus:ring-swype-mid/30 focus:border-swype-mid transition-all duration-200 ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}

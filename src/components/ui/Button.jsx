export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-swype-dark text-swype-cream hover:bg-swype-mid dark:bg-swype-cream dark:text-swype-dark dark:hover:bg-swype-silver',
    secondary: 'bg-swype-mid text-swype-cream hover:bg-swype-dark dark:bg-swype-silver dark:text-swype-dark dark:hover:bg-swype-cream',
    outline: 'border border-swype-dark text-swype-dark hover:bg-swype-dark hover:text-swype-cream dark:border-swype-silver dark:text-swype-cream dark:hover:bg-swype-cream dark:hover:text-swype-dark',
    ghost: 'text-swype-dark hover:bg-swype-silver/20 dark:text-swype-cream dark:hover:bg-swype-mid/40',
    success: 'bg-success text-white hover:opacity-90',
    danger: 'bg-danger text-white hover:opacity-90',
    accent: 'bg-swype-sage text-white hover:bg-swype-accent-dark',
    gold: 'bg-swype-gold text-swype-dark hover:opacity-90',
    terra: 'bg-swype-terra text-white hover:opacity-90',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-2.5 text-sm',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

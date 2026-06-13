interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  className?: string
  type?: 'button' | 'submit'
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  type = 'button',
}: ButtonProps) {
  const base =
    'w-full py-4 px-6 rounded-2xl font-bold text-base transition-all duration-200 active:scale-[0.98]'

  const variants = {
    primary: disabled
      ? 'bg-surface-light text-neutral-500 cursor-not-allowed'
      : 'bg-white text-black hover:bg-neutral-100',
    secondary: 'bg-surface text-white border border-neutral-700 hover:bg-surface-light',
    ghost: 'bg-transparent text-neutral-400 hover:text-white',
    outline: 'bg-transparent text-white border border-white/30 hover:bg-white/5',
    danger: disabled
      ? 'bg-surface-light text-neutral-500 cursor-not-allowed'
      : 'bg-red-950 text-red-400 border border-red-900 hover:bg-red-900/40',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

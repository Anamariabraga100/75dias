import { ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface BackButtonProps {
  to?: string
  onClick?: () => void
  className?: string
}

export function BackButton({ to, onClick, className = '' }: BackButtonProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => {
        if (onClick) {
          onClick()
          return
        }
        if (to) {
          navigate(to)
          return
        }
        navigate(-1)
      }}
      className={`flex items-center justify-center w-10 h-10 text-white/80 hover:text-white transition-colors ${className}`}
      aria-label="Voltar"
    >
      <ChevronLeft size={28} strokeWidth={2} />
    </button>
  )
}

export function Logo({ size = 'md', to }: { size?: 'sm' | 'md' | 'lg'; to?: string }) {
  const sizes = { sm: 'text-base sm:text-lg', md: 'text-xl', lg: 'text-2xl' }
  const content = (
    <span className={`logo-text ${sizes[size]} truncate block max-w-full`}>RESET90</span>
  )

  if (to) {
    return (
      <Link
        to={to}
        className="hover:opacity-90 transition-opacity min-w-0 max-w-full block"
        aria-label="Ir para Início"
      >
        {content}
      </Link>
    )
  }

  return content
}

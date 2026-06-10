import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  to?: string
  className?: string
}

export function BackButton({ to, className = '' }: BackButtonProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={`flex items-center justify-center w-10 h-10 text-white/80 hover:text-white transition-colors ${className}`}
      aria-label="Voltar"
    >
      <ChevronLeft size={28} strokeWidth={2} />
    </button>
  )
}

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }
  return <span className={`logo-text ${sizes[size]}`}>75 DIAS</span>
}

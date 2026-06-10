import { BackButton, Logo } from '../ui/Logo'

interface OnboardingLayoutProps {
  children: React.ReactNode
  showBack?: boolean
  showLogo?: boolean
  footer?: React.ReactNode
  className?: string
  gradient?: 'none' | 'red' | 'purple' | 'green' | 'blue'
}

const gradients = {
  none: '',
  red: 'bg-gradient-to-br from-red-950/40 via-black to-black',
  purple: 'bg-gradient-to-br from-purple-950/40 via-black to-black',
  green: 'bg-gradient-to-br from-green-950/40 via-black to-black',
  blue: 'bg-gradient-to-br from-blue-950/30 via-black to-black',
}

export function OnboardingLayout({
  children,
  showBack = true,
  showLogo = true,
  footer,
  className = '',
  gradient = 'none',
}: OnboardingLayoutProps) {
  return (
    <div className={`min-h-dvh flex flex-col ${gradients[gradient]}`}>
      <div className="max-w-md mx-auto w-full flex flex-col min-h-dvh px-5">
        <header className="flex items-center justify-between pt-4 pb-2 shrink-0">
          {showBack ? <BackButton /> : <div className="w-10" />}
          {showLogo && <Logo />}
          <div className="w-10" />
        </header>

        <main className={`flex-1 flex flex-col py-4 ${className}`}>{children}</main>

        {footer && (
          <footer className="pb-8 pt-4 shrink-0 sticky bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}

export function QuoteBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-2xl p-5 quote-border">
      <p className="text-neutral-300 text-sm leading-relaxed">{children}</p>
    </div>
  )
}

export function PageTitle({
  title,
  subtitle,
  className = '',
}: {
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-3xl font-bold text-white leading-tight mb-2">{title}</h1>
      {subtitle && <p className="text-neutral-400 text-base">{subtitle}</p>}
    </div>
  )
}

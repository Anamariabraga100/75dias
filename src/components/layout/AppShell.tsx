import { useLocation, useNavigate } from 'react-router-dom'
import { Home, TrendingUp, Image } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const NAV_ITEMS = [
  { to: '/app', icon: Home, label: 'Início', end: true },
  { to: '/app/progresso', icon: TrendingUp, label: 'Progresso', requiresChallenge: true },
  { to: '/app/galeria', icon: Image, label: 'Galeria', requiresChallenge: true },
]

export function AppBottomNav() {
  const { onboardingComplete } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (to: string, end?: boolean) => {
    if (end) return location.pathname === '/app' && !location.hash
    return location.pathname === to
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-neutral-800 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around px-4 py-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end, requiresChallenge }) => {
          const disabled = requiresChallenge && !onboardingComplete
          const active = isActive(to, end)

          return (
            <button
              key={to}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && navigate(to)}
              className={`relative flex flex-col items-center gap-0.5 py-1 px-4 min-w-[72px] transition-colors ${
                active ? 'text-white' : disabled ? 'text-neutral-700' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] ${active ? 'font-semibold' : ''}`}>{label}</span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent-blue" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-black">
      <div className="max-w-md mx-auto min-h-dvh flex flex-col pb-[calc(72px+env(safe-area-inset-bottom,0px))]">{children}</div>
      <AppBottomNav />
    </div>
  )
}

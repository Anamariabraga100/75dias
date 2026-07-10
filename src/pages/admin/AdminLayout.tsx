import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut, ArrowLeft, CreditCard, Activity, UserRound } from 'lucide-react'
import { clearAdminSession } from '../../lib/adminSession'

const nav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/usuarios', label: 'Usuários', icon: UserRound },
  { to: '/admin/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { to: '/admin/eventos', label: 'Eventos', icon: Activity },
  { to: '/admin/assinantes', label: 'Assinantes', icon: Users },
]

export function AdminLayout() {
  const navigate = useNavigate()

  const handleSignOut = () => {
    clearAdminSession()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <header className="flex items-center justify-between py-5 border-b border-neutral-800">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5">Reset90</p>
            <h1 className="text-lg font-bold">Painel Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-3 py-2 rounded-lg hover:bg-neutral-900 transition-colors"
            >
              <ArrowLeft size={14} />
              App
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-red-400/90 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-red-950/30 transition-colors"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </header>

        <nav className="flex gap-1 py-3 border-b border-neutral-800/80 mb-6 overflow-x-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function StatCard({
  label,
  value,
  hint,
  accent = 'blue',
}: {
  label: string
  value: string
  hint?: string
  accent?: 'blue' | 'green' | 'orange' | 'purple'
}) {
  const accents = {
    blue: 'border-accent-blue/30 bg-accent-blue/5',
    green: 'border-accent-green/30 bg-accent-green/5',
    orange: 'border-accent-orange/30 bg-accent-orange/5',
    purple: 'border-accent-purple/30 bg-accent-purple/5',
  }

  return (
    <div className={`rounded-2xl border p-4 ${accents[accent]}`}>
      <p className="text-neutral-500 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-black tabular-nums">{value}</p>
      {hint && <p className="text-neutral-500 text-xs mt-1">{hint}</p>}
    </div>
  )
}

export { formatCurrency }

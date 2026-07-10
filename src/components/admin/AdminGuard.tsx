import { Navigate, Outlet } from 'react-router-dom'
import { isAdminSession } from '../../lib/adminSession'
import { Logo } from '../ui/Logo'

export function AdminGuard() {
  if (!isAdminSession()) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}

export function AdminDenied() {
  return (
    <div className="min-h-dvh bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <Logo size="lg" />
      <h1 className="text-xl font-bold mt-6 mb-2">Acesso restrito</h1>
      <p className="text-neutral-400 text-sm max-w-sm mb-6">Esta área é só para administradores.</p>
      <a href="/admin/login" className="text-accent-blue text-sm font-semibold hover:underline">
        Ir para login admin
      </a>
    </div>
  )
}

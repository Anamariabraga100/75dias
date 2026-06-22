import { isLocalDev } from './appUrl'
import { getAdminEmailFromEnv } from './adminCredentials'

const SESSION_KEY = 'reset90-admin-local'

export function isLocalAdminMode(): boolean {
  return isLocalDev()
}

export function isLocalAdminSession(): boolean {
  if (!isLocalAdminMode()) return false
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function activateLocalAdminSession(): void {
  if (!isLocalAdminMode()) return
  sessionStorage.setItem(SESSION_KEY, '1')
}

export function clearLocalAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function isAdminAccessConfigured(): boolean {
  const email = getAdminEmailFromEnv()
  if (isLocalAdminMode()) return Boolean(email)
  const password = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? ''
  return Boolean(email && password)
}

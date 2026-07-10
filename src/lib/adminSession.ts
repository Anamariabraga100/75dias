import { getAdminEmailFromEnv, getAdminPasswordFromEnv } from './adminCredentials'

const SESSION_KEY = 'reset90-admin-session'

export function isAdminSession(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

export function activateAdminSession(): void {
  sessionStorage.setItem(SESSION_KEY, '1')
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function isAdminAccessConfigured(): boolean {
  return Boolean(getAdminEmailFromEnv() && getAdminPasswordFromEnv())
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPasswordFromEnv()
  return Boolean(expected && password === expected)
}

const STORAGE_KEY = 'reset90-admin-remember'

export type RememberedAdmin = {
  email: string
  password: string
}

export function getAdminEmailFromEnv(): string {
  return (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim() ?? ''
}

export function getAdminPasswordFromEnv(): string {
  return (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? ''
}

export function isAdminCredentialsConfigured(): boolean {
  return Boolean(getAdminEmailFromEnv() && getAdminPasswordFromEnv())
}

export function matchesAdminCredentials(email: string, password: string): boolean {
  const envEmail = getAdminEmailFromEnv()
  const envPassword = getAdminPasswordFromEnv()
  if (!envEmail || !envPassword) return true
  return email.trim().toLowerCase() === envEmail.toLowerCase() && password === envPassword
}

export function loadRememberedAdmin(): RememberedAdmin | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as RememberedAdmin
    if (parsed.email && parsed.password) return parsed
  } catch {
    /* ignore */
  }
  return null
}

export function saveRememberedAdmin(credentials: RememberedAdmin) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
}

export function clearRememberedAdmin() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getDefaultAdminEmail(): string {
  const remembered = loadRememberedAdmin()
  if (remembered?.email) return remembered.email
  return getAdminEmailFromEnv()
}

export function getDefaultAdminPassword(): string {
  const remembered = loadRememberedAdmin()
  if (remembered?.password) return remembered.password
  return getAdminPasswordFromEnv()
}

export function shouldRememberByDefault(): boolean {
  return loadRememberedAdmin() !== null
}

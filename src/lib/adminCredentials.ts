export function getAdminEmailFromEnv(): string {
  return (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim() ?? ''
}

export function getAdminPasswordFromEnv(): string {
  return (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? ''
}

export function isAdminCredentialsConfigured(): boolean {
  return Boolean(getAdminEmailFromEnv() && getAdminPasswordFromEnv())
}

export function getAdminCredentials() {
  return {
    email: getAdminEmailFromEnv(),
    password: getAdminPasswordFromEnv(),
  }
}

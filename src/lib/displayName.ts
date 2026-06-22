/** Nome que a pessoa escolheu no onboarding (ex.: "Lu", "Ana"). */
export function formatPreferredName(
  name: string | undefined | null,
  fallback = 'Reset90'
): string {
  const trimmed = name?.trim()
  if (!trimmed) return fallback
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

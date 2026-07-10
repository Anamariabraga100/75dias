let hydrated = false
const waiters: Array<() => void> = []

export function markStoreHydrated() {
  if (hydrated) return
  hydrated = true
  for (const resolve of waiters) resolve()
  waiters.length = 0
}

export function waitForStoreHydration(): Promise<void> {
  if (hydrated) return Promise.resolve()
  return new Promise((resolve) => waiters.push(resolve))
}

export function hasStoreHydrated(): boolean {
  return hydrated
}

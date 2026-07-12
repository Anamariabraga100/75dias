/**
 * Storage de sessão resistente no PWA.
 * Leitura/escrita síncrona via memória + localStorage; IndexedDB espelha em background
 * (nunca bloqueia o login).
 */

const DB_NAME = 'reset90-auth-db'
const STORE_NAME = 'kv'
const DB_VERSION = 1
const IDB_TIMEOUT_MS = 1500

const memory = new Map<string, string>()

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB unavailable'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('indexedDB open failed'))
  })
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(null), ms)
    promise
      .then((value) => {
        window.clearTimeout(timer)
        resolve(value)
      })
      .catch(() => {
        window.clearTimeout(timer)
        resolve(null)
      })
  })
}

async function idbGet(key: string): Promise<string | null> {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(key)
      req.onsuccess = () => {
        const value = req.result
        resolve(typeof value === 'string' ? value : null)
      }
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

async function idbSet(key: string, value: string): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    /* ignore */
  }
}

async function idbRemove(key: string): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    /* ignore */
  }
}

export const authStorage = {
  getItem: (key: string): string | null => {
    if (memory.has(key)) return memory.get(key) ?? null
    try {
      const fromLs = localStorage.getItem(key)
      if (fromLs != null) {
        memory.set(key, fromLs)
        return fromLs
      }
    } catch {
      /* ignore */
    }
    return null
  },

  setItem: (key: string, value: string): void => {
    memory.set(key, value)
    try {
      localStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
    // Espelho IDB sem bloquear o login
    void idbSet(key, value)
  },

  removeItem: (key: string): void => {
    memory.delete(key)
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    void idbRemove(key)
  },
}

/** Pré-aquece memória a partir do IndexedDB (com timeout). */
export async function warmAuthStorage(keys: string[]): Promise<void> {
  await Promise.all(
    keys.map(async (key) => {
      if (memory.has(key) || authStorage.getItem(key)) return
      const fromIdb = await withTimeout(idbGet(key), IDB_TIMEOUT_MS)
      if (fromIdb != null) {
        memory.set(key, fromIdb)
        try {
          localStorage.setItem(key, fromIdb)
        } catch {
          /* ignore */
        }
      }
    })
  )
}

export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist) {
      await withTimeout(navigator.storage.persist().then(() => undefined), 1000)
    }
  } catch {
    /* ignore */
  }
}

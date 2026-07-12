/**
 * Storage de sessão mais resistente no PWA (iOS limpa localStorage com mais facilidade).
 * Memória + IndexedDB + localStorage (espelho).
 */

const DB_NAME = 'reset90-auth-db'
const STORE_NAME = 'kv'
const DB_VERSION = 1

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
  getItem: async (key: string): Promise<string | null> => {
    if (memory.has(key)) return memory.get(key) ?? null

    const fromIdb = await idbGet(key)
    if (fromIdb != null) {
      memory.set(key, fromIdb)
      try {
        localStorage.setItem(key, fromIdb)
      } catch {
        /* ignore */
      }
      return fromIdb
    }

    try {
      const fromLs = localStorage.getItem(key)
      if (fromLs != null) {
        memory.set(key, fromLs)
        void idbSet(key, fromLs)
        return fromLs
      }
    } catch {
      /* ignore */
    }

    return null
  },

  setItem: async (key: string, value: string): Promise<void> => {
    memory.set(key, value)
    try {
      localStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
    await idbSet(key, value)
  },

  removeItem: async (key: string): Promise<void> => {
    memory.delete(key)
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    await idbRemove(key)
  },
}

/** Pré-aquece memória a partir do IndexedDB / localStorage antes do bootstrap. */
export async function warmAuthStorage(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => authStorage.getItem(key)))
}

/** Pede ao browser para não evictar dados do app (ajuda no PWA). */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist) {
      await navigator.storage.persist()
    }
  } catch {
    /* ignore */
  }
}

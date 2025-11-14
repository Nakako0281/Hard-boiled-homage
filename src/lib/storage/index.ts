/**
 * LocalStorage操作関数
 */

export interface StorageError {
  type: 'QUOTA_EXCEEDED' | 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN'
  message: string
}

/**
 * localStorageからデータを取得
 */
export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return null
    }
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`Failed to get item from localStorage: ${key}`, error)
    return null
  }
}

/**
 * localStorageにデータを保存
 */
export function setItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(key, serialized)
    return true
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded')
    } else {
      console.error(`Failed to save item to localStorage: ${key}`, error)
    }
    return false
  }
}

/**
 * localStorageからデータを削除
 */
export function removeItem(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Failed to remove item from localStorage: ${key}`, error)
    return false
  }
}

/**
 * localStorageをクリア
 */
export function clear(): boolean {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Failed to clear localStorage', error)
    return false
  }
}

/**
 * キーが存在するかチェック
 */
export function hasItem(key: string): boolean {
  return localStorage.getItem(key) !== null
}

/**
 * 全てのキーを取得
 */
export function getAllKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key !== null) {
      keys.push(key)
    }
  }
  return keys
}

/**
 * プレフィックスに一致する全てのキーを取得
 */
export function getKeysByPrefix(prefix: string): string[] {
  return getAllKeys().filter((key) => key.startsWith(prefix))
}

/**
 * プレフィックスに一致する全てのアイテムを削除
 */
export function removeItemsByPrefix(prefix: string): boolean {
  try {
    const keys = getKeysByPrefix(prefix)
    keys.forEach((key) => localStorage.removeItem(key))
    return true
  } catch (error) {
    console.error(`Failed to remove items with prefix: ${prefix}`, error)
    return false
  }
}

/**
 * LocalStorageの使用量を取得（バイト数）
 */
export function getStorageSize(): number {
  let total = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key !== null) {
      const value = localStorage.getItem(key)
      if (value !== null) {
        total += key.length + value.length
      }
    }
  }
  return total
}

/**
 * LocalStorageの残り容量をチェック（概算）
 */
export function checkStorageQuota(): {
  used: number
  total: number
  available: number
  percentUsed: number
} {
  const used = getStorageSize()
  // Most browsers have 5-10MB limit for localStorage
  const total = 5 * 1024 * 1024 // 5MB in bytes
  const available = total - used
  const percentUsed = (used / total) * 100

  return {
    used,
    total,
    available,
    percentUsed,
  }
}

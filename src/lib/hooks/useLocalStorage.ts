import { useState, useCallback } from 'react'

/**
 * LocalStorageとの連携を管理するHook
 */
export type UseLocalStorageReturn<T> = [
  T,
  (value: T | ((prev: T) => T)) => void,
  () => void
]

/**
 * LocalStorageとの連携を管理するカスタムフック
 * @param key LocalStorageのキー
 * @param initialValue 初期値
 * @returns [storedValue, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  // 初期値の取得
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return initialValue
    }
  })

  // 値の更新
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value

        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error('Failed to save to localStorage:', error)
      }
    },
    [key, storedValue]
  )

  // 削除
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

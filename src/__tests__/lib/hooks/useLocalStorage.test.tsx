import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/lib/hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    // localStorageをクリア
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('初期値を返す', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    expect(result.current[0]).toBe('initial')
  })

  it('setValueで値を保存できる', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new value')
    })

    expect(result.current[0]).toBe('new value')
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new value'))
  })

  it('localStorageから既存の値を読み込む', () => {
    localStorage.setItem('test-key', JSON.stringify('stored value'))

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    expect(result.current[0]).toBe('stored value')
  })

  it('関数を渡して値を更新できる', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 10))

    act(() => {
      result.current[1]((prev) => prev + 5)
    })

    expect(result.current[0]).toBe(15)
  })

  it('removeValueで値を削除できる', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('stored')
    })

    expect(result.current[0]).toBe('stored')

    act(() => {
      result.current[2]() // removeValue
    })

    expect(result.current[0]).toBe('initial')
    expect(localStorage.getItem('test-key')).toBeNull()
  })

  it('オブジェクトを保存・読み込みできる', () => {
    const initialValue = { name: 'test', count: 0 }
    const { result } = renderHook(() => useLocalStorage('test-key', initialValue))

    act(() => {
      result.current[1]({ name: 'updated', count: 10 })
    })

    expect(result.current[0]).toEqual({ name: 'updated', count: 10 })

    const stored = localStorage.getItem('test-key')
    expect(stored).toBeTruthy()
    expect(JSON.parse(stored!)).toEqual({ name: 'updated', count: 10 })
  })

  it('配列を保存・読み込みできる', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', [1, 2, 3]))

    act(() => {
      result.current[1]([4, 5, 6])
    })

    expect(result.current[0]).toEqual([4, 5, 6])
  })

  it('localStorageの読み込みエラー時は初期値を返す', () => {
    // 不正なJSONを設定
    localStorage.setItem('test-key', 'invalid json')

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    expect(result.current[0]).toBe('initial')
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load from localStorage:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('localStorageの保存エラーをハンドリング', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Storage full')
      })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    act(() => {
      result.current[1]('new value')
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save to localStorage:',
      expect.any(Error)
    )

    setItemSpy.mockRestore()
    consoleSpy.mockRestore()
  })

  it('localStorageの削除エラーをハンドリング', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    const removeItemSpy = vi
      .spyOn(Storage.prototype, 'removeItem')
      .mockImplementation(() => {
        throw new Error('Remove failed')
      })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    act(() => {
      result.current[2]() // removeValue
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to remove from localStorage:',
      expect.any(Error)
    )

    removeItemSpy.mockRestore()
    consoleSpy.mockRestore()
  })

  it('数値を保存・読み込みできる', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 42))

    act(() => {
      result.current[1](100)
    })

    expect(result.current[0]).toBe(100)
  })

  it('boolean値を保存・読み込みできる', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', false))

    act(() => {
      result.current[1](true)
    })

    expect(result.current[0]).toBe(true)
  })

  it('nullを保存・読み込みできる', () => {
    const { result } = renderHook(() => useLocalStorage<string | null>('test-key', null))

    act(() => {
      result.current[1]('not null')
    })

    expect(result.current[0]).toBe('not null')

    act(() => {
      result.current[1](null)
    })

    expect(result.current[0]).toBe(null)
  })
})

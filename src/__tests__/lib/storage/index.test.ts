import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getItem,
  setItem,
  removeItem,
  clear,
  hasItem,
  getAllKeys,
  getKeysByPrefix,
  removeItemsByPrefix,
  getStorageSize,
  checkStorageQuota,
} from '@/lib/storage'

describe('Storage utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('getItem', () => {
    it('存在するキーの値を取得できる', () => {
      localStorage.setItem('test', JSON.stringify({ value: 'hello' }))

      const result = getItem<{ value: string }>('test')

      expect(result).toEqual({ value: 'hello' })
    })

    it('存在しないキーの場合はnullを返す', () => {
      const result = getItem('nonexistent')

      expect(result).toBeNull()
    })

    it('JSON解析エラーの場合はnullを返す', () => {
      localStorage.setItem('invalid', 'not a json')

      const result = getItem('invalid')

      expect(result).toBeNull()
    })
  })

  describe('setItem', () => {
    it('データを保存できる', () => {
      const data = { name: 'test', value: 123 }

      const result = setItem('test', data)

      expect(result).toBe(true)
      expect(localStorage.getItem('test')).toBe(JSON.stringify(data))
    })

    it('複雑なオブジェクトを保存できる', () => {
      const data = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
      }

      const result = setItem('complex', data)

      expect(result).toBe(true)
      const retrieved = getItem<typeof data>('complex')
      expect(retrieved).toEqual(data)
    })
  })

  describe('removeItem', () => {
    it('アイテムを削除できる', () => {
      localStorage.setItem('test', 'value')

      const result = removeItem('test')

      expect(result).toBe(true)
      expect(localStorage.getItem('test')).toBeNull()
    })
  })

  describe('clear', () => {
    it('全てのアイテムを削除できる', () => {
      localStorage.setItem('key1', 'value1')
      localStorage.setItem('key2', 'value2')

      const result = clear()

      expect(result).toBe(true)
      expect(localStorage.length).toBe(0)
    })
  })

  describe('hasItem', () => {
    it('存在するキーの場合はtrueを返す', () => {
      localStorage.setItem('test', 'value')

      expect(hasItem('test')).toBe(true)
    })

    it('存在しないキーの場合はfalseを返す', () => {
      expect(hasItem('nonexistent')).toBe(false)
    })
  })

  describe('getAllKeys', () => {
    it('全てのキーを取得できる', () => {
      localStorage.setItem('key1', 'value1')
      localStorage.setItem('key2', 'value2')
      localStorage.setItem('key3', 'value3')

      const keys = getAllKeys()

      expect(keys).toHaveLength(3)
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
    })

    it('空の場合は空配列を返す', () => {
      const keys = getAllKeys()

      expect(keys).toEqual([])
    })
  })

  describe('getKeysByPrefix', () => {
    it('プレフィックスに一致するキーを取得できる', () => {
      localStorage.setItem('game_save_1', 'data1')
      localStorage.setItem('game_save_2', 'data2')
      localStorage.setItem('user_profile', 'profile')

      const keys = getKeysByPrefix('game_save_')

      expect(keys).toHaveLength(2)
      expect(keys).toContain('game_save_1')
      expect(keys).toContain('game_save_2')
      expect(keys).not.toContain('user_profile')
    })
  })

  describe('removeItemsByPrefix', () => {
    it('プレフィックスに一致する全てのアイテムを削除できる', () => {
      localStorage.setItem('temp_1', 'data1')
      localStorage.setItem('temp_2', 'data2')
      localStorage.setItem('keep_this', 'keep')

      const result = removeItemsByPrefix('temp_')

      expect(result).toBe(true)
      expect(hasItem('temp_1')).toBe(false)
      expect(hasItem('temp_2')).toBe(false)
      expect(hasItem('keep_this')).toBe(true)
    })
  })

  describe('getStorageSize', () => {
    it('ストレージサイズを計算できる', () => {
      localStorage.setItem('key1', 'value1')

      const size = getStorageSize()

      // key1 (4文字) + value1 (6文字) = 10バイト
      expect(size).toBeGreaterThan(0)
    })
  })

  describe('checkStorageQuota', () => {
    it('ストレージの使用状況を取得できる', () => {
      localStorage.setItem('test', 'data')

      const quota = checkStorageQuota()

      expect(quota.used).toBeGreaterThan(0)
      expect(quota.total).toBeGreaterThan(0)
      expect(quota.available).toBeGreaterThan(0)
      expect(quota.percentUsed).toBeGreaterThanOrEqual(0)
      expect(quota.percentUsed).toBeLessThanOrEqual(100)
    })
  })
})

import { describe, it, expect } from 'vitest'
import {
  validatePosition,
  hasRequiredKeys,
  validateVersion,
  validateTimestamp,
  validateSaveDataStructure,
  validateArray,
  validateNumberRange,
  validateEnum,
} from '@/lib/storage/validation'

describe('Validation utilities', () => {
  describe('validatePosition', () => {
    it('正しいPosition型を検証できる', () => {
      expect(validatePosition({ x: 0, y: 0 })).toBe(true)
      expect(validatePosition({ x: 5, y: 10 })).toBe(true)
    })

    it('不正なPosition型を検出できる', () => {
      expect(validatePosition({ x: -1, y: 0 })).toBe(false)
      expect(validatePosition({ x: 0, y: -1 })).toBe(false)
      expect(validatePosition({ x: 1.5, y: 0 })).toBe(false)
      expect(validatePosition({ x: '0', y: 0 })).toBe(false)
      expect(validatePosition({})).toBe(false)
      expect(validatePosition(null)).toBe(false)
    })
  })

  describe('hasRequiredKeys', () => {
    it('必要なキーが全て存在する場合はtrueを返す', () => {
      const data = { name: 'test', value: 123, active: true }

      const result = hasRequiredKeys(data, ['name', 'value'])

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('不足しているキーがある場合はfalseを返す', () => {
      const data = { name: 'test' }

      const result = hasRequiredKeys(data, ['name', 'value', 'active'])

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing required key: value')
      expect(result.errors).toContain('Missing required key: active')
    })

    it('オブジェクトでない場合はエラーを返す', () => {
      const result = hasRequiredKeys('not an object', ['key'])

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Data must be an object')
    })
  })

  describe('validateVersion', () => {
    it('正しいセマンティックバージョンを検証できる', () => {
      expect(validateVersion('1.0.0')).toBe(true)
      expect(validateVersion('2.5.3')).toBe(true)
      expect(validateVersion('10.20.30')).toBe(true)
    })

    it('不正なバージョンを検出できる', () => {
      expect(validateVersion('1.0')).toBe(false)
      expect(validateVersion('v1.0.0')).toBe(false)
      expect(validateVersion('1.0.0-beta')).toBe(false)
      expect(validateVersion(123)).toBe(false)
    })
  })

  describe('validateTimestamp', () => {
    it('正しいタイムスタンプを検証できる', () => {
      const now = Date.now()
      expect(validateTimestamp(now)).toBe(true)

      const past = new Date('2020-01-01').getTime()
      expect(validateTimestamp(past)).toBe(true)
    })

    it('不正なタイムスタンプを検出できる', () => {
      const tooOld = new Date('2019-12-31').getTime()
      expect(validateTimestamp(tooOld)).toBe(false)

      const tooFar = Date.now() + 200 * 365 * 24 * 60 * 60 * 1000
      expect(validateTimestamp(tooFar)).toBe(false)

      expect(validateTimestamp('not a number')).toBe(false)
    })
  })

  describe('validateSaveDataStructure', () => {
    it('正しいセーブデータ構造を検証できる', () => {
      const saveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        data: { some: 'data' },
      }

      expect(validateSaveDataStructure(saveData)).toBe(true)
    })

    it('不正なセーブデータ構造を検出できる', () => {
      expect(
        validateSaveDataStructure({
          version: 'invalid',
          timestamp: Date.now(),
          data: {},
        })
      ).toBe(false)

      expect(
        validateSaveDataStructure({
          version: '1.0.0',
          timestamp: 'invalid',
          data: {},
        })
      ).toBe(false)

      expect(
        validateSaveDataStructure({
          version: '1.0.0',
          timestamp: Date.now(),
        })
      ).toBe(false)
    })
  })

  describe('validateArray', () => {
    it('配列を検証できる', () => {
      expect(validateArray([1, 2, 3])).toBe(true)
      expect(validateArray([])).toBe(true)
    })

    it('バリデーター関数を使用できる', () => {
      const isNumber = (item: unknown) => typeof item === 'number'

      expect(validateArray([1, 2, 3], isNumber)).toBe(true)
      expect(validateArray([1, '2', 3], isNumber)).toBe(false)
    })

    it('配列でない場合はfalseを返す', () => {
      expect(validateArray('not an array')).toBe(false)
      expect(validateArray({})).toBe(false)
    })
  })

  describe('validateNumberRange', () => {
    it('範囲内の数値を検証できる', () => {
      expect(validateNumberRange(5, 0, 10)).toBe(true)
      expect(validateNumberRange(0, 0, 10)).toBe(true)
      expect(validateNumberRange(10, 0, 10)).toBe(true)
    })

    it('範囲外の数値を検出できる', () => {
      expect(validateNumberRange(-1, 0, 10)).toBe(false)
      expect(validateNumberRange(11, 0, 10)).toBe(false)
      expect(validateNumberRange('5', 0, 10)).toBe(false)
    })
  })

  describe('validateEnum', () => {
    it('列挙型の値を検証できる', () => {
      const colors = ['red', 'green', 'blue'] as const

      expect(validateEnum('red', colors)).toBe(true)
      expect(validateEnum('green', colors)).toBe(true)
      expect(validateEnum('blue', colors)).toBe(true)
    })

    it('列挙型にない値を検出できる', () => {
      const colors = ['red', 'green', 'blue'] as const

      expect(validateEnum('yellow', colors)).toBe(false)
      expect(validateEnum(123, colors)).toBe(false)
    })
  })
})

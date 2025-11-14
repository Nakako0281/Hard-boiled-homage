/**
 * データ検証関数
 */

import type { Position } from '@/lib/types/position'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Position型の検証
 */
export function validatePosition(data: unknown): data is Position {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const pos = data as Record<string, unknown>
  return (
    typeof pos.x === 'number' &&
    typeof pos.y === 'number' &&
    Number.isInteger(pos.x) &&
    Number.isInteger(pos.y) &&
    pos.x >= 0 &&
    pos.y >= 0
  )
}

/**
 * オブジェクトが指定されたキーを持つか検証
 */
export function hasRequiredKeys(
  data: unknown,
  requiredKeys: string[]
): ValidationResult {
  const errors: string[] = []

  if (typeof data !== 'object' || data === null) {
    errors.push('Data must be an object')
    return { isValid: false, errors }
  }

  const obj = data as Record<string, unknown>

  for (const key of requiredKeys) {
    if (!(key in obj)) {
      errors.push(`Missing required key: ${key}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * バージョン番号の検証
 */
export function validateVersion(version: unknown): version is string {
  if (typeof version !== 'string') {
    return false
  }

  // セマンティックバージョニング形式: x.y.z
  const versionRegex = /^\d+\.\d+\.\d+$/
  return versionRegex.test(version)
}

/**
 * タイムスタンプの検証
 */
export function validateTimestamp(timestamp: unknown): timestamp is number {
  if (typeof timestamp !== 'number') {
    return false
  }

  // タイムスタンプが妥当な範囲内か（2020年以降、未来100年以内）
  const minTimestamp = new Date('2020-01-01').getTime()
  const maxTimestamp = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000

  return timestamp >= minTimestamp && timestamp <= maxTimestamp
}

/**
 * セーブデータの基本構造検証
 */
export interface SaveDataStructure {
  version: string
  timestamp: number
  data: unknown
}

export function validateSaveDataStructure(
  data: unknown
): data is SaveDataStructure {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const save = data as Record<string, unknown>

  return (
    validateVersion(save.version) &&
    validateTimestamp(save.timestamp) &&
    'data' in save
  )
}

/**
 * 配列の検証
 */
export function validateArray(
  data: unknown,
  validator?: (item: unknown) => boolean
): data is unknown[] {
  if (!Array.isArray(data)) {
    return false
  }

  if (validator) {
    return data.every(validator)
  }

  return true
}

/**
 * 数値の範囲検証
 */
export function validateNumberRange(
  value: unknown,
  min: number,
  max: number
): value is number {
  if (typeof value !== 'number') {
    return false
  }

  return value >= min && value <= max
}

/**
 * 列挙型の検証
 */
export function validateEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[]
): value is T {
  if (typeof value !== 'string') {
    return false
  }

  return (allowedValues as readonly string[]).includes(value)
}

import type { Field } from '@/lib/types/grid'
import type { Unit } from '@/lib/types/unit'
import type { Position } from '@/lib/types/position'
import { Rotation } from '@/lib/types/enums'
import { canPlaceUnit } from '@/lib/utils/grid'

/**
 * 配置完了判定結果
 */
export interface PlacementValidationResult {
  isValid: boolean
  isComplete: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 配置検証：配置が有効かチェック
 * @param field フィールド
 * @returns 配置検証結果
 */
export function validatePlacement(field: Field): PlacementValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. 配置数チェック
  const placedCount = field.placedUnits.length
  if (placedCount === 0) {
    errors.push('部隊が1つも配置されていません')
  }

  // 2. 最小配置数チェック（最低3部隊は必要）
  const minUnits = 3
  if (placedCount < minUnits) {
    warnings.push(`推奨部隊数は${minUnits}部隊以上です（現在: ${placedCount}部隊）`)
  }

  // 3. フィールド占有率チェック
  const totalCells = field.size.width * field.size.height
  const occupiedCells = field.placedUnits.reduce(
    (sum, unit) => sum + unit.occupiedCells.length,
    0
  )
  const occupancyRate = occupiedCells / totalCells

  if (occupancyRate < 0.2) {
    warnings.push(
      `フィールド占有率が低いです（${Math.floor(occupancyRate * 100)}%）`
    )
  }

  // 4. 各部隊の整合性チェック
  for (const placedUnit of field.placedUnits) {
    // 占有セルとフィールド内のunitIdが一致するか
    for (const cell of placedUnit.occupiedCells) {
      if (
        cell.x >= field.size.width ||
        cell.y >= field.size.height ||
        cell.x < 0 ||
        cell.y < 0
      ) {
        errors.push(
          `部隊 ${placedUnit.unitId} の占有セル (${cell.x}, ${cell.y}) がフィールド外です`
        )
      } else {
        const fieldCell = field.cells[cell.y][cell.x]
        if (fieldCell.unitId !== placedUnit.unitId) {
          errors.push(
            `部隊 ${placedUnit.unitId} の占有セルとフィールドの状態が不一致です`
          )
        }
      }
    }
  }

  const isValid = errors.length === 0
  const isComplete = isValid && placedCount >= minUnits

  return {
    isValid,
    isComplete,
    errors,
    warnings,
  }
}

/**
 * 配置が完了しているかチェック
 * @param field フィールド
 * @returns 配置完了ならtrue
 */
export function isPlacementComplete(field: Field): boolean {
  const validation = validatePlacement(field)
  return validation.isComplete
}

/**
 * 指定位置に部隊を配置可能かチェック（高レベルAPI）
 * @param unit 配置する部隊
 * @param position 配置位置
 * @param rotation 回転角度
 * @param field 対象フィールド
 * @returns エラーメッセージ配列（配置可能なら空配列）
 */
export function checkPlacementValidity(
  unit: Unit,
  position: Position,
  rotation: Rotation,
  field: Field
): string[] {
  const errors: string[] = []

  // 1. 地雷個数チェック（先にチェック）
  if (unit.id === 'mine') {
    const mineCount = field.placedUnits.filter(
      (u) => u.unitId === 'mine'
    ).length
    if (mineCount >= 6) {
      errors.push('地雷は最大6個まで配置できます')
      return errors
    }
  }

  // 2. 同じ部隊の重複配置チェック（地雷以外、先にチェック）
  if (unit.id !== 'mine') {
    const alreadyPlaced = field.placedUnits.some(
      (u) => u.unitId === unit.id
    )
    if (alreadyPlaced) {
      errors.push('この部隊は既に配置されています')
      return errors
    }
  }

  // 3. 基本的な配置可能性チェック
  if (!canPlaceUnit(unit, position, rotation, field)) {
    // より詳細なエラーメッセージを生成
    const occupiedCells = getOccupiedCells(unit, position, rotation)

    // 範囲外チェック
    for (const cell of occupiedCells) {
      if (
        cell.x < 0 ||
        cell.x >= field.size.width ||
        cell.y < 0 ||
        cell.y >= field.size.height
      ) {
        errors.push('部隊がフィールド外にはみ出しています')
        return errors // 範囲外エラーは最優先
      }
    }

    // 重複チェック
    for (const cell of occupiedCells) {
      const fieldCell = field.cells[cell.y][cell.x]
      if (fieldCell.unitId !== undefined) {
        errors.push('既に他の部隊が配置されています')
        return errors
      }
    }

    // 上記の具体的エラーに該当しない場合は一般エラー
    errors.push('配置できません')
  }

  return errors
}

/**
 * 占有セルを計算（内部ヘルパー）
 * @param unit 部隊
 * @param position 配置位置
 * @param rotation 回転角度
 * @returns 占有セル配列
 */
function getOccupiedCells(
  unit: Unit,
  position: Position,
  rotation: Rotation
): Position[] {
  // 回転処理
  const rotatedShape = rotateShape(unit.shape, rotation)
  const cells: Position[] = []

  for (let y = 0; y < rotatedShape.length; y++) {
    for (let x = 0; x < rotatedShape[y].length; x++) {
      if (rotatedShape[y][x] === 1) {
        cells.push({
          x: position.x + x,
          y: position.y + y,
        })
      }
    }
  }

  return cells
}

/**
 * 形状を回転（内部ヘルパー）
 * @param shape 元の形状
 * @param rotation 回転角度
 * @returns 回転後の形状
 */
function rotateShape(shape: number[][], rotation: Rotation): number[][] {
  switch (rotation) {
    case Rotation.DEG_0:
      return shape

    case Rotation.DEG_90: {
      const height = shape.length
      const width = shape[0].length
      const rotated: number[][] = Array.from({ length: width }, () =>
        Array(height).fill(0)
      )
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          rotated[x][height - 1 - y] = shape[y][x]
        }
      }
      return rotated
    }

    case Rotation.DEG_180: {
      const height = shape.length
      const width = shape[0].length
      const rotated: number[][] = Array.from({ length: height }, () =>
        Array(width).fill(0)
      )
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          rotated[height - 1 - y][width - 1 - x] = shape[y][x]
        }
      }
      return rotated
    }

    case Rotation.DEG_270: {
      const height = shape.length
      const width = shape[0].length
      const rotated: number[][] = Array.from({ length: width }, () =>
        Array(height).fill(0)
      )
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          rotated[width - 1 - x][y] = shape[y][x]
        }
      }
      return rotated
    }

    default:
      return shape
  }
}

/**
 * 配置された部隊の統計情報を取得
 * @param field フィールド
 * @returns 統計情報
 */
export interface PlacementStats {
  totalUnits: number
  occupiedCells: number
  occupancyRate: number
  mineCount: number
  hasMinimumUnits: boolean
}

export function getPlacementStats(field: Field): PlacementStats {
  const totalCells = field.size.width * field.size.height
  const occupiedCells = field.placedUnits.reduce(
    (sum, unit) => sum + unit.occupiedCells.length,
    0
  )
  const occupancyRate = occupiedCells / totalCells
  const mineCount = field.placedUnits.filter((u) => u.unitId === 'mine').length
  const minUnits = 3
  const hasMinimumUnits = field.placedUnits.length >= minUnits

  return {
    totalUnits: field.placedUnits.length,
    occupiedCells,
    occupancyRate,
    mineCount,
    hasMinimumUnits,
  }
}

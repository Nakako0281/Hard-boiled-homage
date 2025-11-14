import type { Field } from '@/lib/types/grid'
import type { PlacedUnit, Unit } from '@/lib/types/unit'
import type { Position } from '@/lib/types/position'
import type { Enemy } from '@/lib/types/battle'
import { Rotation } from '@/lib/types/enums'
import { canPlaceUnit } from '@/lib/utils/grid'
import { randomChoice } from './base'

/**
 * AIによるランダム配置（Easy～Medium）
 * @param enemy 敵データ
 * @param field フィールド
 * @param units 部隊マスターデータ配列
 * @returns 配置済み部隊リスト
 */
export function placeUnitsRandomly(
  enemy: Enemy,
  field: Field,
  units: Unit[]
): PlacedUnit[] {
  const placedUnits: PlacedUnit[] = []

  for (const unitId of enemy.units) {
    const unit = units.find((u) => u.id === unitId)
    if (!unit) continue

    let placed = false
    let attempts = 0
    const maxAttempts = 100

    while (!placed && attempts < maxAttempts) {
      // ランダムな位置と回転
      const x = Math.floor(Math.random() * field.size.width)
      const y = Math.floor(Math.random() * field.size.height)
      const rotation = randomChoice([
        Rotation.DEG_0,
        Rotation.DEG_90,
        Rotation.DEG_180,
        Rotation.DEG_270,
      ])

      // 配置可能かチェック
      if (canPlaceUnit(unit, { x, y }, rotation, field)) {
        const occupiedCells = getOccupiedCellsForUnit(unit, { x, y }, rotation)
        const placedUnit: PlacedUnit = {
          unitId: unit.id,
          position: { x, y },
          rotation,
          occupiedCells,
          hitCells: [],
          isDestroyed: false,
        }

        // フィールドに反映
        for (const cell of occupiedCells) {
          field.cells[cell.y][cell.x].unitId = unit.id
        }

        placedUnits.push(placedUnit)
        placed = true
      }

      attempts++
    }

    // 配置できなかった場合は警告
    if (!placed) {
      console.warn(`Failed to place unit: ${unitId}`)
    }
  }

  return placedUnits
}

/**
 * AIによる戦略的配置（Hard～Nightmare）
 * @param enemy 敵データ
 * @param field フィールド
 * @param units 部隊マスターデータ配列
 * @returns 配置済み部隊リスト
 */
export function placeUnitsStrategically(
  enemy: Enemy,
  field: Field,
  units: Unit[]
): PlacedUnit[] {
  const placedUnits: PlacedUnit[] = []
  const unitList = enemy.units
    .map((id: string) => units.find((u: Unit) => u.id === id))
    .filter((u): u is Unit => u !== undefined)

  // 優先度順にソート（重要な部隊を先に配置）
  unitList.sort((a: Unit, b: Unit) => getUnitPriority(b) - getUnitPriority(a))

  for (const unit of unitList) {
    let placed = false
    let attempts = 0
    const maxAttempts = 100

    while (!placed && attempts < maxAttempts) {
      const position = getStrategicPosition(unit, field, placedUnits)
      const rotation = randomChoice([
        Rotation.DEG_0,
        Rotation.DEG_90,
        Rotation.DEG_180,
        Rotation.DEG_270,
      ])

      if (canPlaceUnit(unit, position, rotation, field)) {
        const occupiedCells = getOccupiedCellsForUnit(unit, position, rotation)
        const placedUnit: PlacedUnit = {
          unitId: unit.id,
          position,
          rotation,
          occupiedCells,
          hitCells: [],
          isDestroyed: false,
        }

        // フィールドに反映
        for (const cell of occupiedCells) {
          field.cells[cell.y][cell.x].unitId = unit.id
        }

        placedUnits.push(placedUnit)
        placed = true
      }

      attempts++
    }

    if (!placed) {
      console.warn(`Failed to place unit strategically: ${unit.id}`)
    }
  }

  return placedUnits
}

/**
 * 部隊の優先度を取得（高いほど重要）
 * @param unit 部隊
 * @returns 優先度
 */
function getUnitPriority(unit: Unit): number {
  const priorities: Record<string, number> = {
    giant_airship: 100,
    aircraft_carrier: 90,
    ferrari: 80,
    passenger_plane: 70,
    mine: 10,
  }

  return priorities[unit.id] || 50
}

/**
 * 戦略的な配置位置を取得
 * @param unit 部隊
 * @param field フィールド
 * @param placedUnits 既に配置済みの部隊
 * @returns 配置位置
 */
function getStrategicPosition(
  unit: Unit,
  field: Field,
  placedUnits: PlacedUnit[]
): Position {
  const centerX = Math.floor(field.size.width / 2)
  const centerY = Math.floor(field.size.height / 2)

  // 重要な部隊は中央寄りに配置
  if (unit.id === 'giant_airship' || unit.id === 'aircraft_carrier') {
    const range = 2
    return {
      x: Math.max(
        0,
        Math.min(
          field.size.width - 1,
          centerX + Math.floor(Math.random() * range * 2) - range
        )
      ),
      y: Math.max(
        0,
        Math.min(
          field.size.height - 1,
          centerY + Math.floor(Math.random() * range * 2) - range
        )
      ),
    }
  }

  // 地雷は分散配置
  if (unit.id === 'mine') {
    return getDistributedPosition(
      field,
      placedUnits.filter((u) => u.unitId === 'mine')
    )
  }

  // その他はランダム（端は避ける）
  const margin = 1
  return {
    x:
      margin +
      Math.floor(Math.random() * Math.max(1, field.size.width - margin * 2)),
    y:
      margin +
      Math.floor(Math.random() * Math.max(1, field.size.height - margin * 2)),
  }
}

/**
 * 分散した位置を取得（地雷用）
 * @param field フィールド
 * @param existingMines 既存の地雷
 * @returns 分散配置位置
 */
function getDistributedPosition(
  field: Field,
  existingMines: PlacedUnit[]
): Position {
  // フィールドを4分割して、各エリアに1つずつ配置
  const quadrants = [
    {
      minX: 0,
      maxX: Math.floor(field.size.width / 2),
      minY: 0,
      maxY: Math.floor(field.size.height / 2),
    },
    {
      minX: Math.floor(field.size.width / 2),
      maxX: field.size.width,
      minY: 0,
      maxY: Math.floor(field.size.height / 2),
    },
    {
      minX: 0,
      maxX: Math.floor(field.size.width / 2),
      minY: Math.floor(field.size.height / 2),
      maxY: field.size.height,
    },
    {
      minX: Math.floor(field.size.width / 2),
      maxX: field.size.width,
      minY: Math.floor(field.size.height / 2),
      maxY: field.size.height,
    },
  ]

  // まだ地雷が少ないエリアを選択
  const quadrantCounts = quadrants.map(
    (q) =>
      existingMines.filter(
        (m) =>
          m.position.x >= q.minX &&
          m.position.x < q.maxX &&
          m.position.y >= q.minY &&
          m.position.y < q.maxY
      ).length
  )

  const minCount = Math.min(...quadrantCounts)
  const targetQuadrantIndex = quadrantCounts.indexOf(minCount)
  const targetQuadrant = quadrants[targetQuadrantIndex]

  const width = targetQuadrant.maxX - targetQuadrant.minX
  const height = targetQuadrant.maxY - targetQuadrant.minY

  return {
    x: targetQuadrant.minX + Math.floor(Math.random() * Math.max(1, width)),
    y: targetQuadrant.minY + Math.floor(Math.random() * Math.max(1, height)),
  }
}

/**
 * 部隊の占有セルを計算
 * @param unit 部隊
 * @param position 位置
 * @param rotation 回転
 * @returns 占有セル配列
 */
function getOccupiedCellsForUnit(
  unit: Unit,
  position: Position,
  rotation: Rotation
): Position[] {
  const rotatedShape = rotateUnitShape(unit.shape, rotation)
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
 * 部隊形状を回転
 * @param shape 元の形状
 * @param rotation 回転角度
 * @returns 回転後の形状
 */
function rotateUnitShape(shape: number[][], rotation: Rotation): number[][] {
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

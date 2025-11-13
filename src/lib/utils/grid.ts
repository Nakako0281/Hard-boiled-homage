import type { Cell } from '@/lib/types/cell'
import type { Field } from '@/lib/types/grid'
import type { Unit, PlacedUnit } from '@/lib/types/unit'
import type { Position, GridSize } from '@/lib/types/position'
import { CellState, Rotation } from '@/lib/types/enums'
import { rotateShape } from './position'
import { isPositionInBounds } from './position'

/**
 * 空のグリッドを生成
 */
export function createEmptyGrid(size: GridSize): Cell[][] {
  const grid: Cell[][] = []

  for (let y = 0; y < size.height; y++) {
    const row: Cell[] = []
    for (let x = 0; x < size.width; x++) {
      row.push({
        position: { x, y },
        state: CellState.UNEXPLORED,
        isRevealed: false,
      })
    }
    grid.push(row)
  }

  return grid
}

/**
 * 指定座標のセルを取得
 */
export function getCellAt(
  grid: Cell[][],
  position: Position
): Cell | null {
  if (position.y < 0 || position.y >= grid.length) return null
  if (position.x < 0 || position.x >= grid[0].length) return null

  return grid[position.y][position.x]
}

/**
 * 指定座標のセルを更新
 */
export function updateCellAt(
  grid: Cell[][],
  position: Position,
  updates: Partial<Cell>
): Cell[][] {
  const newGrid = grid.map((row, y) =>
    row.map((cell, x) => {
      if (x === position.x && y === position.y) {
        return { ...cell, ...updates }
      }
      return cell
    })
  )

  return newGrid
}

/**
 * 部隊が占有するセルの座標リストを取得
 */
export function getUnitOccupiedCells(
  unit: Unit,
  basePosition: Position,
  rotation: Rotation
): Position[] {
  const cells: Position[] = []

  // 回転を適用した形状を取得
  const rotatedShape = rotateShape(unit.shape, rotation)

  // 形状の各セルをチェック
  for (let y = 0; y < rotatedShape.length; y++) {
    for (let x = 0; x < rotatedShape[y].length; x++) {
      if (rotatedShape[y][x] === 1) {
        cells.push({
          x: basePosition.x + x,
          y: basePosition.y + y,
        })
      }
    }
  }

  return cells
}

/**
 * 指定位置に部隊を配置できるかチェック
 */
export function canPlaceUnit(
  unit: Unit,
  basePosition: Position,
  rotation: Rotation,
  field: Field
): boolean {
  const occupiedCells = getUnitOccupiedCells(unit, basePosition, rotation)

  // すべてのセルが範囲内か確認
  for (const cell of occupiedCells) {
    if (!isPositionInBounds(cell, field.size)) {
      return false
    }

    // 既に他の部隊が配置されていないか確認
    const gridCell = getCellAt(field.cells, cell)
    if (gridCell?.unitId !== undefined) {
      return false
    }
  }

  return true
}

/**
 * フィールド上の指定エリア内の部隊を取得
 */
export function getUnitsInArea(
  field: Field,
  topLeft: Position,
  bottomRight: Position
): PlacedUnit[] {
  const unitsInArea: PlacedUnit[] = []

  for (const unit of field.placedUnits) {
    // ユニットの占有セルがエリア内にあるかチェック
    const isInArea = unit.occupiedCells.some(
      (pos) =>
        pos.x >= topLeft.x &&
        pos.x <= bottomRight.x &&
        pos.y >= topLeft.y &&
        pos.y <= bottomRight.y
    )

    if (isInArea) {
      unitsInArea.push(unit)
    }
  }

  return unitsInArea
}

/**
 * 部隊をフィールドに配置
 */
export function placeUnitOnField(
  field: Field,
  unit: Unit,
  unitId: string,
  basePosition: Position,
  rotation: Rotation
): Field | null {
  // 配置可能かチェック
  if (!canPlaceUnit(unit, basePosition, rotation, field)) {
    return null
  }

  const occupiedCells = getUnitOccupiedCells(unit, basePosition, rotation)

  // セルにユニットIDを設定
  let newCells = field.cells
  for (const pos of occupiedCells) {
    newCells = updateCellAt(newCells, pos, { unitId })
  }

  // PlacedUnitを作成
  const placedUnit: PlacedUnit = {
    unitId,
    position: basePosition,
    rotation,
    occupiedCells,
    hitCells: [],
    isDestroyed: false,
  }

  return {
    ...field,
    cells: newCells,
    placedUnits: [...field.placedUnits, placedUnit],
  }
}

/**
 * フィールドから部隊を削除
 */
export function removeUnitFromField(
  field: Field,
  unitId: string
): Field {
  const unit = field.placedUnits.find((u) => u.unitId === unitId)
  if (!unit) return field

  // セルからユニットIDを削除
  let newCells = field.cells
  for (const pos of unit.occupiedCells) {
    const cell = getCellAt(newCells, pos)
    if (cell?.unitId === unitId) {
      newCells = updateCellAt(newCells, pos, { unitId: undefined })
    }
  }

  return {
    ...field,
    cells: newCells,
    placedUnits: field.placedUnits.filter((u) => u.unitId !== unitId),
  }
}

/**
 * グリッド内の未探索セル数を取得
 */
export function getUnexploredCellCount(grid: Cell[][]): number {
  let count = 0
  for (const row of grid) {
    for (const cell of row) {
      if (cell.state === CellState.UNEXPLORED) {
        count++
      }
    }
  }
  return count
}

/**
 * グリッド内のユニットが配置されているセル数を取得
 */
export function getOccupiedCellCount(grid: Cell[][]): number {
  let count = 0
  for (const row of grid) {
    for (const cell of row) {
      if (cell.unitId !== undefined) {
        count++
      }
    }
  }
  return count
}

/**
 * グリッドをディープコピー
 */
export function cloneGrid(grid: Cell[][]): Cell[][] {
  return grid.map((row) => row.map((cell) => ({ ...cell })))
}

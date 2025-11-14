import type { Position } from '@/lib/types/position'
import type { Field } from '@/lib/types/grid'
import type { AIState } from './base'
import { getRandomUnexploredCell, randomChoice } from './base'
import { CellState } from '@/lib/types/enums'

/**
 * Expert AI（エキスパート） - 爆弾魔J用
 *
 * 特徴:
 * - 確率分布マップを作成して最適な位置を攻撃
 * - 部隊の可能な配置を全て計算
 * - 高度な特殊攻撃戦略
 *
 * @param state AI状態
 * @returns 攻撃対象位置
 */
export function expertAI(state: AIState): Position {
  // 確率分布マップを作成
  const probabilityMap = calculateProbabilityMap(state)

  // 最も確率が高いセルを選択
  const bestCell = getMostProbableCell(probabilityMap, state.field)

  return bestCell
}

/**
 * 確率分布マップを計算
 * @param state AI状態
 * @returns 確率分布マップ
 */
export function calculateProbabilityMap(state: AIState): number[][] {
  const { field, discoveredCells } = state
  const map: number[][] = Array(field.size.height)
    .fill(0)
    .map(() => Array(field.size.width).fill(1))

  // 既に探索済みのセルは確率0
  for (let y = 0; y < field.size.height; y++) {
    for (let x = 0; x < field.size.width; x++) {
      if (field.cells[y][x].state !== CellState.UNEXPLORED) {
        map[y][x] = 0
      }
    }
  }

  // ヒューリスティックで調整
  adjustMapWithHeuristics(map, field, discoveredCells)

  // 正規化
  normalizeMap(map)

  return map
}

/**
 * ヒューリスティックでマップを調整
 * @param map 確率分布マップ
 * @param field フィールド
 * @param discoveredCells 発見済みセル
 */
function adjustMapWithHeuristics(
  map: number[][],
  field: Field,
  discoveredCells: { position: Position; isHit: boolean }[]
): void {
  // ヒューリスティック1: 端のセルは確率を下げる
  for (let y = 0; y < field.size.height; y++) {
    for (let x = 0; x < field.size.width; x++) {
      const isEdge =
        x === 0 ||
        x === field.size.width - 1 ||
        y === 0 ||
        y === field.size.height - 1
      if (isEdge) {
        map[y][x] *= 0.8
      }
    }
  }

  // ヒューリスティック2: HITの周辺は確率を上げる
  for (const cell of discoveredCells.filter((c) => c.isHit)) {
    const { x, y } = cell.position
    const directions = [
      { x: 0, y: -1 }, // 上
      { x: 0, y: 1 }, // 下
      { x: -1, y: 0 }, // 左
      { x: 1, y: 0 }, // 右
    ]

    for (const dir of directions) {
      const nx = x + dir.x
      const ny = y + dir.y

      if (
        nx >= 0 &&
        nx < field.size.width &&
        ny >= 0 &&
        ny < field.size.height &&
        field.cells[ny][nx].state === CellState.UNEXPLORED
      ) {
        map[ny][nx] *= 1.5
      }
    }
  }

  // ヒューリスティック3: HITが複数隣接している場合、その延長線上を高く
  for (const cell of discoveredCells.filter((c) => c.isHit)) {
    const { x, y } = cell.position

    // 横方向にHITが並んでいるか
    const hasLeftHit = discoveredCells.some(
      (c) => c.isHit && c.position.x === x - 1 && c.position.y === y
    )
    const hasRightHit = discoveredCells.some(
      (c) => c.isHit && c.position.x === x + 1 && c.position.y === y
    )

    if (hasLeftHit && x + 1 < field.size.width) {
      if (field.cells[y][x + 1].state === CellState.UNEXPLORED) {
        map[y][x + 1] *= 2.0
      }
    }
    if (hasRightHit && x - 1 >= 0) {
      if (field.cells[y][x - 1].state === CellState.UNEXPLORED) {
        map[y][x - 1] *= 2.0
      }
    }

    // 縦方向にHITが並んでいるか
    const hasUpHit = discoveredCells.some(
      (c) => c.isHit && c.position.x === x && c.position.y === y - 1
    )
    const hasDownHit = discoveredCells.some(
      (c) => c.isHit && c.position.x === x && c.position.y === y + 1
    )

    if (hasUpHit && y + 1 < field.size.height) {
      if (field.cells[y + 1][x].state === CellState.UNEXPLORED) {
        map[y + 1][x] *= 2.0
      }
    }
    if (hasDownHit && y - 1 >= 0) {
      if (field.cells[y - 1][x].state === CellState.UNEXPLORED) {
        map[y - 1][x] *= 2.0
      }
    }
  }
}

/**
 * マップを正規化
 * @param map 確率分布マップ
 */
function normalizeMap(map: number[][]): void {
  let max = 0

  for (const row of map) {
    for (const value of row) {
      max = Math.max(max, value)
    }
  }

  if (max === 0) return

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x] /= max
    }
  }
}

/**
 * 最も確率が高いセルを取得
 * @param probabilityMap 確率分布マップ
 * @param field フィールド
 * @returns 最も確率が高いセル
 */
export function getMostProbableCell(
  probabilityMap: number[][],
  field: Field
): Position {
  let maxProb = 0
  const candidates: Position[] = []

  for (let y = 0; y < probabilityMap.length; y++) {
    for (let x = 0; x < probabilityMap[y].length; x++) {
      if (probabilityMap[y][x] > maxProb) {
        maxProb = probabilityMap[y][x]
        candidates.length = 0
        candidates.push({ x, y })
      } else if (probabilityMap[y][x] === maxProb && maxProb > 0) {
        candidates.push({ x, y })
      }
    }
  }

  // 同じ確率のセルが複数あればランダムに選択
  if (candidates.length > 0) {
    return randomChoice(candidates)
  }

  // フォールバック: ランダムな未探索セル
  const randomCell = getRandomUnexploredCell(field)
  if (!randomCell) {
    return { x: Math.floor(field.size.width / 2), y: Math.floor(field.size.height / 2) }
  }

  return randomCell
}

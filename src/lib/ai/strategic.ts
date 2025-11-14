import type { Position } from '@/lib/types/position'
import type { Field } from '@/lib/types/grid'
import type { AIState, DiscoveredCell } from './base'
import { getRandomUnexploredCell } from './base'
import { CellState } from '@/lib/types/enums'
import { isPositionInBounds } from '@/lib/utils/position'

/**
 * Strategic AI（戦略型） - Z大佐用
 *
 * 特徴:
 * - 部隊の形を推測して破壊
 * - パターンサーチを実行（チェス盤状など）
 * - 効果的なタイミングで特殊攻撃を使用
 *
 * @param state AI状態
 * @returns 攻撃対象位置
 */
export function strategicAI(state: AIState): Position {
  const { lastHitPosition, discoveredCells, field } = state

  // 部隊発見時は形状推測
  if (lastHitPosition) {
    const predictedCells = predictUnitShape(lastHitPosition, discoveredCells, field)
    if (predictedCells.length > 0) {
      // 最も可能性の高いセルを攻撃
      return predictedCells[0]
    }
  }

  // パターンサーチ（チェス盤状）
  return getNextPatternCell(state)
}

/**
 * 部隊の形状を推測
 * @param hitPosition HIT位置
 * @param discoveredCells 発見済みセル
 * @param field フィールド
 * @returns 予測されるセルの配列（スコア順）
 */
export function predictUnitShape(
  hitPosition: Position,
  discoveredCells: DiscoveredCell[],
  field: Field
): Position[] {
  const candidates: { position: Position; score: number }[] = []
  const directions = [
    { x: 0, y: -1 }, // 上
    { x: 0, y: 1 }, // 下
    { x: -1, y: 0 }, // 左
    { x: 1, y: 0 }, // 右
  ]

  // 隣接する未探索セルをスコアリング
  for (const dir of directions) {
    const pos = {
      x: hitPosition.x + dir.x,
      y: hitPosition.y + dir.y,
    }

    if (
      isPositionInBounds(pos, field.size) &&
      field.cells[pos.y][pos.x].state === CellState.UNEXPLORED
    ) {
      // その方向に既にHITがあればスコアが高い
      const score = calculateDirectionScore(pos, dir, discoveredCells)
      candidates.push({ position: pos, score })
    }
  }

  // スコア順にソート
  candidates.sort((a, b) => b.score - a.score)
  return candidates.map((c) => c.position)
}

/**
 * 方向のスコアを計算
 * @param position 評価位置
 * @param direction 方向
 * @param discoveredCells 発見済みセル
 * @returns スコア
 */
function calculateDirectionScore(
  position: Position,
  direction: { x: number; y: number },
  discoveredCells: DiscoveredCell[]
): number {
  let score = 1

  // その方向の延長線上にHITがあればスコアを増やす
  const extendedPos = {
    x: position.x + direction.x,
    y: position.y + direction.y,
  }

  const hasHitInDirection = discoveredCells.some(
    (cell) =>
      cell.isHit &&
      cell.position.x === extendedPos.x &&
      cell.position.y === extendedPos.y
  )

  if (hasHitInDirection) {
    score += 2
  }

  return score
}

/**
 * パターンサーチの次のセルを取得
 * @param state AI状態
 * @returns 次の攻撃位置
 */
export function getNextPatternCell(state: AIState): Position {
  const { field, patternIndex } = state
  const pattern = getCheckerboardPattern(field.size)

  // パターンの次の未探索セルを探す
  for (let i = patternIndex; i < pattern.length; i++) {
    const pos = pattern[i]
    if (field.cells[pos.y][pos.x].state === CellState.UNEXPLORED) {
      state.patternIndex = i + 1
      return pos
    }
  }

  // パターンが尽きたらランダム
  const randomCell = getRandomUnexploredCell(field)
  if (!randomCell) {
    // 未探索セルがない場合は中央を返す（フォールバック）
    return { x: Math.floor(field.size.width / 2), y: Math.floor(field.size.height / 2) }
  }

  return randomCell
}

/**
 * チェス盤状のパターンを生成
 * @param size グリッドサイズ
 * @returns パターン配列
 */
export function getCheckerboardPattern(size: { width: number; height: number }): Position[] {
  const pattern: Position[] = []

  for (let y = 0; y < size.height; y++) {
    for (let x = 0; x < size.width; x++) {
      // チェス盤状に配置（(x + y) % 2 === 0）
      if ((x + y) % 2 === 0) {
        pattern.push({ x, y })
      }
    }
  }

  return pattern
}

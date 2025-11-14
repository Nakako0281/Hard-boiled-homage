import type { Position } from '@/lib/types/position'
import type { AIState } from './base'
import { getRandomUnexploredCell, getAdjacentUnexploredCells, randomChoice } from './base'

/**
 * Balanced AI（バランス型） - 運び屋A用
 *
 * 特徴:
 * - 基本的なルールに従う
 * - 部隊発見時は追跡するが、完璧ではない（50%の確率）
 * - 特殊攻撃はあまり使わない
 *
 * @param state AI状態
 * @returns 攻撃対象位置
 */
export function balancedAI(state: AIState): Position {
  const { lastHitPosition, field } = state

  // 前回HITした場所がある場合、50%の確率で周辺探索
  if (lastHitPosition && Math.random() < 0.5) {
    const adjacentCells = getAdjacentUnexploredCells(lastHitPosition, field)
    if (adjacentCells.length > 0) {
      return randomChoice(adjacentCells)
    }
  }

  // それ以外はランダム攻撃
  const randomCell = getRandomUnexploredCell(field)
  if (!randomCell) {
    // 未探索セルがない場合は中央を返す（フォールバック）
    return { x: Math.floor(field.size.width / 2), y: Math.floor(field.size.height / 2) }
  }

  return randomCell
}

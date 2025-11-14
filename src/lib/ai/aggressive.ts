import type { Position } from '@/lib/types/position'
import type { AIState } from './base'
import { getRandomUnexploredCell, getAdjacentUnexploredCells, randomChoice } from './base'

/**
 * Aggressive AI（攻撃型） - 狂人B用
 *
 * 特徴:
 * - HP削りを優先（部隊破壊よりも直接ダメージ）
 * - 部隊発見時も30%の確率でランダム攻撃（HP狙い）
 * - 特殊攻撃を積極的に使用
 *
 * @param state AI状態
 * @returns 攻撃対象位置
 */
export function aggressiveAI(state: AIState): Position {
  const { lastHitPosition, field } = state

  // 部隊発見時も30%の確率でHP狙い
  if (lastHitPosition && Math.random() < 0.7) {
    // 部隊破壊を続行（70%の確率）
    const adjacentCells = getAdjacentUnexploredCells(lastHitPosition, field)
    if (adjacentCells.length > 0) {
      return randomChoice(adjacentCells)
    }
  }

  // HP削りを優先（ランダム攻撃）
  const randomCell = getRandomUnexploredCell(field)
  if (!randomCell) {
    // 未探索セルがない場合は中央を返す（フォールバック）
    return { x: Math.floor(field.size.width / 2), y: Math.floor(field.size.height / 2) }
  }

  return randomCell
}

/**
 * 特殊攻撃を使用するか判定（Aggressive AI用）
 * @param state AI状態
 * @returns 使用する場合true
 */
export function shouldUseSpecialAttack_Aggressive(state: AIState): boolean {
  // SPが60%以上あり、相手HPが80%以下なら40%の確率で使用
  if (state.currentSP < state.maxSP * 0.6) return false
  if (state.enemyHP > state.enemyMaxHP * 0.8) return false

  return Math.random() < 0.4
}

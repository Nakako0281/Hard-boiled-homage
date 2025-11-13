import type { BattleState } from '@/lib/types/battle'
import type { Field } from '@/lib/types/grid'
import { BattlePhase, Turn } from '@/lib/types/enums'

/**
 * 勝敗判定結果
 */
export interface VictoryResult {
  isGameOver: boolean
  winner: Turn | null
  reason: VictoryReason | null
}

/**
 * 勝敗理由
 */
export enum VictoryReason {
  ALL_UNITS_DESTROYED = 'all_units_destroyed', // 全部隊破壊
  HP_ZERO = 'hp_zero', // HP0
}

/**
 * 勝敗判定を行う
 * @param state 戦闘状態
 * @returns 勝敗判定結果
 */
export function checkVictory(state: BattleState): VictoryResult {
  // フェーズがBATTLEでない場合は判定しない
  if (state.phase !== BattlePhase.BATTLE) {
    return { isGameOver: false, winner: null, reason: null }
  }

  // プレイヤーのHP0チェック（敗北）
  if (state.playerStats.HP <= 0) {
    return {
      isGameOver: true,
      winner: Turn.ENEMY,
      reason: VictoryReason.HP_ZERO,
    }
  }

  // 敵のHP0チェック（勝利）
  if (state.enemyStats.HP <= 0) {
    return {
      isGameOver: true,
      winner: Turn.PLAYER,
      reason: VictoryReason.HP_ZERO,
    }
  }

  // プレイヤーの全部隊破壊チェック（敗北）
  if (areAllUnitsDestroyed(state.playerField)) {
    return {
      isGameOver: true,
      winner: Turn.ENEMY,
      reason: VictoryReason.ALL_UNITS_DESTROYED,
    }
  }

  // 敵の全部隊破壊チェック（勝利）
  if (areAllUnitsDestroyed(state.enemyField)) {
    return {
      isGameOver: true,
      winner: Turn.PLAYER,
      reason: VictoryReason.ALL_UNITS_DESTROYED,
    }
  }

  // 勝敗条件を満たしていない
  return { isGameOver: false, winner: null, reason: null }
}

/**
 * フィールド内の全部隊が破壊されているかチェック
 * @param field フィールド
 * @returns 全部隊破壊済みならtrue
 */
export function areAllUnitsDestroyed(field: Field): boolean {
  // 配置されている部隊がない場合はfalse（配置フェーズ等）
  if (field.placedUnits.length === 0) {
    return false
  }

  // 地雷以外の部隊をチェック
  const nonMineUnits = field.placedUnits.filter((u) => u.unitId !== 'mine')

  // 地雷以外の部隊がない場合はtrue（地雷のみ残っている状態）
  if (nonMineUnits.length === 0) {
    return true
  }

  // 地雷以外の部隊が全て破壊されているかチェック
  return nonMineUnits.every((u) => u.isDestroyed)
}

/**
 * 勝敗判定後のフェーズ遷移を実行
 * @param state 戦闘状態
 * @param result 勝敗判定結果
 */
export function applyVictoryResult(
  state: BattleState,
  result: VictoryResult
): void {
  if (!result.isGameOver) {
    return
  }

  // フェーズをRESULT（結果）に遷移
  state.phase = BattlePhase.RESULT
}

/**
 * 勝利条件を満たしているかチェック（プレイヤー視点）
 * @param state 戦闘状態
 * @returns プレイヤーが勝利していればtrue
 */
export function isPlayerVictory(state: BattleState): boolean {
  const result = checkVictory(state)
  return result.isGameOver && result.winner === Turn.PLAYER
}

/**
 * 敗北条件を満たしているかチェック（プレイヤー視点）
 * @param state 戦闘状態
 * @returns プレイヤーが敗北していればtrue
 */
export function isPlayerDefeat(state: BattleState): boolean {
  const result = checkVictory(state)
  return result.isGameOver && result.winner === Turn.ENEMY
}

/**
 * 勝敗理由のメッセージを取得
 * @param reason 勝敗理由
 * @param winner 勝者
 * @returns メッセージ文字列
 */
export function getVictoryMessage(
  reason: VictoryReason,
  winner: Turn
): string {
  const isPlayerWinner = winner === Turn.PLAYER

  switch (reason) {
    case VictoryReason.ALL_UNITS_DESTROYED:
      return isPlayerWinner
        ? '敵の全部隊を撃破しました！'
        : '自軍の全部隊が撃破されました...'

    case VictoryReason.HP_ZERO:
      return isPlayerWinner ? '敵のHPが0になりました！' : 'HPが0になりました...'

    default:
      return isPlayerWinner ? '勝利！' : '敗北...'
  }
}

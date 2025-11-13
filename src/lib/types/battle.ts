import { BattlePhase, Turn, SpecialAttackType } from './enums'
import type { Field } from './grid'
import type { PlayerStats, EnemyStats } from './stats'
import type { Enemy } from './enemy'
import type { Position } from './position'

/**
 * 攻撃ログ
 */
export interface AttackLog {
  turn: Turn // どちらのターンか
  position: Position // 攻撃位置
  result: 'hit' | 'miss' // 結果
  damage?: number // ダメージ量
  destroyedUnitId?: string // 破壊した部隊ID（あれば）
  isSpecialAttack: boolean // 特殊攻撃かどうか
  specialAttackName?: string // 特殊攻撃名
  timestamp: number // タイムスタンプ
}

/**
 * 戦闘状態
 */
export interface BattleState {
  phase: BattlePhase // 現在のフェーズ
  turn: Turn // 現在のターン

  // フィールド
  playerField: Field // プレイヤーフィールド
  enemyField: Field // 敵フィールド

  // 戦闘中のステータス
  playerStats: PlayerStats // プレイヤーの現在ステータス
  enemyStats: EnemyStats // 敵の現在ステータス

  // 戦闘情報
  enemy: Enemy // 対戦中の敵
  attackHistory: AttackLog[] // 攻撃履歴

  // 連続攻撃制御
  canContinueAttack: boolean // 連続攻撃可能か
  consecutiveHits: number // 連続HIT数

  // 特殊攻撃状態
  activeSpecialAttack?: {
    type: SpecialAttackType | null
    startTime?: number // 開始時刻（無差別攻撃用）
    endTime?: number // 終了時刻（無差別攻撃用）
    remainingAttacks?: number // 残り攻撃回数（集中砲火用）
  }

  // 特殊攻撃使用回数（ガプリーノ専用の増加系SP消費用）
  specialAttackUsageCount: {
    player: { [unitId: string]: number } // プレイヤーの各部隊の使用回数
    enemy: { [unitId: string]: number } // 敵の各部隊の使用回数
  }
}

/**
 * 戦闘結果
 */
export interface BattleResult {
  isVictory: boolean // 勝利したかどうか

  // 戦闘統計
  totalDamageDealt: number // 与えたダメージ
  totalDamageReceived: number // 受けたダメージ
  unitsDestroyed: number // 破壊した部隊数
  unitsLost: number // 失った部隊数

  // 報酬計算
  baseReward: number // 基本賞金
  hpBonus: number // HP残存ボーナス
  unitsBonus: number // 部隊残存ボーナス
  totalReward: number // 最終獲得賞金

  // 経験値計算
  baseExp: number // 基本経験値
  occupancyBonus: number // 占有率ボーナス
  passengerBonus: boolean // 旅客機ボーナス適用
  totalExp: number // 最終獲得経験値

  // 残存情報
  remainingHP: number // 残存HP
  remainingUnits: number // 残存部隊数
}

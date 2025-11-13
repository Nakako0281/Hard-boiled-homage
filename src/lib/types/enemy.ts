import { EnemyId, AIType } from './enums'
import type { EnemyStats } from './stats'
import type { PlacedUnit } from './unit'
import type { Position } from './position'

/**
 * 敵マスターデータ
 */
export interface Enemy {
  id: EnemyId // 敵ID
  name: string // 表示名
  stats: EnemyStats // 初期ステータス（maxHP, maxSP含む）
  units: string[] // 所持部隊IDの配列
  aiType: AIType // AIタイプ
  baseReward: number // 基本賞金
  description: string // 説明文
  difficulty: 'easy' | 'medium' | 'hard' | 'nightmare' // 難易度
}

/**
 * 敵の状態
 */
export interface EnemyState {
  enemy: Enemy // 敵マスターデータ
  currentStats: EnemyStats // 現在のステータス
  placedUnits: PlacedUnit[] // 配置済み部隊
  lastHitPosition?: Position // 最後にHITした位置（AI用）
  discoveredCells: Position[] // 発見済みセル（AI用）
}

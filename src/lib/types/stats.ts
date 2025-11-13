import { StatType } from './enums'

/**
 * プレイヤーステータス
 */
export interface PlayerStats {
  HP: number // 現在HP
  maxHP: number // 最大HP
  SP: number // 現在SP
  maxSP: number // 最大SP
  AT: number // 攻撃力
  DF: number // 防御力
  AR: number // エリアレベル（グリッドサイズに影響）
}

/**
 * プレイヤー最大ステータス
 */
export interface PlayerMaxStats {
  maxHP: number // 最大HP（レベルアップで増加する基準値）
  maxSP: number // 最大SP（レベルアップで増加する基準値）
  maxAR: number // 最大ARレベル（11）
}

/**
 * レベル情報
 */
export interface PlayerLevel {
  [StatType.HP]: number // HPレベル
  [StatType.SP]: number // SPレベル
  [StatType.AT]: number // ATレベル
  [StatType.DF]: number // DFレベル
  [StatType.AR]: number // ARレベル
}

/**
 * 敵ステータス
 */
export interface EnemyStats {
  HP: number // 現在HP
  maxHP: number // 最大HP
  SP: number // 現在SP
  maxSP: number // 最大SP
  AT: number // 攻撃力
  DF: number // 防御力
  AR: number // エリアレベル
}

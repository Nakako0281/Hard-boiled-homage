import { CharacterType } from './enums'
import type { PlayerStats, PlayerMaxStats, PlayerLevel } from './stats'
import type { PlacedUnit } from './unit'

/**
 * プレイヤーデータ
 */
export interface Player {
  character: CharacterType // 選択キャラクター
  stats: PlayerStats // 現在ステータス
  maxStats: PlayerMaxStats // 最大ステータス
  levels: PlayerLevel // 各ステータスのレベル
  money: number // 所持金
  exp: number // 経験値
  ownedUnits: string[] // 所持部隊IDの配列
  placedUnits: PlacedUnit[] // 配置済み部隊（戦闘中のみ使用）
}

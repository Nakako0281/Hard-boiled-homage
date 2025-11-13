import { CharacterType, EnemyId } from './enums'
import type { PlayerStats, PlayerMaxStats, PlayerLevel } from './stats'

/**
 * ゲーム進行状況
 */
export interface GameProgress {
  defeatedEnemies: EnemyId[] // 倒した敵のIDリスト
  currentEnemy?: EnemyId // 現在対戦中の敵（null = 敵選択画面）
  totalBattles: number // 総戦闘回数
  totalVictories: number // 総勝利回数
  totalDefeats: number // 総敗北回数
}

/**
 * セーブデータ
 */
export interface SaveData {
  version: string // セーブデータバージョン
  lastSaved: string // 最終保存日時（ISO形式）

  player: {
    character: CharacterType
    stats: PlayerStats
    maxStats: PlayerMaxStats
    levels: PlayerLevel
    money: number
    exp: number
    ownedUnits: string[]
  }

  progress: GameProgress

  // オプション設定（将来の拡張用）
  settings?: {
    soundVolume: number
    musicVolume: number
  }
}

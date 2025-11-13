import type { Position } from './position'
import { CellState } from './enums'

/**
 * グリッドセルを表すインターフェース
 */
export interface Cell {
  position: Position // セル座標
  state: CellState // セルの状態
  unitId?: string // 配置されている部隊ID（あれば）
  isRevealed: boolean // 公開されているか（敵フィールドは基本false）
}

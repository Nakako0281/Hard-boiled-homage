import type { GridSize } from './position'
import type { Cell } from './cell'
import type { PlacedUnit } from './unit'

/**
 * フィールド（グリッド）を表すインターフェース
 */
export interface Field {
  size: GridSize // フィールドサイズ
  cells: Cell[][] // 2次元配列のセル
  placedUnits: PlacedUnit[] // 配置済み部隊リスト
}

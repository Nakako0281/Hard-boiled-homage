/**
 * 座標を表すインターフェース
 */
export interface Position {
  x: number // 横座標（0始まり）
  y: number // 縦座標（0始まり）
}

/**
 * グリッドサイズを表すインターフェース
 */
export interface GridSize {
  width: number // 横幅（マス数）
  height: number // 縦幅（マス数）
}

/**
 * ダメージ情報を表すインターフェース
 */
export interface Damage {
  amount: number // ダメージ量
  isCritical: boolean // クリティカルかどうか（将来の拡張用）
  source: 'direct' | 'special' | 'counter' // ダメージソース
}

import type { Position, GridSize } from '@/lib/types/position'
import { Rotation } from '@/lib/types/enums'

/**
 * 2つの位置が等しいかを判定
 */
export function isPositionEqual(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y
}

/**
 * 位置がグリッドの範囲内かを判定
 */
export function isPositionInBounds(
  position: Position,
  gridSize: GridSize
): boolean {
  return (
    position.x >= 0 &&
    position.x < gridSize.width &&
    position.y >= 0 &&
    position.y < gridSize.height
  )
}

/**
 * 指定位置の隣接位置を取得（上下左右のみ）
 */
export function getAdjacentPositions(
  position: Position,
  gridSize: GridSize
): Position[] {
  const adjacents: Position[] = [
    { x: position.x, y: position.y - 1 }, // 上
    { x: position.x + 1, y: position.y }, // 右
    { x: position.x, y: position.y + 1 }, // 下
    { x: position.x - 1, y: position.y }, // 左
  ]

  return adjacents.filter((pos) => isPositionInBounds(pos, gridSize))
}

/**
 * 2つの位置間のマンハッタン距離を計算
 */
export function getDistanceBetween(pos1: Position, pos2: Position): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y)
}

/**
 * ユークリッド距離を計算
 */
export function getEuclideanDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 位置を回転させる
 * @param position 元の位置（ユニットの左上を基準）
 * @param rotation 回転角度
 * @param unitSize ユニットのサイズ
 * @returns 回転後の位置
 */
export function rotatePosition(
  position: Position,
  rotation: Rotation,
  unitSize: { width: number; height: number }
): Position {
  switch (rotation) {
    case Rotation.DEG_0:
      return position

    case Rotation.DEG_90:
      // 90度回転: (x, y) -> (y, width - 1 - x)
      return {
        x: position.y,
        y: unitSize.width - 1 - position.x,
      }

    case Rotation.DEG_180:
      // 180度回転: (x, y) -> (width - 1 - x, height - 1 - y)
      return {
        x: unitSize.width - 1 - position.x,
        y: unitSize.height - 1 - position.y,
      }

    case Rotation.DEG_270:
      // 270度回転: (x, y) -> (height - 1 - y, x)
      return {
        x: unitSize.height - 1 - position.y,
        y: position.x,
      }

    default:
      return position
  }
}

/**
 * ユニットの形状を回転させる
 * @param shape 元の形状（2次元配列）
 * @param rotation 回転角度
 * @returns 回転後の形状
 */
export function rotateShape(
  shape: number[][],
  rotation: Rotation
): number[][] {
  switch (rotation) {
    case Rotation.DEG_0:
      return shape

    case Rotation.DEG_90: {
      // 90度回転: 時計回りに90度回転
      const height = shape.length
      const width = shape[0].length
      const rotated: number[][] = Array.from({ length: width }, () =>
        Array(height).fill(0)
      )

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          rotated[x][height - 1 - y] = shape[y][x]
        }
      }
      return rotated
    }

    case Rotation.DEG_180: {
      // 180度回転
      return shape.map((row) => [...row].reverse()).reverse()
    }

    case Rotation.DEG_270: {
      // 270度回転: 時計回りに270度回転（反時計回りに90度）
      const height = shape.length
      const width = shape[0].length
      const rotated: number[][] = Array.from({ length: width }, () =>
        Array(height).fill(0)
      )

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          rotated[width - 1 - x][y] = shape[y][x]
        }
      }
      return rotated
    }

    default:
      return shape
  }
}

/**
 * 回転後のユニットサイズを取得
 */
export function getRotatedSize(
  size: { width: number; height: number },
  rotation: Rotation
): { width: number; height: number } {
  if (rotation === Rotation.DEG_90 || rotation === Rotation.DEG_270) {
    return { width: size.height, height: size.width }
  }
  return size
}

/**
 * 位置が指定範囲内にあるかを判定
 */
export function isPositionInArea(
  position: Position,
  topLeft: Position,
  bottomRight: Position
): boolean {
  return (
    position.x >= topLeft.x &&
    position.x <= bottomRight.x &&
    position.y >= topLeft.y &&
    position.y <= bottomRight.y
  )
}

/**
 * 位置の配列をソート（Y座標優先、次にX座標）
 */
export function sortPositions(positions: Position[]): Position[] {
  return [...positions].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y
    return a.x - b.x
  })
}

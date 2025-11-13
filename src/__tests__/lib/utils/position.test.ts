import { describe, it, expect } from 'vitest'
import {
  isPositionEqual,
  isPositionInBounds,
  getAdjacentPositions,
  getDistanceBetween,
  getEuclideanDistance,
  rotatePosition,
  rotateShape,
  getRotatedSize,
  isPositionInArea,
  sortPositions,
} from '@/lib/utils/position'
import { Rotation } from '@/lib/types/enums'
import type { Position, GridSize } from '@/lib/types/position'

describe('position utilities', () => {
  describe('isPositionEqual', () => {
    it('同じ位置の場合はtrueを返す', () => {
      const pos1: Position = { x: 3, y: 5 }
      const pos2: Position = { x: 3, y: 5 }

      expect(isPositionEqual(pos1, pos2)).toBe(true)
    })

    it('異なる位置の場合はfalseを返す', () => {
      const pos1: Position = { x: 3, y: 5 }
      const pos2: Position = { x: 3, y: 6 }

      expect(isPositionEqual(pos1, pos2)).toBe(false)
    })

    it('原点での判定', () => {
      const pos1: Position = { x: 0, y: 0 }
      const pos2: Position = { x: 0, y: 0 }

      expect(isPositionEqual(pos1, pos2)).toBe(true)
    })
  })

  describe('isPositionInBounds', () => {
    const gridSize: GridSize = { width: 7, height: 7 }

    it('範囲内の位置の場合はtrueを返す', () => {
      expect(isPositionInBounds({ x: 0, y: 0 }, gridSize)).toBe(true)
      expect(isPositionInBounds({ x: 3, y: 3 }, gridSize)).toBe(true)
      expect(isPositionInBounds({ x: 6, y: 6 }, gridSize)).toBe(true)
    })

    it('範囲外の位置の場合はfalseを返す', () => {
      expect(isPositionInBounds({ x: -1, y: 0 }, gridSize)).toBe(false)
      expect(isPositionInBounds({ x: 0, y: -1 }, gridSize)).toBe(false)
      expect(isPositionInBounds({ x: 7, y: 0 }, gridSize)).toBe(false)
      expect(isPositionInBounds({ x: 0, y: 7 }, gridSize)).toBe(false)
      expect(isPositionInBounds({ x: 10, y: 10 }, gridSize)).toBe(false)
    })
  })

  describe('getAdjacentPositions', () => {
    const gridSize: GridSize = { width: 5, height: 5 }

    it('中央の位置では4つの隣接位置を返す', () => {
      const position: Position = { x: 2, y: 2 }
      const adjacents = getAdjacentPositions(position, gridSize)

      expect(adjacents).toHaveLength(4)
      expect(adjacents).toContainEqual({ x: 2, y: 1 }) // 上
      expect(adjacents).toContainEqual({ x: 3, y: 2 }) // 右
      expect(adjacents).toContainEqual({ x: 2, y: 3 }) // 下
      expect(adjacents).toContainEqual({ x: 1, y: 2 }) // 左
    })

    it('左上隅では2つの隣接位置を返す', () => {
      const position: Position = { x: 0, y: 0 }
      const adjacents = getAdjacentPositions(position, gridSize)

      expect(adjacents).toHaveLength(2)
      expect(adjacents).toContainEqual({ x: 1, y: 0 }) // 右
      expect(adjacents).toContainEqual({ x: 0, y: 1 }) // 下
    })

    it('右下隅では2つの隣接位置を返す', () => {
      const position: Position = { x: 4, y: 4 }
      const adjacents = getAdjacentPositions(position, gridSize)

      expect(adjacents).toHaveLength(2)
      expect(adjacents).toContainEqual({ x: 4, y: 3 }) // 上
      expect(adjacents).toContainEqual({ x: 3, y: 4 }) // 左
    })

    it('上辺では3つの隣接位置を返す', () => {
      const position: Position = { x: 2, y: 0 }
      const adjacents = getAdjacentPositions(position, gridSize)

      expect(adjacents).toHaveLength(3)
      expect(adjacents).toContainEqual({ x: 3, y: 0 }) // 右
      expect(adjacents).toContainEqual({ x: 2, y: 1 }) // 下
      expect(adjacents).toContainEqual({ x: 1, y: 0 }) // 左
    })
  })

  describe('getDistanceBetween', () => {
    it('マンハッタン距離を計算する', () => {
      const pos1: Position = { x: 0, y: 0 }
      const pos2: Position = { x: 3, y: 4 }

      expect(getDistanceBetween(pos1, pos2)).toBe(7) // 3 + 4 = 7
    })

    it('同じ位置の距離は0', () => {
      const pos: Position = { x: 2, y: 3 }

      expect(getDistanceBetween(pos, pos)).toBe(0)
    })

    it('隣接位置の距離は1', () => {
      const pos1: Position = { x: 2, y: 2 }
      const pos2: Position = { x: 2, y: 3 }

      expect(getDistanceBetween(pos1, pos2)).toBe(1)
    })

    it('負の座標でも正しく計算', () => {
      const pos1: Position = { x: -2, y: -3 }
      const pos2: Position = { x: 1, y: 2 }

      expect(getDistanceBetween(pos1, pos2)).toBe(8) // 3 + 5 = 8
    })
  })

  describe('getEuclideanDistance', () => {
    it('ユークリッド距離を計算する', () => {
      const pos1: Position = { x: 0, y: 0 }
      const pos2: Position = { x: 3, y: 4 }

      expect(getEuclideanDistance(pos1, pos2)).toBe(5) // √(3² + 4²) = 5
    })

    it('同じ位置の距離は0', () => {
      const pos: Position = { x: 2, y: 3 }

      expect(getEuclideanDistance(pos, pos)).toBe(0)
    })
  })

  describe('rotatePosition', () => {
    const unitSize = { width: 3, height: 2 }

    it('0度回転では元の位置を返す', () => {
      const position: Position = { x: 1, y: 0 }
      const rotated = rotatePosition(position, Rotation.DEG_0, unitSize)

      expect(rotated).toEqual({ x: 1, y: 0 })
    })

    it('90度回転で正しく変換', () => {
      const position: Position = { x: 1, y: 0 }
      const rotated = rotatePosition(position, Rotation.DEG_90, unitSize)

      // (1, 0) -> (0, 1)
      expect(rotated).toEqual({ x: 0, y: 1 })
    })

    it('180度回転で正しく変換', () => {
      const position: Position = { x: 1, y: 0 }
      const rotated = rotatePosition(position, Rotation.DEG_180, unitSize)

      // (1, 0) -> (1, 1)
      expect(rotated).toEqual({ x: 1, y: 1 })
    })

    it('270度回転で正しく変換', () => {
      const position: Position = { x: 1, y: 0 }
      const rotated = rotatePosition(position, Rotation.DEG_270, unitSize)

      // (1, 0) -> (1, 1)
      expect(rotated).toEqual({ x: 1, y: 1 })
    })
  })

  describe('rotateShape', () => {
    it('0度回転では元の形状を返す', () => {
      const shape = [
        [1, 1, 0],
        [0, 1, 0],
      ]

      const rotated = rotateShape(shape, Rotation.DEG_0)
      expect(rotated).toEqual(shape)
    })

    it('90度回転で形状を正しく変換', () => {
      const shape = [
        [1, 1, 0],
        [0, 1, 0],
      ]

      const expected = [
        [0, 1],
        [1, 1],
        [0, 0],
      ]

      const rotated = rotateShape(shape, Rotation.DEG_90)
      expect(rotated).toEqual(expected)
    })

    it('180度回転で形状を正しく変換', () => {
      const shape = [
        [1, 1, 0],
        [0, 1, 0],
      ]

      const expected = [
        [0, 1, 0],
        [0, 1, 1],
      ]

      const rotated = rotateShape(shape, Rotation.DEG_180)
      expect(rotated).toEqual(expected)
    })

    it('270度回転で形状を正しく変換', () => {
      const shape = [
        [1, 1, 0],
        [0, 1, 0],
      ]

      const expected = [
        [0, 0],
        [1, 1],
        [1, 0],
      ]

      const rotated = rotateShape(shape, Rotation.DEG_270)
      expect(rotated).toEqual(expected)
    })
  })

  describe('getRotatedSize', () => {
    it('0度回転ではサイズが変わらない', () => {
      const size = { width: 3, height: 2 }
      const rotated = getRotatedSize(size, Rotation.DEG_0)

      expect(rotated).toEqual({ width: 3, height: 2 })
    })

    it('90度回転で幅と高さが入れ替わる', () => {
      const size = { width: 3, height: 2 }
      const rotated = getRotatedSize(size, Rotation.DEG_90)

      expect(rotated).toEqual({ width: 2, height: 3 })
    })

    it('180度回転ではサイズが変わらない', () => {
      const size = { width: 3, height: 2 }
      const rotated = getRotatedSize(size, Rotation.DEG_180)

      expect(rotated).toEqual({ width: 3, height: 2 })
    })

    it('270度回転で幅と高さが入れ替わる', () => {
      const size = { width: 3, height: 2 }
      const rotated = getRotatedSize(size, Rotation.DEG_270)

      expect(rotated).toEqual({ width: 2, height: 3 })
    })
  })

  describe('isPositionInArea', () => {
    it('範囲内の位置の場合はtrueを返す', () => {
      const topLeft: Position = { x: 1, y: 1 }
      const bottomRight: Position = { x: 4, y: 4 }

      expect(isPositionInArea({ x: 2, y: 2 }, topLeft, bottomRight)).toBe(true)
      expect(isPositionInArea({ x: 1, y: 1 }, topLeft, bottomRight)).toBe(true)
      expect(isPositionInArea({ x: 4, y: 4 }, topLeft, bottomRight)).toBe(true)
    })

    it('範囲外の位置の場合はfalseを返す', () => {
      const topLeft: Position = { x: 1, y: 1 }
      const bottomRight: Position = { x: 4, y: 4 }

      expect(isPositionInArea({ x: 0, y: 2 }, topLeft, bottomRight)).toBe(
        false
      )
      expect(isPositionInArea({ x: 5, y: 2 }, topLeft, bottomRight)).toBe(
        false
      )
      expect(isPositionInArea({ x: 2, y: 0 }, topLeft, bottomRight)).toBe(
        false
      )
      expect(isPositionInArea({ x: 2, y: 5 }, topLeft, bottomRight)).toBe(
        false
      )
    })
  })

  describe('sortPositions', () => {
    it('Y座標優先でソート', () => {
      const positions: Position[] = [
        { x: 2, y: 3 },
        { x: 1, y: 1 },
        { x: 3, y: 2 },
        { x: 0, y: 1 },
      ]

      const sorted = sortPositions(positions)

      expect(sorted).toEqual([
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 3, y: 2 },
        { x: 2, y: 3 },
      ])
    })

    it('空配列をソート', () => {
      const positions: Position[] = []
      const sorted = sortPositions(positions)

      expect(sorted).toEqual([])
    })

    it('元の配列を変更しない', () => {
      const positions: Position[] = [
        { x: 2, y: 1 },
        { x: 1, y: 2 },
      ]
      const original = [...positions]

      sortPositions(positions)

      expect(positions).toEqual(original)
    })
  })
})

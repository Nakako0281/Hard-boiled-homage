import { describe, it, expect, beforeEach } from 'vitest'
import {
  strategicAI,
  predictUnitShape,
  getNextPatternCell,
  getCheckerboardPattern,
} from '@/lib/ai/strategic'
import type { AIState } from '@/lib/ai/base'
import { CellState } from '@/lib/types/enums'
import type { Field } from '@/lib/types/grid'

describe('Strategic AI', () => {
  let mockField: Field
  let baseState: AIState

  beforeEach(() => {
    mockField = {
      size: { width: 10, height: 10 },
      cells: Array(10)
        .fill(null)
        .map((_, y) =>
          Array(10)
            .fill(null)
            .map((_, x) => ({
              position: { x, y },
              state: CellState.UNEXPLORED,
              hasUnit: false,
            }))
        ),
    }

    baseState = {
      field: mockField,
      discoveredCells: [],
      lastHitPosition: null,
      currentSP: 100,
      maxSP: 100,
      enemyHP: 100,
      enemyMaxHP: 100,
      patternIndex: 0,
    }
  })

  describe('strategicAI', () => {
    it('lastHitPositionがある場合、形状推測を行う', () => {
      const hitPosition = { x: 5, y: 5 }
      const stateWithHit = {
        ...baseState,
        lastHitPosition: hitPosition,
        discoveredCells: [{ position: hitPosition, isHit: true }],
      }

      const result = strategicAI(stateWithHit)

      expect(result.x).toBeGreaterThanOrEqual(0)
      expect(result.x).toBeLessThan(10)
      expect(result.y).toBeGreaterThanOrEqual(0)
      expect(result.y).toBeLessThan(10)
    })

    it('lastHitPositionがない場合、パターンサーチを実行', () => {
      const result = strategicAI(baseState)

      // チェス盤パターンの最初のセル (0,0)
      expect(result).toEqual({ x: 0, y: 0 })
      expect(baseState.patternIndex).toBe(1)
    })
  })

  describe('predictUnitShape', () => {
    it('隣接する未探索セルを返す', () => {
      const hitPosition = { x: 5, y: 5 }
      const result = predictUnitShape(hitPosition, [], mockField)

      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(4) // 上下左右最大4つ

      // 全ての結果が隣接セルであることを確認
      result.forEach((pos) => {
        const dx = Math.abs(pos.x - hitPosition.x)
        const dy = Math.abs(pos.y - hitPosition.y)
        expect(dx + dy).toBe(1) // マンハッタン距離が1
      })
    })

    it('その方向にHITがある場合、スコアが高くなる', () => {
      const hitPosition = { x: 5, y: 5 }
      const discoveredCells = [
        { position: { x: 5, y: 5 }, isHit: true },
        { position: { x: 5, y: 6 }, isHit: true }, // 下にHIT
      ]

      const result = predictUnitShape(hitPosition, discoveredCells, mockField)

      // 下方向のさらに下（5,4）が最優先されるべき
      expect(result[0]).toEqual({ x: 5, y: 4 })
    })

    it('角のセルの場合、2つの隣接セルのみ返す', () => {
      const hitPosition = { x: 0, y: 0 } // 左上角
      const result = predictUnitShape(hitPosition, [], mockField)

      expect(result.length).toBe(2) // 右と下のみ
    })

    it('探索済みのセルは除外される', () => {
      const hitPosition = { x: 5, y: 5 }

      // 上下左右を探索済みに
      mockField.cells[4][5].state = CellState.MISS // 上
      mockField.cells[6][5].state = CellState.MISS // 下
      mockField.cells[5][4].state = CellState.MISS // 左
      mockField.cells[5][6].state = CellState.MISS // 右

      const result = predictUnitShape(hitPosition, [], mockField)

      expect(result.length).toBe(0)
    })
  })

  describe('getNextPatternCell', () => {
    it('チェス盤パターンの次の未探索セルを返す', () => {
      const state = { ...baseState, patternIndex: 0 }

      const result = getNextPatternCell(state)

      expect(result).toEqual({ x: 0, y: 0 })
      expect(state.patternIndex).toBe(1)
    })

    it('パターンインデックスが進む', () => {
      const state = { ...baseState, patternIndex: 0 }

      // 最初のセルを探索済みに
      mockField.cells[0][0].state = CellState.MISS

      const result = getNextPatternCell(state)

      expect(result).not.toEqual({ x: 0, y: 0 })
      expect(state.patternIndex).toBeGreaterThan(1)
    })

    it('パターンが尽きた場合、ランダムセルを返す', () => {
      const state = { ...baseState, patternIndex: 1000 } // 大きなインデックス

      const result = getNextPatternCell(state)

      expect(mockField.cells[result.y][result.x].state).toBe(CellState.UNEXPLORED)
    })

    it('全て探索済みの場合、中央を返す', () => {
      const state = { ...baseState, patternIndex: 0 }

      mockField.cells.forEach((row) =>
        row.forEach((cell) => {
          cell.state = CellState.MISS
        })
      )

      const result = getNextPatternCell(state)

      expect(result).toEqual({ x: 5, y: 5 })
    })
  })

  describe('getCheckerboardPattern', () => {
    it('チェス盤状のパターンを生成する', () => {
      const pattern = getCheckerboardPattern({ width: 10, height: 10 })

      expect(pattern.length).toBe(50) // 10x10の半分

      // 全てのセルが (x + y) % 2 === 0 であることを確認
      pattern.forEach((pos) => {
        expect((pos.x + pos.y) % 2).toBe(0)
      })
    })

    it('小さいグリッドでも正しく動作する', () => {
      const pattern = getCheckerboardPattern({ width: 3, height: 3 })

      expect(pattern.length).toBe(5) // (0,0), (0,2), (1,1), (2,0), (2,2)

      pattern.forEach((pos) => {
        expect((pos.x + pos.y) % 2).toBe(0)
      })
    })

    it('1x1グリッドの場合、1つのセルのみ', () => {
      const pattern = getCheckerboardPattern({ width: 1, height: 1 })

      expect(pattern).toEqual([{ x: 0, y: 0 }])
    })
  })
})

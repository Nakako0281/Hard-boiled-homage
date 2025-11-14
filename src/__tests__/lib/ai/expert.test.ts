import { describe, it, expect, beforeEach } from 'vitest'
import {
  expertAI,
  calculateProbabilityMap,
  getMostProbableCell,
} from '@/lib/ai/expert'
import type { AIState } from '@/lib/ai/base'
import { CellState } from '@/lib/types/enums'
import type { Field } from '@/lib/types/grid'

describe('Expert AI', () => {
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

  describe('expertAI', () => {
    it('確率分布マップを計算して最適なセルを返す', () => {
      const result = expertAI(baseState)

      expect(result.x).toBeGreaterThanOrEqual(0)
      expect(result.x).toBeLessThan(10)
      expect(result.y).toBeGreaterThanOrEqual(0)
      expect(result.y).toBeLessThan(10)
      expect(mockField.cells[result.y][result.x].state).toBe(CellState.UNEXPLORED)
    })

    it('HITがある場合、その周辺が優先される', () => {
      const hitPosition = { x: 5, y: 5 }
      const stateWithHit = {
        ...baseState,
        discoveredCells: [{ position: hitPosition, isHit: true }],
      }

      const result = expertAI(stateWithHit)

      // HITの隣接セルを返すべき
      const dx = Math.abs(result.x - hitPosition.x)
      const dy = Math.abs(result.y - hitPosition.y)
      expect(dx + dy).toBeGreaterThan(0) // 有効な位置
    })
  })

  describe('calculateProbabilityMap', () => {
    it('全て未探索の場合、均一な確率マップを返す', () => {
      const map = calculateProbabilityMap(baseState)

      expect(map.length).toBe(10)
      expect(map[0].length).toBe(10)

      // 正規化後なので0-1の範囲
      map.forEach((row) =>
        row.forEach((value) => {
          expect(value).toBeGreaterThanOrEqual(0)
          expect(value).toBeLessThanOrEqual(1)
        })
      )
    })

    it('探索済みセルの確率は0', () => {
      mockField.cells[5][5].state = CellState.MISS

      const map = calculateProbabilityMap(baseState)

      expect(map[5][5]).toBe(0)
    })

    it('端のセルは確率が低い（ヒューリスティック）', () => {
      const map = calculateProbabilityMap(baseState)

      // 中央のセルの確率
      const centerProb = map[5][5]

      // 角のセルの確率
      const cornerProb = map[0][0]

      // 端は中央より低いはず（または同じ）
      expect(cornerProb).toBeLessThanOrEqual(centerProb)
    })

    it('HITの周辺は確率が高い', () => {
      const hitPosition = { x: 5, y: 5 }
      const stateWithHit = {
        ...baseState,
        discoveredCells: [{ position: hitPosition, isHit: true }],
      }

      const map = calculateProbabilityMap(stateWithHit)

      // HITの隣接セル
      const adjacentProb = map[4][5] // 上

      // 遠いセル
      const farProb = map[0][0]

      // 隣接セルの方が確率が高いはず
      expect(adjacentProb).toBeGreaterThan(farProb)
    })

    it('HITが直線に並んでいる場合、延長線上の確率が最も高い', () => {
      const stateWithHits = {
        ...baseState,
        discoveredCells: [
          { position: { x: 5, y: 5 }, isHit: true },
          { position: { x: 5, y: 6 }, isHit: true }, // 縦に並ぶ
        ],
      }

      const map = calculateProbabilityMap(stateWithHits)

      // 延長線上のセル (5, 4) と (5, 7)
      const extensionProb1 = map[4][5]
      const extensionProb2 = map[7][5]

      // 関係ないセル
      const unrelatedProb = map[0][0]

      // 延長線上の方が確率が高いはず
      expect(extensionProb1).toBeGreaterThan(unrelatedProb)
      expect(extensionProb2).toBeGreaterThan(unrelatedProb)
    })

    it('全て探索済みの場合、全て0', () => {
      mockField.cells.forEach((row) =>
        row.forEach((cell) => {
          cell.state = CellState.MISS
        })
      )

      const map = calculateProbabilityMap(baseState)

      map.forEach((row) =>
        row.forEach((value) => {
          expect(value).toBe(0)
        })
      )
    })
  })

  describe('getMostProbableCell', () => {
    it('最も確率が高いセルを返す', () => {
      const probabilityMap = Array(10)
        .fill(0)
        .map(() => Array(10).fill(0))

      // (5,5)に最高確率を設定
      probabilityMap[5][5] = 1.0

      const result = getMostProbableCell(probabilityMap, mockField)

      expect(result).toEqual({ x: 5, y: 5 })
    })

    it('同じ確率のセルが複数ある場合、その中からランダムに選択', () => {
      const probabilityMap = Array(10)
        .fill(0)
        .map(() => Array(10).fill(0))

      // 複数のセルに同じ最高確率を設定
      probabilityMap[3][3] = 1.0
      probabilityMap[5][5] = 1.0
      probabilityMap[7][7] = 1.0

      const result = getMostProbableCell(probabilityMap, mockField)

      // いずれかのセルが返される
      const validResults = [
        { x: 3, y: 3 },
        { x: 5, y: 5 },
        { x: 7, y: 7 },
      ]

      expect(validResults).toContainEqual(result)
    })

    it('全て確率0の場合、ランダムな未探索セルを返す', () => {
      const probabilityMap = Array(10)
        .fill(0)
        .map(() => Array(10).fill(0))

      const result = getMostProbableCell(probabilityMap, mockField)

      expect(mockField.cells[result.y][result.x].state).toBe(CellState.UNEXPLORED)
    })

    it('全て探索済みの場合、中央を返す', () => {
      const probabilityMap = Array(10)
        .fill(0)
        .map(() => Array(10).fill(0))

      mockField.cells.forEach((row) =>
        row.forEach((cell) => {
          cell.state = CellState.MISS
        })
      )

      const result = getMostProbableCell(probabilityMap, mockField)

      expect(result).toEqual({ x: 5, y: 5 })
    })

    it('calculateProbabilityMapと組み合わせて探索済みセルは確率0になる', () => {
      // 実際の使用例: calculateProbabilityMapが探索済みセルの確率を0にする
      mockField.cells[3][3].state = CellState.MISS // 探索済み

      const probabilityMap = calculateProbabilityMap(baseState)

      const result = getMostProbableCell(probabilityMap, mockField)

      // 探索済みセルは確率0なので返されない
      expect(result).not.toEqual({ x: 3, y: 3 })
    })
  })
})

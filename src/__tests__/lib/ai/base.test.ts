import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getRandomUnexploredCell,
  getAdjacentUnexploredCells,
  randomChoice,
  updateAIState,
  applyMistakeProbability,
  getNearbyUnexploredCells,
  getAllUnexploredCells,
  type AIState,
} from '@/lib/ai/base'
import { createEmptyGrid } from '@/lib/utils/grid'
import { CellState } from '@/lib/types/enums'
import type { Field } from '@/lib/types/grid'

describe('AI base utilities', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getRandomUnexploredCell', () => {
    it('未探索セルがある場合、ランダムに1つ返す', () => {
      const field: Field = {
        size: { width: 3, height: 3 },
        cells: createEmptyGrid({ width: 3, height: 3 }),
        placedUnits: [],
      }

      const result = getRandomUnexploredCell(field)

      expect(result).not.toBeNull()
      if (result) {
        expect(result.x).toBeGreaterThanOrEqual(0)
        expect(result.x).toBeLessThan(3)
        expect(result.y).toBeGreaterThanOrEqual(0)
        expect(result.y).toBeLessThan(3)
      }
    })

    it('未探索セルがない場合、nullを返す', () => {
      const field: Field = {
        size: { width: 2, height: 2 },
        cells: createEmptyGrid({ width: 2, height: 2 }),
        placedUnits: [],
      }

      // 全てのセルをMISSに設定
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          field.cells[y][x].state = CellState.MISS
        }
      }

      const result = getRandomUnexploredCell(field)

      expect(result).toBeNull()
    })
  })

  describe('getAdjacentUnexploredCells', () => {
    it('隣接する未探索セルを取得', () => {
      const field: Field = {
        size: { width: 5, height: 5 },
        cells: createEmptyGrid({ width: 5, height: 5 }),
        placedUnits: [],
      }

      const result = getAdjacentUnexploredCells({ x: 2, y: 2 }, field)

      // 上下左右4セル
      expect(result).toHaveLength(4)
      expect(result).toContainEqual({ x: 2, y: 1 }) // 上
      expect(result).toContainEqual({ x: 2, y: 3 }) // 下
      expect(result).toContainEqual({ x: 1, y: 2 }) // 左
      expect(result).toContainEqual({ x: 3, y: 2 }) // 右
    })

    it('端のセルでは範囲外を含まない', () => {
      const field: Field = {
        size: { width: 3, height: 3 },
        cells: createEmptyGrid({ width: 3, height: 3 }),
        placedUnits: [],
      }

      const result = getAdjacentUnexploredCells({ x: 0, y: 0 }, field)

      // 右と下のみ
      expect(result).toHaveLength(2)
      expect(result).toContainEqual({ x: 1, y: 0 })
      expect(result).toContainEqual({ x: 0, y: 1 })
    })

    it('探索済みセルは含まない', () => {
      const field: Field = {
        size: { width: 3, height: 3 },
        cells: createEmptyGrid({ width: 3, height: 3 }),
        placedUnits: [],
      }

      // 右と上をMISSに設定
      field.cells[0][1].state = CellState.MISS // 右
      field.cells[1][0].state = CellState.HIT // 下

      const result = getAdjacentUnexploredCells({ x: 0, y: 0 }, field)

      // どちらも探索済みなので空
      expect(result).toHaveLength(0)
    })
  })

  describe('randomChoice', () => {
    it('配列からランダムに1つ選択', () => {
      const array = [1, 2, 3, 4, 5]

      const result = randomChoice(array)

      expect(array).toContain(result)
    })

    it('1要素の配列からはその要素を返す', () => {
      const array = [42]

      const result = randomChoice(array)

      expect(result).toBe(42)
    })
  })

  describe('updateAIState', () => {
    it('HIT時は最後のHIT位置を更新', () => {
      const state: AIState = {
        field: {
          size: { width: 5, height: 5 },
          cells: createEmptyGrid({ width: 5, height: 5 }),
          placedUnits: [],
        },
        currentHP: 100,
        maxHP: 100,
        currentSP: 50,
        maxSP: 50,
        enemyHP: 100,
        enemyMaxHP: 100,
        placedUnits: [],
        remainingUnits: ['ambulance'],
        discoveredCells: [],
        patternIndex: 0,
        consecutiveMisses: 0,
      }

      updateAIState(state, { x: 2, y: 2 }, {
        success: true,
        isHit: true,
        canContinue: true,
        destroyedUnitId: 'ambulance',
      })

      expect(state.lastHitPosition).toEqual({ x: 2, y: 2 })
      expect(state.consecutiveMisses).toBe(0)
      expect(state.discoveredCells).toHaveLength(1)
      expect(state.discoveredCells[0].isHit).toBe(true)
    })

    it('MISS時は連続MISS数を増やす', () => {
      const state: AIState = {
        field: {
          size: { width: 5, height: 5 },
          cells: createEmptyGrid({ width: 5, height: 5 }),
          placedUnits: [],
        },
        currentHP: 100,
        maxHP: 100,
        currentSP: 50,
        maxSP: 50,
        enemyHP: 100,
        enemyMaxHP: 100,
        placedUnits: [],
        remainingUnits: [],
        discoveredCells: [],
        patternIndex: 0,
        consecutiveMisses: 2,
      }

      updateAIState(state, { x: 1, y: 1 }, {
        success: true,
        isHit: false,
        canContinue: false,
      })

      expect(state.consecutiveMisses).toBe(3)
      expect(state.discoveredCells).toHaveLength(1)
      expect(state.discoveredCells[0].isHit).toBe(false)
    })

    it('連続MISS数が5を超えると最後のHIT位置をクリア', () => {
      const state: AIState = {
        field: {
          size: { width: 5, height: 5 },
          cells: createEmptyGrid({ width: 5, height: 5 }),
          placedUnits: [],
        },
        currentHP: 100,
        maxHP: 100,
        currentSP: 50,
        maxSP: 50,
        enemyHP: 100,
        enemyMaxHP: 100,
        placedUnits: [],
        remainingUnits: [],
        discoveredCells: [],
        lastHitPosition: { x: 3, y: 3 },
        patternIndex: 0,
        consecutiveMisses: 5,
      }

      updateAIState(state, { x: 1, y: 1 }, {
        success: true,
        isHit: false,
        canContinue: false,
      })

      expect(state.consecutiveMisses).toBe(6)
      expect(state.lastHitPosition).toBeUndefined()
    })
  })

  describe('applyMistakeProbability', () => {
    it('ミス確率0%の場合、最適位置をそのまま返す', () => {
      const field: Field = {
        size: { width: 5, height: 5 },
        cells: createEmptyGrid({ width: 5, height: 5 }),
        placedUnits: [],
      }

      const optimal = { x: 2, y: 2 }
      const result = applyMistakeProbability(optimal, field, 0)

      expect(result).toEqual(optimal)
    })

    it('ミス確率100%の場合、異なる位置を返す可能性がある', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99) // 確実にミス

      const field: Field = {
        size: { width: 5, height: 5 },
        cells: createEmptyGrid({ width: 5, height: 5 }),
        placedUnits: [],
      }

      const optimal = { x: 2, y: 2 }
      const result = applyMistakeProbability(optimal, field, 1.0)

      // 近くの未探索セルから選ばれる
      expect(result.x).toBeGreaterThanOrEqual(0)
      expect(result.x).toBeLessThan(5)
    })
  })

  describe('getNearbyUnexploredCells', () => {
    it('半径内の未探索セルを取得', () => {
      const field: Field = {
        size: { width: 5, height: 5 },
        cells: createEmptyGrid({ width: 5, height: 5 }),
        placedUnits: [],
      }

      const result = getNearbyUnexploredCells({ x: 2, y: 2 }, field, 1)

      // 中心を除く周囲8セル
      expect(result).toHaveLength(8)
    })

    it('範囲外のセルは含まない', () => {
      const field: Field = {
        size: { width: 3, height: 3 },
        cells: createEmptyGrid({ width: 3, height: 3 }),
        placedUnits: [],
      }

      const result = getNearbyUnexploredCells({ x: 0, y: 0 }, field, 1)

      // 右、下、右下の3セルのみ
      expect(result).toHaveLength(3)
    })
  })

  describe('getAllUnexploredCells', () => {
    it('全ての未探索セルを取得', () => {
      const field: Field = {
        size: { width: 3, height: 3 },
        cells: createEmptyGrid({ width: 3, height: 3 }),
        placedUnits: [],
      }

      const result = getAllUnexploredCells(field)

      expect(result).toHaveLength(9)
    })

    it('一部探索済みの場合、未探索のみ返す', () => {
      const field: Field = {
        size: { width: 3, height: 3 },
        cells: createEmptyGrid({ width: 3, height: 3 }),
        placedUnits: [],
      }

      field.cells[0][0].state = CellState.MISS
      field.cells[1][1].state = CellState.HIT

      const result = getAllUnexploredCells(field)

      expect(result).toHaveLength(7)
    })
  })
})

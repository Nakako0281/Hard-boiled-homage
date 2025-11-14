import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aggressiveAI, shouldUseSpecialAttack_Aggressive } from '@/lib/ai/aggressive'
import type { AIState } from '@/lib/ai/base'
import { CellState } from '@/lib/types/enums'
import type { Field } from '@/lib/types/grid'

describe('Aggressive AI', () => {
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

  describe('aggressiveAI', () => {
    it('lastHitPositionがない場合、ランダム攻撃を行う', () => {
      const result = aggressiveAI(baseState)

      expect(result.x).toBeGreaterThanOrEqual(0)
      expect(result.x).toBeLessThan(10)
      expect(result.y).toBeGreaterThanOrEqual(0)
      expect(result.y).toBeLessThan(10)
      expect(mockField.cells[result.y][result.x].state).toBe(CellState.UNEXPLORED)
    })

    it('lastHitPositionがある場合、70%の確率で部隊破壊を続行', () => {
      const hitPosition = { x: 5, y: 5 }
      const stateWithHit = { ...baseState, lastHitPosition: hitPosition }

      // Math.randomをモック（70%で部隊破壊）
      vi.spyOn(Math, 'random').mockReturnValue(0.6) // 0.6 < 0.7

      const result = aggressiveAI(stateWithHit)

      expect(result.x).toBeGreaterThanOrEqual(0)
      expect(result.x).toBeLessThan(10)
      expect(result.y).toBeGreaterThanOrEqual(0)
      expect(result.y).toBeLessThan(10)
    })

    it('lastHitPositionがあっても30%の確率でHP狙いのランダム攻撃', () => {
      const hitPosition = { x: 5, y: 5 }
      const stateWithHit = { ...baseState, lastHitPosition: hitPosition }

      // Math.randomをモック（30%でHP狙い）
      vi.spyOn(Math, 'random').mockReturnValue(0.8) // 0.8 > 0.7

      const result = aggressiveAI(stateWithHit)

      expect(mockField.cells[result.y][result.x].state).toBe(CellState.UNEXPLORED)
    })

    it('未探索セルがない場合、中央を返す', () => {
      mockField.cells.forEach((row) =>
        row.forEach((cell) => {
          cell.state = CellState.MISS
        })
      )

      const result = aggressiveAI(baseState)

      expect(result).toEqual({ x: 5, y: 5 })
    })
  })

  describe('shouldUseSpecialAttack_Aggressive', () => {
    it('SP60%以上かつ敵HP80%以下の場合、40%の確率で特殊攻撃を使用', () => {
      const state: AIState = {
        ...baseState,
        currentSP: 60,
        maxSP: 100,
        enemyHP: 70,
        enemyMaxHP: 100,
      }

      vi.spyOn(Math, 'random').mockReturnValue(0.3) // 0.3 < 0.4

      const result = shouldUseSpecialAttack_Aggressive(state)

      expect(result).toBe(true)
    })

    it('SP60%未満の場合、特殊攻撃を使用しない', () => {
      const state: AIState = {
        ...baseState,
        currentSP: 50,
        maxSP: 100,
        enemyHP: 70,
        enemyMaxHP: 100,
      }

      const result = shouldUseSpecialAttack_Aggressive(state)

      expect(result).toBe(false)
    })

    it('敵HP80%超の場合、特殊攻撃を使用しない', () => {
      const state: AIState = {
        ...baseState,
        currentSP: 80,
        maxSP: 100,
        enemyHP: 85,
        enemyMaxHP: 100,
      }

      const result = shouldUseSpecialAttack_Aggressive(state)

      expect(result).toBe(false)
    })

    it('条件を満たしても40%の確率で不使用', () => {
      const state: AIState = {
        ...baseState,
        currentSP: 80,
        maxSP: 100,
        enemyHP: 70,
        enemyMaxHP: 100,
      }

      vi.spyOn(Math, 'random').mockReturnValue(0.5) // 0.5 > 0.4

      const result = shouldUseSpecialAttack_Aggressive(state)

      expect(result).toBe(false)
    })
  })
})

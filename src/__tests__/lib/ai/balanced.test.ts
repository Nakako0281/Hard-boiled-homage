import { describe, it, expect, vi, beforeEach } from 'vitest'
import { balancedAI } from '@/lib/ai/balanced'
import type { AIState } from '@/lib/ai/base'
import { CellState } from '@/lib/types/enums'
import type { Field } from '@/lib/types/grid'

describe('Balanced AI', () => {
  let mockField: Field
  let baseState: AIState

  beforeEach(() => {
    // 10x10のフィールドを作成
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
              unitId: undefined,
              isRevealed: false,
            }))
        ),
      placedUnits: [],
    }

    baseState = {
      field: mockField,
      discoveredCells: [],
      lastHitPosition: undefined,
      currentHP: 100,
      maxHP: 100,
      currentSP: 100,
      maxSP: 100,
      enemyHP: 100,
      enemyMaxHP: 100,
      placedUnits: [],
      remainingUnits: [],
      patternIndex: 0,
      consecutiveMisses: 0,
    }
  })

  it('lastHitPositionがない場合、ランダムな未探索セルを返す', () => {
    const result = balancedAI(baseState)

    expect(result.x).toBeGreaterThanOrEqual(0)
    expect(result.x).toBeLessThan(10)
    expect(result.y).toBeGreaterThanOrEqual(0)
    expect(result.y).toBeLessThan(10)
    expect(mockField.cells[result.y][result.x].state).toBe(CellState.UNEXPLORED)
  })

  it('lastHitPositionがある場合、周辺探索またはランダム攻撃を行う', () => {
    const hitPosition = { x: 5, y: 5 }
    const stateWithHit = { ...baseState, lastHitPosition: hitPosition }

    // Math.randomをモック（50%で周辺探索）
    vi.spyOn(Math, 'random').mockReturnValue(0.3) // 0.3 < 0.5

    const result = balancedAI(stateWithHit)

    // 結果が有効な位置であることを確認
    expect(result.x).toBeGreaterThanOrEqual(0)
    expect(result.x).toBeLessThan(10)
    expect(result.y).toBeGreaterThanOrEqual(0)
    expect(result.y).toBeLessThan(10)
  })

  it('lastHitPositionがあるが、ランダム攻撃を選択する場合（50%）', () => {
    const hitPosition = { x: 5, y: 5 }
    const stateWithHit = { ...baseState, lastHitPosition: hitPosition }

    // Math.randomをモック（50%超でランダム攻撃）
    vi.spyOn(Math, 'random').mockReturnValue(0.6) // 0.6 > 0.5

    const result = balancedAI(stateWithHit)

    // 結果が有効な未探索セルであることを確認
    expect(mockField.cells[result.y][result.x].state).toBe(CellState.UNEXPLORED)
  })

  it('未探索セルがない場合、中央を返す', () => {
    // 全てのセルを探索済みに
    mockField.cells.forEach((row) =>
      row.forEach((cell) => {
        cell.state = CellState.MISS
      })
    )

    const result = balancedAI(baseState)

    expect(result).toEqual({ x: 5, y: 5 }) // 中央
  })

  it('隣接セルが全て探索済みの場合、ランダム攻撃にフォールバック', () => {
    const hitPosition = { x: 5, y: 5 }

    // 隣接セルを全て探索済みに
    mockField.cells[4][5].state = CellState.MISS // 上
    mockField.cells[6][5].state = CellState.MISS // 下
    mockField.cells[5][4].state = CellState.MISS // 左
    mockField.cells[5][6].state = CellState.MISS // 右

    const stateWithHit = { ...baseState, lastHitPosition: hitPosition }
    vi.spyOn(Math, 'random').mockReturnValue(0.3)

    const result = balancedAI(stateWithHit)

    // 隣接セル以外の未探索セルを返す
    expect(mockField.cells[result.y][result.x].state).toBe(CellState.UNEXPLORED)
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameBoard } from '@/components/game/GameBoard'
import { createEmptyGrid } from '@/lib/utils/grid'
import { Turn } from '@/lib/types/enums'

describe('GameBoard', () => {
  const mockPlayerField = {
    size: { width: 3, height: 3 },
    cells: createEmptyGrid({ width: 3, height: 3 }),
    placedUnits: [],
  }

  const mockEnemyField = {
    size: { width: 3, height: 3 },
    cells: createEmptyGrid({ width: 3, height: 3 }),
    placedUnits: [],
  }

  it('ゲームボードがレンダリングされる', () => {
    render(
      <GameBoard
        playerField={mockPlayerField}
        enemyField={mockEnemyField}
        currentTurn={Turn.PLAYER}
        onAttack={() => {}}
      />
    )

    expect(screen.getByText('プレイヤーフィールド')).toBeInTheDocument()
    expect(screen.getByText('敵フィールド')).toBeInTheDocument()
  })

  it('プレイヤーターンの時は敵フィールドがインタラクティブになる', () => {
    render(
      <GameBoard
        playerField={mockPlayerField}
        enemyField={mockEnemyField}
        currentTurn={Turn.PLAYER}
        onAttack={() => {}}
      />
    )

    // 敵フィールドのセルがクリック可能
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('敵ターンの時は敵フィールドがインタラクティブでない', () => {
    render(
      <GameBoard
        playerField={mockPlayerField}
        enemyField={mockEnemyField}
        currentTurn={Turn.ENEMY}
        onAttack={() => {}}
      />
    )

    // 敵フィールドのセルがクリックできない
    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })

  it('onAttackが正しく呼ばれる', () => {
    const handleAttack = vi.fn()
    render(
      <GameBoard
        playerField={mockPlayerField}
        enemyField={mockEnemyField}
        currentTurn={Turn.PLAYER}
        onAttack={handleAttack}
      />
    )

    // 最初のボタン（敵フィールドの最初のセル）をクリック
    const buttons = screen.getAllByRole('button')
    buttons[0].click()

    expect(handleAttack).toHaveBeenCalledTimes(1)
    expect(handleAttack).toHaveBeenCalledWith({ x: 0, y: 0 })
  })
})

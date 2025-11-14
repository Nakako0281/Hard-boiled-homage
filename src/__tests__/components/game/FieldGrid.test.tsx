import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FieldGrid } from '@/components/game/FieldGrid'
import { createEmptyGrid } from '@/lib/utils/grid'
import { CellState } from '@/lib/types/enums'

describe('FieldGrid', () => {
  const mockField = {
    size: { width: 3, height: 3 },
    cells: createEmptyGrid({ width: 3, height: 3 }),
    placedUnits: [],
  }

  it('フィールドグリッドがレンダリングされる', () => {
    const { container } = render(
      <FieldGrid
        field={mockField}
        isPlayerField={false}
        isInteractive={false}
      />
    )

    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
  })

  it('正しい数のセルが表示される', () => {
    const { container } = render(
      <FieldGrid
        field={mockField}
        isPlayerField={false}
        isInteractive={false}
      />
    )

    // 3x3 = 9セル
    const cells = container.querySelectorAll('.aspect-square')
    expect(cells).toHaveLength(9)
  })

  it('インタラクティブな敵フィールドでセルをクリックできる', () => {
    const handleCellClick = vi.fn()
    render(
      <FieldGrid
        field={mockField}
        isPlayerField={false}
        isInteractive={true}
        onCellClick={handleCellClick}
      />
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)

    fireEvent.click(buttons[0])
    expect(handleCellClick).toHaveBeenCalledTimes(1)
    expect(handleCellClick).toHaveBeenCalledWith({ x: 0, y: 0 })
  })

  it('プレイヤーフィールドではセルをクリックできない', () => {
    render(
      <FieldGrid
        field={mockField}
        isPlayerField={true}
        isInteractive={false}
      />
    )

    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })

  it('インタラクティブでない場合はセルをクリックできない', () => {
    render(
      <FieldGrid
        field={mockField}
        isPlayerField={false}
        isInteractive={false}
      />
    )

    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })

  it('HITセルが正しく表示される', () => {
    const fieldWithHit = {
      ...mockField,
      cells: createEmptyGrid({ width: 3, height: 3 }),
    }
    fieldWithHit.cells[0][0].state = CellState.HIT

    render(
      <FieldGrid
        field={fieldWithHit}
        isPlayerField={false}
        isInteractive={false}
      />
    )

    expect(screen.getByText('×')).toBeInTheDocument()
  })

  it('MISSセルが正しく表示される', () => {
    const fieldWithMiss = {
      ...mockField,
      cells: createEmptyGrid({ width: 3, height: 3 }),
    }
    fieldWithMiss.cells[1][1].state = CellState.MISS

    render(
      <FieldGrid
        field={fieldWithMiss}
        isPlayerField={false}
        isInteractive={false}
      />
    )

    expect(screen.getByText('•')).toBeInTheDocument()
  })
})

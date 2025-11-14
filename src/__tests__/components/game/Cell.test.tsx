import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Cell } from '@/components/game/Cell'
import { CellState } from '@/lib/types/enums'

describe('Cell', () => {
  const mockPosition = { x: 0, y: 0 }

  it('未探索セルがレンダリングされる', () => {
    const { container } = render(
      <Cell
        position={mockPosition}
        state={CellState.UNEXPLORED}
        isRevealed={false}
        isPlayerField={false}
      />
    )

    const cell = container.querySelector('[role="cell"]')
    expect(cell).toBeInTheDocument()
  })

  it('HITセルに×マークが表示される', () => {
    render(
      <Cell
        position={mockPosition}
        state={CellState.HIT}
        isRevealed={true}
        isPlayerField={false}
      />
    )

    expect(screen.getByText('×')).toBeInTheDocument()
  })

  it('MISSセルに•マークが表示される', () => {
    render(
      <Cell
        position={mockPosition}
        state={CellState.MISS}
        isRevealed={true}
        isPlayerField={false}
      />
    )

    expect(screen.getByText('•')).toBeInTheDocument()
  })

  it('クリック可能なセルをクリックできる', () => {
    const handleClick = vi.fn()
    render(
      <Cell
        position={mockPosition}
        state={CellState.UNEXPLORED}
        isRevealed={false}
        isPlayerField={false}
        onClick={handleClick}
      />
    )

    const cell = screen.getByRole('button')
    fireEvent.click(cell)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('プレイヤーフィールドのセルはクリックできない', () => {
    const { container } = render(
      <Cell
        position={mockPosition}
        state={CellState.UNEXPLORED}
        isRevealed={true}
        isPlayerField={true}
      />
    )

    const cell = container.querySelector('[role="cell"]')
    expect(cell).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('ホバー時にonHoverが呼ばれる', () => {
    const handleHover = vi.fn()
    render(
      <Cell
        position={mockPosition}
        state={CellState.UNEXPLORED}
        isRevealed={false}
        isPlayerField={false}
        onClick={() => {}}
        onHover={handleHover}
      />
    )

    const cell = screen.getByRole('button')
    fireEvent.mouseEnter(cell)

    expect(handleHover).toHaveBeenCalledTimes(1)
  })

  it('ホバー終了時にonHoverEndが呼ばれる', () => {
    const handleHoverEnd = vi.fn()
    render(
      <Cell
        position={mockPosition}
        state={CellState.UNEXPLORED}
        isRevealed={false}
        isPlayerField={false}
        onClick={() => {}}
        onHoverEnd={handleHoverEnd}
      />
    )

    const cell = screen.getByRole('button')
    fireEvent.mouseLeave(cell)

    expect(handleHoverEnd).toHaveBeenCalledTimes(1)
  })

  it('isHoveredの時にring-2クラスが適用される', () => {
    render(
      <Cell
        position={mockPosition}
        state={CellState.UNEXPLORED}
        isRevealed={false}
        isPlayerField={false}
        isHovered={true}
        onClick={() => {}}
      />
    )

    const cell = screen.getByRole('button')
    expect(cell).toHaveClass('ring-2')
    expect(cell).toHaveClass('ring-[#3498DB]')
  })

  it('aria-labelが正しく設定される', () => {
    render(
      <Cell
        position={{ x: 3, y: 5 }}
        state={CellState.UNEXPLORED}
        isRevealed={false}
        isPlayerField={false}
      />
    )

    const cell = screen.getByLabelText(/座標 3, 5/i)
    expect(cell).toBeInTheDocument()
  })
})

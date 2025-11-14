import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TurnIndicator } from '@/components/ui/TurnIndicator'
import { Turn } from '@/lib/types/enums'

describe('TurnIndicator', () => {
  it('TurnIndicatorがレンダリングされる', () => {
    render(<TurnIndicator currentTurn={Turn.PLAYER} />)

    expect(screen.getByText('TURN 1')).toBeInTheDocument()
  })

  it('プレイヤーターンの時に正しく表示される', () => {
    render(<TurnIndicator currentTurn={Turn.PLAYER} />)

    expect(screen.getByText('あなたのターン')).toBeInTheDocument()
  })

  it('敵ターンの時に正しく表示される', () => {
    render(<TurnIndicator currentTurn={Turn.ENEMY} />)

    expect(screen.getByText('敵のターン')).toBeInTheDocument()
  })

  it('ターン数が正しく表示される', () => {
    render(<TurnIndicator currentTurn={Turn.PLAYER} turnNumber={5} />)

    expect(screen.getByText('TURN 5')).toBeInTheDocument()
  })

  it('プレイヤーターンのインジケーターが表示される', () => {
    render(<TurnIndicator currentTurn={Turn.PLAYER} />)

    const playerIndicator = screen.getByLabelText('プレイヤーターン')
    expect(playerIndicator).toBeInTheDocument()
    expect(playerIndicator).toHaveClass('bg-[#3498DB]')
  })

  it('敵ターンのインジケーターが表示される', () => {
    render(<TurnIndicator currentTurn={Turn.ENEMY} />)

    const enemyIndicator = screen.getByLabelText('敵ターン')
    expect(enemyIndicator).toBeInTheDocument()
    expect(enemyIndicator).toHaveClass('bg-[#E74C3C]')
  })

  it('プレイヤーターンの背景色が青系になる', () => {
    const { container } = render(<TurnIndicator currentTurn={Turn.PLAYER} />)

    const turnDisplay = screen.getByText('あなたのターン')
    expect(turnDisplay).toHaveClass('bg-[#2980B9]')
  })

  it('敵ターンの背景色が赤系になる', () => {
    const { container } = render(<TurnIndicator currentTurn={Turn.ENEMY} />)

    const turnDisplay = screen.getByText('敵のターン')
    expect(turnDisplay).toHaveClass('bg-[#C0392B]')
  })
})

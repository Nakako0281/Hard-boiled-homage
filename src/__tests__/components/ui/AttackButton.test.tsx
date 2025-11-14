import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AttackButton } from '@/components/ui/AttackButton'

describe('AttackButton', () => {
  it('AttackButtonがレンダリングされる', () => {
    render(<AttackButton onClick={() => {}} />)

    expect(screen.getByText('攻撃')).toBeInTheDocument()
  })

  it('クリックイベントが正しく呼ばれる', () => {
    const handleClick = vi.fn()
    render(<AttackButton onClick={handleClick} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled状態の時はクリックできない', () => {
    const handleClick = vi.fn()
    render(<AttackButton onClick={handleClick} disabled={true} />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()

    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('disabled状態の時はグレーの背景色になる', () => {
    render(<AttackButton onClick={() => {}} disabled={true} />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-[#5D6D7E]')
  })

  it('active状態の時は赤色の背景色になる', () => {
    render(<AttackButton onClick={() => {}} isActive={true} />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-[#E74C3C]')
  })

  it('通常状態の時は暗い赤色の背景色になる', () => {
    render(<AttackButton onClick={() => {}} isActive={false} />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-[#C0392B]')
  })

  it('aria-labelが正しく設定される', () => {
    render(<AttackButton onClick={() => {}} />)

    const button = screen.getByLabelText('通常攻撃')
    expect(button).toBeInTheDocument()
  })

  it('aria-disabledがdisabled状態に応じて設定される', () => {
    const { rerender } = render(<AttackButton onClick={() => {}} disabled={true} />)

    let button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-disabled', 'true')

    rerender(<AttackButton onClick={() => {}} disabled={false} />)
    button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-disabled', 'false')
  })

  it('アイコンSVGが表示される', () => {
    const { container } = render(<AttackButton onClick={() => {}} />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusPanel } from '@/components/ui/StatusPanel'

describe('StatusPanel', () => {
  const defaultProps = {
    name: 'ジャック刑事',
    hp: 80,
    maxHp: 100,
    sp: 50,
    maxSp: 100,
    unitsRemaining: 5,
    isCurrentTurn: false,
  }

  it('StatusPanelがレンダリングされる', () => {
    render(<StatusPanel {...defaultProps} />)

    expect(screen.getByText('ジャック刑事')).toBeInTheDocument()
  })

  it('HP値が正しく表示される', () => {
    render(<StatusPanel {...defaultProps} />)

    expect(screen.getByText('80 / 100')).toBeInTheDocument()
  })

  it('SP値が正しく表示される', () => {
    render(<StatusPanel {...defaultProps} />)

    expect(screen.getByText('50 / 100')).toBeInTheDocument()
  })

  it('部隊残数が正しく表示される', () => {
    render(<StatusPanel {...defaultProps} />)

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('ユニット')).toBeInTheDocument()
  })

  it('現在のターンの時にACTIVE表示が出る', () => {
    render(<StatusPanel {...defaultProps} isCurrentTurn={true} />)

    expect(screen.getByText('● ACTIVE')).toBeInTheDocument()
  })

  it('現在のターンでない時はACTIVE表示が出ない', () => {
    render(<StatusPanel {...defaultProps} isCurrentTurn={false} />)

    expect(screen.queryByText('● ACTIVE')).not.toBeInTheDocument()
  })

  it('HP50%以上の時は緑色のバーになる', () => {
    const { container } = render(
      <StatusPanel {...defaultProps} hp={60} maxHp={100} />
    )

    const hpBar = container.querySelector('[class*="bg-[#27AE60]"]')
    expect(hpBar).toBeInTheDocument()
  })

  it('HP25-50%の時はオレンジ色のバーになる', () => {
    const { container } = render(
      <StatusPanel {...defaultProps} hp={30} maxHp={100} />
    )

    const hpBar = container.querySelector('[class*="bg-[#F39C12]"]')
    expect(hpBar).toBeInTheDocument()
  })

  it('HP25%以下の時は赤色のバーになる', () => {
    const { container } = render(
      <StatusPanel {...defaultProps} hp={20} maxHp={100} />
    )

    const hpBar = container.querySelector('[class*="bg-[#C0392B]"]')
    expect(hpBar).toBeInTheDocument()
  })

  it('SPバーは常に青色になる', () => {
    const { container } = render(<StatusPanel {...defaultProps} />)

    const spBar = container.querySelector('[class*="bg-[#3498DB]"]')
    expect(spBar).toBeInTheDocument()
  })

  it('現在のターンの時にリング装飾が表示される', () => {
    const { container } = render(
      <StatusPanel {...defaultProps} isCurrentTurn={true} />
    )

    const panel = container.querySelector('[class*="ring-2"]')
    expect(panel).toBeInTheDocument()
  })
})

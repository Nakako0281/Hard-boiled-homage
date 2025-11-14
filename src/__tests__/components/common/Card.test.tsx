import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Card } from '@/components/common/Card'

describe('Card', () => {
  it('カードがレンダリングされる', () => {
    render(<Card>カード内容</Card>)
    expect(screen.getByText('カード内容')).toBeInTheDocument()
  })

  it('クリック可能なカードをクリックできる', () => {
    const handleClick = vi.fn()
    render(
      <Card onClick={handleClick} isHoverable>
        クリック可能
      </Card>
    )

    const card = screen.getByText('クリック可能')
    fireEvent.click(card)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('isHoverableの時にcursor-pointerクラスが適用される', () => {
    render(<Card isHoverable>ホバー可能</Card>)
    const card = screen.getByText('ホバー可能')
    expect(card).toHaveClass('cursor-pointer')
  })

  it('isSelectedの時にring-2クラスが適用される', () => {
    render(<Card isSelected>選択中</Card>)
    const card = screen.getByText('選択中')
    expect(card).toHaveClass('ring-2')
    expect(card).toHaveClass('ring-[#3498DB]')
  })

  it('カスタムクラス名が適用される', () => {
    render(<Card className="custom-class">カスタム</Card>)
    const card = screen.getByText('カスタム')
    expect(card).toHaveClass('custom-class')
  })

  it('デフォルトのスタイルが適用される', () => {
    render(<Card>デフォルト</Card>)
    const card = screen.getByText('デフォルト')
    expect(card).toHaveClass('bg-[#34495E]')
    expect(card).toHaveClass('rounded-xl')
    expect(card).toHaveClass('p-6')
    expect(card).toHaveClass('shadow-lg')
  })
})

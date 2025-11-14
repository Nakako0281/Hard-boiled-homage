import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/common/Button'

describe('Button', () => {
  it('ボタンがレンダリングされる', () => {
    render(<Button onClick={() => {}}>テストボタン</Button>)
    const button = screen.getByRole('button', { name: /テストボタン/i })
    expect(button).toBeInTheDocument()
  })

  it('クリックイベントが発火する', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>クリック</Button>)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('無効化されたボタンはクリックできない', () => {
    const handleClick = vi.fn()
    render(
      <Button onClick={handleClick} disabled>
        無効
      </Button>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
    expect(button).toBeDisabled()
  })

  it('variant=primaryのスタイルが適用される', () => {
    render(<Button onClick={() => {}} variant="primary">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-[#2980B9]')
  })

  it('variant=secondaryのスタイルが適用される', () => {
    render(<Button onClick={() => {}} variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-transparent')
    expect(button).toHaveClass('border-2')
  })

  it('variant=dangerのスタイルが適用される', () => {
    render(<Button onClick={() => {}} variant="danger">Danger</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-[#C0392B]')
  })

  it('size=smのスタイルが適用される', () => {
    render(<Button onClick={() => {}} size="sm">Small</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-4')
    expect(button).toHaveClass('py-2')
  })

  it('size=lgのスタイルが適用される', () => {
    render(<Button onClick={() => {}} size="lg">Large</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-8')
    expect(button).toHaveClass('py-4')
  })

  it('aria-labelが設定される', () => {
    render(<Button onClick={() => {}} ariaLabel="攻撃ボタン">攻撃</Button>)
    const button = screen.getByRole('button', { name: /攻撃ボタン/i })
    expect(button).toBeInTheDocument()
  })

  it('type属性が設定される', () => {
    render(<Button onClick={() => {}} type="submit">送信</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})

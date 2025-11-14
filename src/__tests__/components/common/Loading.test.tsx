import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loading } from '@/components/common/Loading'

describe('Loading', () => {
  it('ローディングスピナーがレンダリングされる', () => {
    const { container } = render(<Loading />)
    // Tailwind CSS動的クラス名は実際のDOMでは文字列として保持される
    const spinner = container.querySelector('[class*="rounded-full"]')
    expect(spinner).toBeInTheDocument()
  })

  it('メッセージが表示される', () => {
    render(<Loading message="読み込み中..." />)
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('メッセージがない場合は表示されない', () => {
    render(<Loading />)
    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument()
  })

  it('size=smの時に正しいクラスが適用される', () => {
    const { container } = render(<Loading size="sm" />)
    const spinner = container.querySelector('[class*="rounded-full"]')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('w-8')
    expect(spinner).toHaveClass('h-8')
    expect(spinner).toHaveClass('border-2')
  })

  it('size=mdの時に正しいクラスが適用される', () => {
    const { container } = render(<Loading size="md" />)
    const spinner = container.querySelector('[class*="rounded-full"]')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('w-12')
    expect(spinner).toHaveClass('h-12')
    expect(spinner).toHaveClass('border-4')
  })

  it('size=lgの時に正しいクラスが適用される', () => {
    const { container } = render(<Loading size="lg" />)
    const spinner = container.querySelector('[class*="rounded-full"]')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('w-16')
    expect(spinner).toHaveClass('h-16')
    expect(spinner).toHaveClass('border-4')
  })

  it('fullScreen=trueの時にfixed要素が追加される', () => {
    const { container } = render(<Loading fullScreen={true} />)
    const fullScreenDiv = container.querySelector('[class*="fixed"]')
    expect(fullScreenDiv).toBeInTheDocument()
    expect(fullScreenDiv).toHaveClass('inset-0')
    expect(fullScreenDiv).toHaveClass('z-50')
  })

  it('fullScreen=falseの時にfixed要素が追加されない', () => {
    const { container } = render(<Loading fullScreen={false} />)
    const fullScreenDiv = container.querySelector('[class*="fixed"]')
    expect(fullScreenDiv).not.toBeInTheDocument()
  })
})

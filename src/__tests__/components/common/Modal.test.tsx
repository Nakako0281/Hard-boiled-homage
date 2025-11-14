import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '@/components/common/Modal'

describe('Modal', () => {
  beforeEach(() => {
    // モーダルのポータルターゲットを設定
    const div = document.createElement('div')
    div.setAttribute('id', 'modal-root')
    document.body.appendChild(div)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('isOpenがtrueの時にモーダルが表示される', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        モーダル内容
      </Modal>
    )

    expect(screen.getByText('モーダル内容')).toBeInTheDocument()
  })

  it('isOpenがfalseの時にモーダルが表示されない', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        モーダル内容
      </Modal>
    )

    expect(screen.queryByText('モーダル内容')).not.toBeInTheDocument()
  })

  it('タイトルが表示される', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="テストタイトル">
        モーダル内容
      </Modal>
    )

    expect(screen.getByText('テストタイトル')).toBeInTheDocument()
  })

  it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="テスト">
        モーダル内容
      </Modal>
    )

    const closeButton = screen.getByRole('button', { name: /閉じる/i })
    fireEvent.click(closeButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('オーバーレイをクリックするとonCloseが呼ばれる', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose}>
        モーダル内容
      </Modal>
    )

    // オーバーレイを取得（最初のdivでaria-hidden="true"のもの）
    const overlay = document.querySelector('[aria-hidden="true"]')
    expect(overlay).toBeInTheDocument()

    if (overlay) {
      fireEvent.click(overlay)
      expect(handleClose).toHaveBeenCalledTimes(1)
    }
  })

  it('Escapeキーを押すとonCloseが呼ばれる', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose}>
        モーダル内容
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('showCloseButton=falseの時に閉じるボタンが表示されない', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} showCloseButton={false}>
        モーダル内容
      </Modal>
    )

    expect(screen.queryByRole('button', { name: /閉じる/i })).not.toBeInTheDocument()
  })

  it('size=smの時に正しいクラスが適用される', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} size="sm">
        モーダル内容
      </Modal>
    )

    const modalContent = screen.getByRole('dialog')
    expect(modalContent).toHaveClass('max-w-md')
  })

  it('size=lgの時に正しいクラスが適用される', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        モーダル内容
      </Modal>
    )

    const modalContent = screen.getByRole('dialog')
    expect(modalContent).toHaveClass('max-w-4xl')
  })
})

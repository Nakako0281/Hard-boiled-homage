import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CharacterSelect } from '@/components/screens/CharacterSelect'

describe('CharacterSelect', () => {
  it('isOpenがfalseの時は何も表示されない', () => {
    render(
      <CharacterSelect isOpen={false} onSelect={() => {}} onClose={() => {}} />
    )

    expect(screen.queryByText('キャラクター選択')).not.toBeInTheDocument()
  })

  it('isOpenがtrueの時にモーダルが表示される', () => {
    render(
      <CharacterSelect isOpen={true} onSelect={() => {}} onClose={() => {}} />
    )

    expect(screen.getByText('キャラクター選択')).toBeInTheDocument()
  })

  it('ジャック刑事が表示される', () => {
    render(
      <CharacterSelect isOpen={true} onSelect={() => {}} onClose={() => {}} />
    )

    expect(screen.getByText('ジャック刑事')).toBeInTheDocument()
  })

  it('ガプリーノ警部が表示される', () => {
    render(
      <CharacterSelect isOpen={true} onSelect={() => {}} onClose={() => {}} />
    )

    expect(screen.getByText('ガプリーノ警部')).toBeInTheDocument()
  })

  it('キャラクターを選択すると決定ボタンが有効になる', () => {
    render(
      <CharacterSelect isOpen={true} onSelect={() => {}} onClose={() => {}} />
    )

    const decisionButton = screen.getByText('決定')
    expect(decisionButton).toBeDisabled()

    const jackCard = screen.getByText('ジャック刑事').closest('.bg-\\[\\#34495E\\]')
    fireEvent.click(jackCard!)

    expect(decisionButton).not.toBeDisabled()
  })

  it('決定ボタンをクリックするとonSelectが呼ばれる', () => {
    const handleSelect = vi.fn()
    render(
      <CharacterSelect
        isOpen={true}
        onSelect={handleSelect}
        onClose={() => {}}
      />
    )

    const jackCard = screen.getByText('ジャック刑事').closest('.bg-\\[\\#34495E\\]')
    fireEvent.click(jackCard!)

    const decisionButton = screen.getByText('決定')
    fireEvent.click(decisionButton)

    expect(handleSelect).toHaveBeenCalledWith('jack')
  })

  it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
    const handleClose = vi.fn()
    render(
      <CharacterSelect
        isOpen={true}
        onSelect={() => {}}
        onClose={handleClose}
      />
    )

    const closeButton = screen.getByLabelText('閉じる')
    fireEvent.click(closeButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('キャンセルボタンをクリックするとonCloseが呼ばれる', () => {
    const handleClose = vi.fn()
    render(
      <CharacterSelect
        isOpen={true}
        onSelect={() => {}}
        onClose={handleClose}
      />
    )

    const cancelButton = screen.getByText('キャンセル')
    fireEvent.click(cancelButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})

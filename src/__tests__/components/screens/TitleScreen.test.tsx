import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TitleScreen } from '@/components/screens/TitleScreen'

describe('TitleScreen', () => {
  it('TitleScreenがレンダリングされる', () => {
    render(<TitleScreen onNewGame={() => {}} />)

    expect(screen.getByText('HARD')).toBeInTheDocument()
    expect(screen.getByText('BOILED')).toBeInTheDocument()
  })

  it('新規ゲームボタンが表示される', () => {
    render(<TitleScreen onNewGame={() => {}} />)

    expect(screen.getByText('新規ゲーム')).toBeInTheDocument()
  })

  it('新規ゲームボタンをクリックするとキャラクター選択が表示される', () => {
    render(<TitleScreen onNewGame={() => {}} />)

    const newGameButton = screen.getByText('新規ゲーム')
    fireEvent.click(newGameButton)

    expect(screen.getByText('キャラクター選択')).toBeInTheDocument()
  })

  it('セーブデータがある時はコンティニューボタンが表示される', () => {
    render(
      <TitleScreen
        onNewGame={() => {}}
        onContinue={() => {}}
        hasSaveData={true}
      />
    )

    expect(screen.getByText('コンティニュー')).toBeInTheDocument()
  })

  it('セーブデータがない時はコンティニューボタンが表示されない', () => {
    render(<TitleScreen onNewGame={() => {}} hasSaveData={false} />)

    expect(screen.queryByText('コンティニュー')).not.toBeInTheDocument()
  })

  it('コンティニューボタンをクリックするとonContinueが呼ばれる', () => {
    const handleContinue = vi.fn()
    render(
      <TitleScreen
        onNewGame={() => {}}
        onContinue={handleContinue}
        hasSaveData={true}
      />
    )

    const continueButton = screen.getByText('コンティニュー')
    fireEvent.click(continueButton)

    expect(handleContinue).toHaveBeenCalledTimes(1)
  })
})

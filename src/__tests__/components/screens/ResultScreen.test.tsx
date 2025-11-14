import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResultScreen, BattleResult } from '@/components/screens/ResultScreen'

describe('ResultScreen', () => {
  const mockVictoryResult: BattleResult = {
    isVictory: true,
    reward: {
      money: 5000,
      experience: 1000,
      bonus: [
        { name: '迅速撃破ボーナス', amount: 500 },
        { name: '無傷ボーナス', amount: 300 },
      ],
    },
    stats: {
      turnsElapsed: 10,
      damageDealt: 150,
      damageTaken: 20,
      unitsLost: 0,
    },
  }

  const mockDefeatResult: BattleResult = {
    isVictory: false,
    reward: {
      money: 0,
      experience: 0,
    },
    stats: {
      turnsElapsed: 15,
      damageDealt: 80,
      damageTaken: 120,
      unitsLost: 5,
    },
  }

  it('ResultScreenがレンダリングされる', () => {
    render(<ResultScreen result={mockVictoryResult} onContinue={() => {}} />)

    expect(screen.getByText('VICTORY')).toBeInTheDocument()
  })

  it('勝利時にVICTORYが表示される', () => {
    render(<ResultScreen result={mockVictoryResult} onContinue={() => {}} />)

    expect(screen.getByText('VICTORY')).toBeInTheDocument()
    expect(screen.getByText('任務完了！')).toBeInTheDocument()
  })

  it('敗北時にDEFEATが表示される', () => {
    render(<ResultScreen result={mockDefeatResult} onContinue={() => {}} />)

    expect(screen.getByText('DEFEAT')).toBeInTheDocument()
    expect(screen.getByText('任務失敗...')).toBeInTheDocument()
  })

  it('勝利時に獲得報酬が表示される', () => {
    render(<ResultScreen result={mockVictoryResult} onContinue={() => {}} />)

    expect(screen.getByText('獲得報酬')).toBeInTheDocument()
    expect(screen.getByText('$5000')).toBeInTheDocument()
    expect(screen.getByText('1000 EXP')).toBeInTheDocument()
  })

  it('ボーナスが表示される', () => {
    render(<ResultScreen result={mockVictoryResult} onContinue={() => {}} />)

    expect(screen.getByText('ボーナス')).toBeInTheDocument()
    expect(screen.getByText('迅速撃破ボーナス')).toBeInTheDocument()
    expect(screen.getByText('無傷ボーナス')).toBeInTheDocument()
  })

  it('戦闘統計が表示される', () => {
    render(<ResultScreen result={mockVictoryResult} onContinue={() => {}} />)

    expect(screen.getByText('戦闘統計')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument() // ターン数
    expect(screen.getByText('150')).toBeInTheDocument() // 与ダメージ
    expect(screen.getByText('20')).toBeInTheDocument() // 被ダメージ
  })

  it('勝利時は次へ進むボタンが表示される', () => {
    render(<ResultScreen result={mockVictoryResult} onContinue={() => {}} />)

    expect(screen.getByText('次へ進む')).toBeInTheDocument()
  })

  it('敗北時は再挑戦ボタンが表示される', () => {
    render(
      <ResultScreen
        result={mockDefeatResult}
        onContinue={() => {}}
        onRetry={() => {}}
      />
    )

    expect(screen.getByText('再挑戦')).toBeInTheDocument()
  })

  it('次へ進むボタンをクリックするとonContinueが呼ばれる', () => {
    const handleContinue = vi.fn()
    render(<ResultScreen result={mockVictoryResult} onContinue={handleContinue} />)

    const continueButton = screen.getByText('次へ進む')
    fireEvent.click(continueButton)

    expect(handleContinue).toHaveBeenCalledTimes(1)
  })

  it('再挑戦ボタンをクリックするとonRetryが呼ばれる', () => {
    const handleRetry = vi.fn()
    render(
      <ResultScreen
        result={mockDefeatResult}
        onContinue={() => {}}
        onRetry={handleRetry}
      />
    )

    const retryButton = screen.getByText('再挑戦')
    fireEvent.click(retryButton)

    expect(handleRetry).toHaveBeenCalledTimes(1)
  })

  it('タイトルに戻るボタンが表示され、クリックするとonBackToTitleが呼ばれる', () => {
    const handleBackToTitle = vi.fn()
    render(
      <ResultScreen
        result={mockVictoryResult}
        onContinue={() => {}}
        onBackToTitle={handleBackToTitle}
      />
    )

    const backButton = screen.getByText('タイトルに戻る')
    fireEvent.click(backButton)

    expect(handleBackToTitle).toHaveBeenCalledTimes(1)
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EnemySelect, Enemy } from '@/components/screens/EnemySelect'

describe('EnemySelect', () => {
  const mockEnemies: Enemy[] = [
    {
      id: 'enemy1',
      name: '山田組',
      description: 'テスト敵1',
      difficulty: 'easy',
      reward: 1000,
      isDefeated: false,
    },
    {
      id: 'enemy2',
      name: '鈴木一家',
      description: 'テスト敵2',
      difficulty: 'normal',
      reward: 2000,
      isDefeated: true,
    },
  ]

  it('EnemySelectがレンダリングされる', () => {
    render(<EnemySelect enemies={mockEnemies} onSelectEnemy={() => {}} />)

    expect(screen.getByText('敵選択')).toBeInTheDocument()
  })

  it('敵一覧が表示される', () => {
    render(<EnemySelect enemies={mockEnemies} onSelectEnemy={() => {}} />)

    expect(screen.getByText('山田組')).toBeInTheDocument()
    expect(screen.getByText('鈴木一家')).toBeInTheDocument()
  })

  it('撃破済みの敵にマークが表示される', () => {
    render(<EnemySelect enemies={mockEnemies} onSelectEnemy={() => {}} />)

    expect(screen.getByText('撃破済み')).toBeInTheDocument()
  })

  it('撃破済みカウントが正しく表示される', () => {
    render(<EnemySelect enemies={mockEnemies} onSelectEnemy={() => {}} />)

    expect(screen.getByText('撃破した敵: 1 / 2')).toBeInTheDocument()
  })

  it('敵を選択すると戦闘開始ボタンが有効になる', () => {
    render(<EnemySelect enemies={mockEnemies} onSelectEnemy={() => {}} />)

    const battleButton = screen.getByText('戦闘開始')
    expect(battleButton).toBeDisabled()

    const enemy1Card = screen.getByText('山田組').closest('.bg-\\[\\#34495E\\]')
    fireEvent.click(enemy1Card!)

    expect(battleButton).not.toBeDisabled()
  })

  it('撃破済みの敵は選択できない', () => {
    const handleSelectEnemy = vi.fn()
    render(
      <EnemySelect enemies={mockEnemies} onSelectEnemy={handleSelectEnemy} />
    )

    const enemy2Card = screen.getByText('鈴木一家').closest('.bg-\\[\\#34495E\\]')
    fireEvent.click(enemy2Card!)

    const battleButton = screen.getByText('戦闘開始')
    expect(battleButton).toBeDisabled()
  })

  it('戦闘開始ボタンをクリックするとonSelectEnemyが呼ばれる', () => {
    const handleSelectEnemy = vi.fn()
    render(
      <EnemySelect enemies={mockEnemies} onSelectEnemy={handleSelectEnemy} />
    )

    const enemy1Card = screen.getByText('山田組').closest('.bg-\\[\\#34495E\\]')
    fireEvent.click(enemy1Card!)

    const battleButton = screen.getByText('戦闘開始')
    fireEvent.click(battleButton)

    expect(handleSelectEnemy).toHaveBeenCalledWith('enemy1')
  })

  it('戻るボタンが表示され、クリックするとonBackが呼ばれる', () => {
    const handleBack = vi.fn()
    render(
      <EnemySelect
        enemies={mockEnemies}
        onSelectEnemy={() => {}}
        onBack={handleBack}
      />
    )

    const backButton = screen.getByText('戻る')
    fireEvent.click(backButton)

    expect(handleBack).toHaveBeenCalledTimes(1)
  })
})

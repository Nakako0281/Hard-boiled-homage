import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BattleScreen } from '@/components/screens/BattleScreen'
import { createEmptyGrid } from '@/lib/utils/grid'
import { Turn } from '@/lib/types/enums'

describe('BattleScreen', () => {
  const mockPlayerField = {
    size: { width: 3, height: 3 },
    cells: createEmptyGrid({ width: 3, height: 3 }),
    placedUnits: [],
  }

  const mockEnemyField = {
    size: { width: 3, height: 3 },
    cells: createEmptyGrid({ width: 3, height: 3 }),
    placedUnits: [],
  }

  const mockPlayerStats = {
    name: 'ジャック刑事',
    hp: 80,
    maxHp: 100,
    sp: 50,
    maxSp: 100,
    unitsRemaining: 5,
  }

  const mockEnemyStats = {
    name: '山田組',
    hp: 60,
    maxHp: 100,
    sp: 30,
    maxSp: 50,
    unitsRemaining: 3,
  }

  it('BattleScreenがレンダリングされる', () => {
    render(
      <BattleScreen
        playerField={mockPlayerField}
        enemyField={mockEnemyField}
        currentTurn={Turn.PLAYER}
        turnNumber={1}
        playerStats={mockPlayerStats}
        enemyStats={mockEnemyStats}
        onAttack={() => {}}
      />
    )

    expect(screen.getByText('TURN 1')).toBeInTheDocument()
  })

  it('プレイヤーステータスが表示される', () => {
    render(
      <BattleScreen
        playerField={mockPlayerField}
        enemyField={mockEnemyField}
        currentTurn={Turn.PLAYER}
        turnNumber={1}
        playerStats={mockPlayerStats}
        enemyStats={mockEnemyStats}
        onAttack={() => {}}
      />
    )

    expect(screen.getByText('ジャック刑事')).toBeInTheDocument()
    expect(screen.getByText('80 / 100')).toBeInTheDocument()
  })

  it('敵ステータスが表示される', () => {
    render(
      <BattleScreen
        playerField={mockPlayerField}
        enemyField={mockEnemyField}
        currentTurn={Turn.PLAYER}
        turnNumber={1}
        playerStats={mockPlayerStats}
        enemyStats={mockEnemyStats}
        onAttack={() => {}}
      />
    )

    expect(screen.getByText('山田組')).toBeInTheDocument()
    expect(screen.getByText('60 / 100')).toBeInTheDocument()
  })

  it('プレイヤーターンの時に攻撃ボタンが表示される', () => {
    render(
      <BattleScreen
        playerField={mockPlayerField}
        enemyField={mockEnemyField}
        currentTurn={Turn.PLAYER}
        turnNumber={1}
        playerStats={mockPlayerStats}
        enemyStats={mockEnemyStats}
        onAttack={() => {}}
      />
    )

    expect(screen.getByText('攻撃')).toBeInTheDocument()
  })

  it('敵ターンの時は攻撃ボタンが表示されない', () => {
    render(
      <BattleScreen
        playerField={mockPlayerField}
        enemyField={mockEnemyField}
        currentTurn={Turn.ENEMY}
        turnNumber={1}
        playerStats={mockPlayerStats}
        enemyStats={mockEnemyStats}
        onAttack={() => {}}
      />
    )

    expect(screen.queryByText('攻撃')).not.toBeInTheDocument()
  })

  it('特殊攻撃が使用可能な時は特殊攻撃ボタンが表示される', () => {
    const mockSpecialAttacks = [
      {
        unitId: 'unit1',
        name: '強力射撃',
        spCost: 30,
        canUse: true,
      },
    ]

    render(
      <BattleScreen
        playerField={mockPlayerField}
        enemyField={mockEnemyField}
        currentTurn={Turn.PLAYER}
        turnNumber={1}
        playerStats={mockPlayerStats}
        enemyStats={mockEnemyStats}
        availableSpecialAttacks={mockSpecialAttacks}
        onAttack={() => {}}
      />
    )

    expect(screen.getByText('特殊攻撃')).toBeInTheDocument()
  })

  it('ターン終了ボタンが表示され、クリックするとonEndTurnが呼ばれる', () => {
    const handleEndTurn = vi.fn()

    render(
      <BattleScreen
        playerField={mockPlayerField}
        enemyField={mockEnemyField}
        currentTurn={Turn.PLAYER}
        turnNumber={1}
        playerStats={mockPlayerStats}
        enemyStats={mockEnemyStats}
        onAttack={() => {}}
        onEndTurn={handleEndTurn}
      />
    )

    const endTurnButton = screen.getByText('ターン終了')
    fireEvent.click(endTurnButton)

    expect(handleEndTurn).toHaveBeenCalledTimes(1)
  })
})

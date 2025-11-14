import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlacementScreen, PlacementUnit } from '@/components/screens/PlacementScreen'
import { createEmptyGrid } from '@/lib/utils/grid'

describe('PlacementScreen', () => {
  const mockField = {
    size: { width: 3, height: 3 },
    cells: createEmptyGrid({ width: 3, height: 3 }),
    placedUnits: [],
  }

  const mockUnits: PlacementUnit[] = [
    { id: 'unit1', name: 'ユニット1', placed: false },
    { id: 'unit2', name: 'ユニット2', placed: true },
  ]

  it('PlacementScreenがレンダリングされる', () => {
    render(
      <PlacementScreen
        field={mockField}
        availableUnits={mockUnits}
        onPlaceUnit={() => true}
        onRemoveUnit={() => {}}
        onStartBattle={() => {}}
      />
    )

    expect(screen.getByText('部隊配置')).toBeInTheDocument()
  })

  it('配置済みカウントが表示される', () => {
    render(
      <PlacementScreen
        field={mockField}
        availableUnits={mockUnits}
        onPlaceUnit={() => true}
        onRemoveUnit={() => {}}
        onStartBattle={() => {}}
      />
    )

    expect(screen.getByText('配置済み: 1 / 2')).toBeInTheDocument()
  })

  it('ユニット一覧が表示される', () => {
    render(
      <PlacementScreen
        field={mockField}
        availableUnits={mockUnits}
        onPlaceUnit={() => true}
        onRemoveUnit={() => {}}
        onStartBattle={() => {}}
      />
    )

    expect(screen.getByText('ユニット1')).toBeInTheDocument()
    expect(screen.getByText('ユニット2')).toBeInTheDocument()
  })

  it('配置済みユニットにマークが表示される', () => {
    render(
      <PlacementScreen
        field={mockField}
        availableUnits={mockUnits}
        onPlaceUnit={() => true}
        onRemoveUnit={() => {}}
        onStartBattle={() => {}}
      />
    )

    expect(screen.getByText('配置済み')).toBeInTheDocument()
  })

  it('ユニット未配置の時は戦闘開始ボタンが無効', () => {
    const emptyUnits: PlacementUnit[] = [
      { id: 'unit1', name: 'ユニット1', placed: false },
    ]

    render(
      <PlacementScreen
        field={mockField}
        availableUnits={emptyUnits}
        onPlaceUnit={() => true}
        onRemoveUnit={() => {}}
        onStartBattle={() => {}}
      />
    )

    const battleButton = screen.getByText('戦闘開始')
    expect(battleButton).toBeDisabled()
  })

  it('ユニット配置済みの時は戦闘開始ボタンが有効', () => {
    render(
      <PlacementScreen
        field={mockField}
        availableUnits={mockUnits}
        onPlaceUnit={() => true}
        onRemoveUnit={() => {}}
        onStartBattle={() => {}}
      />
    )

    const battleButton = screen.getByText('戦闘開始')
    expect(battleButton).not.toBeDisabled()
  })

  it('戦闘開始ボタンをクリックするとonStartBattleが呼ばれる', () => {
    const handleStartBattle = vi.fn()
    render(
      <PlacementScreen
        field={mockField}
        availableUnits={mockUnits}
        onPlaceUnit={() => true}
        onRemoveUnit={() => {}}
        onStartBattle={handleStartBattle}
      />
    )

    const battleButton = screen.getByText('戦闘開始')
    fireEvent.click(battleButton)

    expect(handleStartBattle).toHaveBeenCalledTimes(1)
  })

  it('戻るボタンが表示され、クリックするとonBackが呼ばれる', () => {
    const handleBack = vi.fn()
    render(
      <PlacementScreen
        field={mockField}
        availableUnits={mockUnits}
        onPlaceUnit={() => true}
        onRemoveUnit={() => {}}
        onStartBattle={() => {}}
        onBack={handleBack}
      />
    )

    const backButton = screen.getByText('戻る')
    fireEvent.click(backButton)

    expect(handleBack).toHaveBeenCalledTimes(1)
  })
})

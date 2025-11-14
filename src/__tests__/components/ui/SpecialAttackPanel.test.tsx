import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SpecialAttackPanel, SpecialAttack } from '@/components/ui/SpecialAttackPanel'

describe('SpecialAttackPanel', () => {
  const mockAttacks: SpecialAttack[] = [
    {
      unitId: 'unit1',
      name: '強力射撃',
      spCost: 30,
      canUse: true,
      description: '強力な攻撃を行う',
    },
    {
      unitId: 'unit2',
      name: '範囲攻撃',
      spCost: 50,
      canUse: false,
      description: '広範囲に攻撃を行う',
    },
  ]

  it('isOpenがfalseの時は何も表示されない', () => {
    render(
      <SpecialAttackPanel
        isOpen={false}
        availableAttacks={mockAttacks}
        currentSp={50}
        onSelectAttack={() => {}}
        onClose={() => {}}
      />
    )

    expect(screen.queryByText('特殊攻撃選択')).not.toBeInTheDocument()
  })

  it('isOpenがtrueの時にパネルが表示される', () => {
    render(
      <SpecialAttackPanel
        isOpen={true}
        availableAttacks={mockAttacks}
        currentSp={50}
        onSelectAttack={() => {}}
        onClose={() => {}}
      />
    )

    expect(screen.getByText('特殊攻撃選択')).toBeInTheDocument()
  })

  it('現在のSPが表示される', () => {
    render(
      <SpecialAttackPanel
        isOpen={true}
        availableAttacks={mockAttacks}
        currentSp={75}
        onSelectAttack={() => {}}
        onClose={() => {}}
      />
    )

    expect(screen.getByText('75')).toBeInTheDocument()
  })

  it('特殊攻撃一覧が表示される', () => {
    render(
      <SpecialAttackPanel
        isOpen={true}
        availableAttacks={mockAttacks}
        currentSp={50}
        onSelectAttack={() => {}}
        onClose={() => {}}
      />
    )

    expect(screen.getByText('強力射撃')).toBeInTheDocument()
    expect(screen.getByText('範囲攻撃')).toBeInTheDocument()
  })

  it('SPコストが表示される', () => {
    render(
      <SpecialAttackPanel
        isOpen={true}
        availableAttacks={mockAttacks}
        currentSp={50}
        onSelectAttack={() => {}}
        onClose={() => {}}
      />
    )

    expect(screen.getByText('SP 30')).toBeInTheDocument()
    expect(screen.getByText('SP 50')).toBeInTheDocument()
  })

  it('説明が表示される', () => {
    render(
      <SpecialAttackPanel
        isOpen={true}
        availableAttacks={mockAttacks}
        currentSp={50}
        onSelectAttack={() => {}}
        onClose={() => {}}
      />
    )

    expect(screen.getByText('強力な攻撃を行う')).toBeInTheDocument()
    expect(screen.getByText('広範囲に攻撃を行う')).toBeInTheDocument()
  })

  it('使用可能な攻撃をクリックするとonSelectAttackが呼ばれる', () => {
    const handleSelectAttack = vi.fn()
    render(
      <SpecialAttackPanel
        isOpen={true}
        availableAttacks={mockAttacks}
        currentSp={50}
        onSelectAttack={handleSelectAttack}
        onClose={() => {}}
      />
    )

    const attackButton = screen.getByText('強力射撃').closest('button')
    fireEvent.click(attackButton!)

    expect(handleSelectAttack).toHaveBeenCalledWith('unit1')
  })

  it('使用不可の攻撃はクリックできない', () => {
    const handleSelectAttack = vi.fn()
    render(
      <SpecialAttackPanel
        isOpen={true}
        availableAttacks={mockAttacks}
        currentSp={50}
        onSelectAttack={handleSelectAttack}
        onClose={() => {}}
      />
    )

    const attackButton = screen.getByText('範囲攻撃').closest('button')
    expect(attackButton).toBeDisabled()

    fireEvent.click(attackButton!)
    expect(handleSelectAttack).not.toHaveBeenCalled()
  })

  it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
    const handleClose = vi.fn()
    render(
      <SpecialAttackPanel
        isOpen={true}
        availableAttacks={mockAttacks}
        currentSp={50}
        onSelectAttack={() => {}}
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
      <SpecialAttackPanel
        isOpen={true}
        availableAttacks={mockAttacks}
        currentSp={50}
        onSelectAttack={() => {}}
        onClose={handleClose}
      />
    )

    const cancelButton = screen.getByText('キャンセル')
    fireEvent.click(cancelButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('オーバーレイをクリックするとonCloseが呼ばれる', () => {
    const handleClose = vi.fn()
    const { container } = render(
      <SpecialAttackPanel
        isOpen={true}
        availableAttacks={mockAttacks}
        currentSp={50}
        onSelectAttack={() => {}}
        onClose={handleClose}
      />
    )

    const overlay = container.querySelector('.fixed.inset-0.bg-black')
    fireEvent.click(overlay!)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('特殊攻撃が空の時はメッセージが表示される', () => {
    render(
      <SpecialAttackPanel
        isOpen={true}
        availableAttacks={[]}
        currentSp={50}
        onSelectAttack={() => {}}
        onClose={() => {}}
      />
    )

    expect(
      screen.getByText('使用可能な特殊攻撃がありません')
    ).toBeInTheDocument()
  })
})

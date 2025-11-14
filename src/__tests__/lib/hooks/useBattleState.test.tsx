import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBattleState } from '@/lib/hooks/useBattleState'
import { useBattleStore } from '@/stores/battleStore'
import { BattlePhase, Turn } from '@/lib/types/enums'

describe('useBattleState', () => {
  beforeEach(() => {
    // ストアをリセット
    const store = useBattleStore.getState()
    store.resetBattle()
  })

  it('初期状態を返す', () => {
    const { result } = renderHook(() => useBattleState())

    expect(result.current.phase).toBe(BattlePhase.PLACEMENT)
    expect(result.current.turn).toBe(Turn.PLAYER)
    expect(result.current.isPlayerTurn).toBe(true)
    expect(result.current.isEnemyTurn).toBe(false)
    expect(result.current.isAnimating).toBe(false)
  })

  it('HP情報を返す', () => {
    const { result } = renderHook(() => useBattleState())

    expect(result.current.playerHP).toBeGreaterThan(0)
    expect(result.current.playerMaxHP).toBeGreaterThan(0)
    expect(result.current.enemyHP).toBeGreaterThan(0)
    expect(result.current.enemyMaxHP).toBeGreaterThan(0)
  })

  it('SP情報を返す', () => {
    const { result } = renderHook(() => useBattleState())

    expect(result.current.playerSP).toBeGreaterThanOrEqual(0)
    expect(result.current.playerMaxSP).toBeGreaterThan(0)
  })

  it('プレイヤーのターンかどうかを正しく判定', () => {
    const { result } = renderHook(() => useBattleState())

    expect(result.current.isPlayerTurn).toBe(true)
    expect(result.current.isEnemyTurn).toBe(false)

    // ターン切り替え
    act(() => {
      result.current.switchTurn()
    })

    expect(result.current.isPlayerTurn).toBe(false)
    expect(result.current.isEnemyTurn).toBe(true)
  })

  it('攻撃可能かどうかを正しく判定', () => {
    const { result } = renderHook(() => useBattleState())

    // 配置フェーズでは攻撃不可
    expect(result.current.canAttack).toBe(false)

    // 戦闘フェーズに移行
    act(() => {
      useBattleStore.getState().setPhase(BattlePhase.BATTLE)
    })

    // プレイヤーのターンかつアニメーション中でなければ攻撃可能
    expect(result.current.canAttack).toBe(true)
  })

  it('敵のターンでは攻撃不可', () => {
    const { result } = renderHook(() => useBattleState())

    // 戦闘フェーズに移行
    act(() => {
      useBattleStore.getState().setPhase(BattlePhase.BATTLE)
    })

    // 敵のターンに切り替え
    act(() => {
      result.current.switchTurn()
    })

    expect(result.current.canAttack).toBe(false)
  })

  it('アニメーション中は攻撃不可', () => {
    const { result } = renderHook(() => useBattleState())

    // 戦闘フェーズに移行
    act(() => {
      useBattleStore.getState().setPhase(BattlePhase.BATTLE)
      useBattleStore.setState({ isAnimating: true })
    })

    expect(result.current.canAttack).toBe(false)
  })

  it('switchTurnでターンが切り替わる', () => {
    const { result } = renderHook(() => useBattleState())

    expect(result.current.turn).toBe(Turn.PLAYER)

    act(() => {
      result.current.switchTurn()
    })

    expect(result.current.turn).toBe(Turn.ENEMY)

    act(() => {
      result.current.switchTurn()
    })

    expect(result.current.turn).toBe(Turn.PLAYER)
  })

  it('攻撃不可の場合、attack関数は何もしない', () => {
    const { result } = renderHook(() => useBattleState())

    // 配置フェーズでは攻撃不可
    expect(result.current.canAttack).toBe(false)

    const playerHPBefore = result.current.playerHP
    const enemyHPBefore = result.current.enemyHP

    // 攻撃を試みる
    act(() => {
      result.current.attack({ x: 0, y: 0 })
    })

    // HPは変化しない
    expect(result.current.playerHP).toBe(playerHPBefore)
    expect(result.current.enemyHP).toBe(enemyHPBefore)
  })
})

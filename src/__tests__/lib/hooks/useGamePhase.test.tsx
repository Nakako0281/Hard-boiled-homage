import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGamePhase } from '@/lib/hooks/useGamePhase'
import { useGameStore, GameScreen } from '@/stores/gameStore'

describe('useGamePhase', () => {
  beforeEach(() => {
    // ストアをリセット
    useGameStore.getState().navigateTo(GameScreen.TITLE)
  })

  it('初期状態でタイトル画面', () => {
    const { result } = renderHook(() => useGamePhase())

    expect(result.current.currentScreen).toBe(GameScreen.TITLE)
    expect(result.current.isTitleScreen).toBe(true)
  })

  it('navigateToで画面遷移できる', () => {
    const { result } = renderHook(() => useGamePhase())

    act(() => {
      result.current.navigateTo(GameScreen.CHARACTER_SELECT)
    })

    expect(result.current.currentScreen).toBe(GameScreen.CHARACTER_SELECT)
    expect(result.current.isCharacterSelectScreen).toBe(true)
    expect(result.current.isTitleScreen).toBe(false)
  })

  it('isScreenで特定の画面かどうか判定できる', () => {
    const { result } = renderHook(() => useGamePhase())

    expect(result.current.isScreen(GameScreen.TITLE)).toBe(true)
    expect(result.current.isScreen(GameScreen.BATTLE)).toBe(false)

    act(() => {
      result.current.navigateTo(GameScreen.BATTLE)
    })

    expect(result.current.isScreen(GameScreen.BATTLE)).toBe(true)
    expect(result.current.isScreen(GameScreen.TITLE)).toBe(false)
  })

  it('各画面の判定フラグが正しく機能する', () => {
    const { result } = renderHook(() => useGamePhase())

    const screens: [GameScreen, keyof typeof result.current][] = [
      [GameScreen.TITLE, 'isTitleScreen'],
      [GameScreen.CHARACTER_SELECT, 'isCharacterSelectScreen'],
      [GameScreen.ENEMY_SELECT, 'isEnemySelectScreen'],
      [GameScreen.SHOP, 'isShopScreen'],
      [GameScreen.LEVELUP, 'isLevelUpScreen'],
      [GameScreen.PLACEMENT, 'isPlacementScreen'],
      [GameScreen.BATTLE, 'isBattleScreen'],
      [GameScreen.RESULT, 'isResultScreen'],
      [GameScreen.MENU, 'isMenuScreen'],
    ]

    screens.forEach(([screen, flag]) => {
      act(() => {
        result.current.navigateTo(screen)
      })

      expect(result.current[flag]).toBe(true)
      expect(result.current.currentScreen).toBe(screen)
    })
  })

  it('画面遷移時、他の画面フラグはfalseになる', () => {
    const { result } = renderHook(() => useGamePhase())

    act(() => {
      result.current.navigateTo(GameScreen.BATTLE)
    })

    expect(result.current.isBattleScreen).toBe(true)
    expect(result.current.isTitleScreen).toBe(false)
    expect(result.current.isCharacterSelectScreen).toBe(false)
    expect(result.current.isEnemySelectScreen).toBe(false)
    expect(result.current.isShopScreen).toBe(false)
    expect(result.current.isLevelUpScreen).toBe(false)
    expect(result.current.isPlacementScreen).toBe(false)
    expect(result.current.isResultScreen).toBe(false)
    expect(result.current.isMenuScreen).toBe(false)
  })
})

import { useGameStore, GameScreen } from '@/stores/gameStore'
import { useCallback } from 'react'

/**
 * ゲームフェーズ管理フック
 */
export interface UseGamePhaseReturn {
  currentScreen: GameScreen
  navigateTo: (screen: GameScreen) => void
  isScreen: (screen: GameScreen) => boolean
  isTitleScreen: boolean
  isCharacterSelectScreen: boolean
  isEnemySelectScreen: boolean
  isShopScreen: boolean
  isLevelUpScreen: boolean
  isPlacementScreen: boolean
  isBattleScreen: boolean
  isResultScreen: boolean
  isMenuScreen: boolean
}

/**
 * ゲームフェーズ管理を提供するカスタムフック
 */
export function useGamePhase(): UseGamePhaseReturn {
  const currentScreen = useGameStore((state) => state.currentScreen)
  const navigateTo = useGameStore((state) => state.navigateTo)

  const isScreen = useCallback(
    (screen: GameScreen) => currentScreen === screen,
    [currentScreen]
  )

  return {
    currentScreen,
    navigateTo,
    isScreen,
    isTitleScreen: currentScreen === GameScreen.TITLE,
    isCharacterSelectScreen: currentScreen === GameScreen.CHARACTER_SELECT,
    isEnemySelectScreen: currentScreen === GameScreen.ENEMY_SELECT,
    isShopScreen: currentScreen === GameScreen.SHOP,
    isLevelUpScreen: currentScreen === GameScreen.LEVELUP,
    isPlacementScreen: currentScreen === GameScreen.PLACEMENT,
    isBattleScreen: currentScreen === GameScreen.BATTLE,
    isResultScreen: currentScreen === GameScreen.RESULT,
    isMenuScreen: currentScreen === GameScreen.MENU,
  }
}

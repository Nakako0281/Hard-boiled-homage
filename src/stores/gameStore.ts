import { create } from 'zustand'
import { EnemyId } from '@/lib/types/enums'
import type { GameProgress, SaveData } from '@/lib/types/storage'
import { usePlayerStore } from './playerStore'

/**
 * ゲーム画面の列挙
 */
export enum GameScreen {
  TITLE = 'title', // タイトル画面
  CHARACTER_SELECT = 'character_select', // キャラクター選択
  ENEMY_SELECT = 'enemy_select', // 敵選択
  SHOP = 'shop', // ショップ
  LEVELUP = 'levelup', // レベルアップ
  PLACEMENT = 'placement', // 部隊配置
  BATTLE = 'battle', // 戦闘
  RESULT = 'result', // 戦闘結果
  MENU = 'menu', // メニュー
}

/**
 * ゲームストアの状態
 */
interface GameState {
  // 画面管理
  currentScreen: GameScreen

  // ゲーム進行状況
  progress: GameProgress

  // 現在選択中の敵
  selectedEnemy: EnemyId | null

  // ロード状態
  isLoading: boolean

  // 初回起動かどうか
  isFirstLaunch: boolean
}

/**
 * ゲームストアのアクション
 */
interface GameActions {
  // 画面遷移
  navigateTo: (screen: GameScreen) => void

  // 敵選択
  selectEnemy: (enemyId: EnemyId) => void
  clearSelectedEnemy: () => void

  // 進行状況更新
  markEnemyAsDefeated: (enemyId: EnemyId) => void
  incrementBattleCount: (isVictory: boolean) => void

  // セーブ/ロード
  saveGame: () => Promise<void>
  loadGame: () => Promise<boolean>
  resetGame: () => void

  // 初期化
  initializeGame: () => Promise<void>
}

/**
 * セーブデータキー
 */
const SAVE_KEY = 'hardboiled-game-save'

/**
 * セーブデータのバリデーション
 */
function isValidSaveData(data: unknown): data is SaveData {
  if (!data || typeof data !== 'object') return false

  const save = data as SaveData
  return !!(
    save.version &&
    save.lastSaved &&
    save.player &&
    save.progress
  )
}

/**
 * ゲームストア
 */
export const useGameStore = create<GameState & GameActions>((set, get) => ({
  // State
  currentScreen: GameScreen.TITLE,
  progress: {
    defeatedEnemies: [],
    currentEnemy: undefined,
    totalBattles: 0,
    totalVictories: 0,
    totalDefeats: 0,
  },
  selectedEnemy: null,
  isLoading: false,
  isFirstLaunch: true,

  // Actions
  navigateTo: (screen) => set({ currentScreen: screen }),

  selectEnemy: (enemyId) =>
    set((state) => ({
      selectedEnemy: enemyId,
      progress: { ...state.progress, currentEnemy: enemyId },
    })),

  clearSelectedEnemy: () =>
    set((state) => ({
      selectedEnemy: null,
      progress: { ...state.progress, currentEnemy: undefined },
    })),

  markEnemyAsDefeated: (enemyId) =>
    set((state) => ({
      progress: {
        ...state.progress,
        defeatedEnemies: [...state.progress.defeatedEnemies, enemyId],
      },
    })),

  incrementBattleCount: (isVictory) =>
    set((state) => ({
      progress: {
        ...state.progress,
        totalBattles: state.progress.totalBattles + 1,
        totalVictories: isVictory
          ? state.progress.totalVictories + 1
          : state.progress.totalVictories,
        totalDefeats: !isVictory
          ? state.progress.totalDefeats + 1
          : state.progress.totalDefeats,
      },
    })),

  saveGame: async () => {
    const state = get()
    const playerData = usePlayerStore.getState().getPlayerData()

    const saveData: SaveData = {
      version: '1.0',
      lastSaved: new Date().toISOString(),
      player: playerData,
      progress: state.progress,
    }

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
    } catch (error) {
      console.error('Failed to save game:', error)
      throw error
    }
  },

  loadGame: async () => {
    try {
      const data = localStorage.getItem(SAVE_KEY)
      if (!data) return false

      const parsed = JSON.parse(data)
      if (!isValidSaveData(parsed)) {
        console.error('Invalid save data')
        return false
      }

      // プレイヤーデータをロード
      usePlayerStore.getState().loadPlayerData(parsed.player)

      // ゲーム進行状況をロード
      set({
        progress: parsed.progress,
        selectedEnemy: parsed.progress.currentEnemy || null,
      })

      return true
    } catch (error) {
      console.error('Failed to load save data:', error)
      return false
    }
  },

  resetGame: () => {
    // ゲームを初期状態にリセット
    set({
      currentScreen: GameScreen.TITLE,
      progress: {
        defeatedEnemies: [],
        currentEnemy: undefined,
        totalBattles: 0,
        totalVictories: 0,
        totalDefeats: 0,
      },
      selectedEnemy: null,
      isFirstLaunch: true,
    })

    // プレイヤーデータもリセット
    usePlayerStore.getState().resetPlayer()

    // セーブデータを削除
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch (error) {
      console.error('Failed to remove save data:', error)
    }
  },

  initializeGame: async () => {
    set({ isLoading: true })
    const hasData = await get().loadGame()
    set({
      isLoading: false,
      isFirstLaunch: !hasData,
    })
  },
}))

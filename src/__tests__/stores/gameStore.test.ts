import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, GameScreen } from '@/stores/gameStore'
import { EnemyId } from '@/lib/types/enums'

describe('gameStore', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    useGameStore.getState().resetGame()
  })

  describe('初期化', () => {
    it('初期状態が正しく設定されている', () => {
      const state = useGameStore.getState()

      expect(state.currentScreen).toBe(GameScreen.TITLE)
      expect(state.selectedEnemy).toBeNull()
      expect(state.progress.defeatedEnemies).toEqual([])
      expect(state.progress.totalBattles).toBe(0)
      expect(state.isFirstLaunch).toBe(true)
    })
  })

  describe('画面遷移', () => {
    it('画面を遷移できる', () => {
      const { navigateTo } = useGameStore.getState()

      navigateTo(GameScreen.CHARACTER_SELECT)

      expect(useGameStore.getState().currentScreen).toBe(
        GameScreen.CHARACTER_SELECT
      )
    })
  })

  describe('敵選択', () => {
    it('敵を選択できる', () => {
      const { selectEnemy } = useGameStore.getState()

      selectEnemy(EnemyId.CARRIER_A)

      const state = useGameStore.getState()
      expect(state.selectedEnemy).toBe(EnemyId.CARRIER_A)
      expect(state.progress.currentEnemy).toBe(EnemyId.CARRIER_A)
    })

    it('敵選択をクリアできる', () => {
      const { selectEnemy, clearSelectedEnemy } = useGameStore.getState()

      selectEnemy(EnemyId.CARRIER_A)
      clearSelectedEnemy()

      const state = useGameStore.getState()
      expect(state.selectedEnemy).toBeNull()
      expect(state.progress.currentEnemy).toBeUndefined()
    })
  })

  describe('進行状況管理', () => {
    it('敵を撃破済みにマークできる', () => {
      const { markEnemyAsDefeated } = useGameStore.getState()

      markEnemyAsDefeated(EnemyId.CARRIER_A)

      expect(useGameStore.getState().progress.defeatedEnemies).toContain(
        EnemyId.CARRIER_A
      )
    })

    it('戦闘回数を増加させる（勝利）', () => {
      const { incrementBattleCount } = useGameStore.getState()

      incrementBattleCount(true)

      const state = useGameStore.getState()
      expect(state.progress.totalBattles).toBe(1)
      expect(state.progress.totalVictories).toBe(1)
      expect(state.progress.totalDefeats).toBe(0)
    })

    it('戦闘回数を増加させる（敗北）', () => {
      const { incrementBattleCount } = useGameStore.getState()

      incrementBattleCount(false)

      const state = useGameStore.getState()
      expect(state.progress.totalBattles).toBe(1)
      expect(state.progress.totalVictories).toBe(0)
      expect(state.progress.totalDefeats).toBe(1)
    })

    it('複数回の戦闘を記録できる', () => {
      const { incrementBattleCount } = useGameStore.getState()

      incrementBattleCount(true)
      incrementBattleCount(true)
      incrementBattleCount(false)

      const state = useGameStore.getState()
      expect(state.progress.totalBattles).toBe(3)
      expect(state.progress.totalVictories).toBe(2)
      expect(state.progress.totalDefeats).toBe(1)
    })
  })

  describe('リセット', () => {
    it('ゲームをリセットできる', () => {
      const {
        selectEnemy,
        markEnemyAsDefeated,
        incrementBattleCount,
        resetGame,
      } = useGameStore.getState()

      // データを変更
      selectEnemy(EnemyId.CARRIER_A)
      markEnemyAsDefeated(EnemyId.CARRIER_A)
      incrementBattleCount(true)

      // リセット
      resetGame()

      const state = useGameStore.getState()
      expect(state.currentScreen).toBe(GameScreen.TITLE)
      expect(state.selectedEnemy).toBeNull()
      expect(state.progress.defeatedEnemies).toEqual([])
      expect(state.progress.totalBattles).toBe(0)
      expect(state.isFirstLaunch).toBe(true)
    })
  })
})

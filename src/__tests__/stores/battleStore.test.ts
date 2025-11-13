import { describe, it, expect, beforeEach } from 'vitest'
import { useBattleStore } from '@/stores/battleStore'
import { BattlePhase, Turn, CellState, AIType, EnemyId } from '@/lib/types/enums'
import type { Enemy } from '@/lib/types/enemy'

describe('battleStore', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    useBattleStore.getState().resetBattle()
  })

  // モック敵データ
  const mockEnemy: Enemy = {
    id: EnemyId.CARRIER_A,
    name: '運び屋A',
    stats: {
      HP: 100,
      maxHP: 100,
      SP: 50,
      maxSP: 50,
      AT: 10,
      DF: 5,
      AR: 1,
    },
    units: ['ambulance'],
    aiType: AIType.BALANCED,
    baseReward: 100,
    description: 'テスト用の敵',
    difficulty: 'easy',
  }

  describe('初期化', () => {
    it('初期状態が正しく設定されている', () => {
      const state = useBattleStore.getState()

      expect(state.phase).toBe(BattlePhase.PLACEMENT)
      expect(state.turn).toBe(Turn.PLAYER)
      expect(state.enemy).toBeNull()
      expect(state.attackHistory).toEqual([])
      expect(state.canContinueAttack).toBe(false)
    })

    it('戦闘を初期化できる', () => {
      const { initializeBattle } = useBattleStore.getState()

      initializeBattle(mockEnemy, [])

      const state = useBattleStore.getState()
      expect(state.phase).toBe(BattlePhase.BATTLE)
      expect(state.enemy).toEqual(mockEnemy)
      expect(state.enemyStats).toEqual(mockEnemy.stats)
    })
  })

  describe('フェーズ制御', () => {
    it('フェーズを変更できる', () => {
      const { setPhase } = useBattleStore.getState()

      setPhase(BattlePhase.BATTLE)

      expect(useBattleStore.getState().phase).toBe(BattlePhase.BATTLE)
    })

    it('ターンを切り替えられる', () => {
      const { switchTurn } = useBattleStore.getState()

      switchTurn()

      let state = useBattleStore.getState()
      expect(state.turn).toBe(Turn.ENEMY)
      expect(state.canContinueAttack).toBe(false)
      expect(state.consecutiveHits).toBe(0)

      switchTurn()

      state = useBattleStore.getState()
      expect(state.turn).toBe(Turn.PLAYER)
    })
  })

  describe('位置検証', () => {
    it('有効な位置を判定できる', () => {
      const { isValidPosition } = useBattleStore.getState()

      expect(isValidPosition({ x: 0, y: 0 }, { width: 7, height: 7 })).toBe(
        true
      )
      expect(isValidPosition({ x: 6, y: 6 }, { width: 7, height: 7 })).toBe(
        true
      )
      expect(isValidPosition({ x: -1, y: 0 }, { width: 7, height: 7 })).toBe(
        false
      )
      expect(isValidPosition({ x: 7, y: 0 }, { width: 7, height: 7 })).toBe(
        false
      )
      expect(isValidPosition({ x: 0, y: 7 }, { width: 7, height: 7 })).toBe(
        false
      )
    })
  })

  describe('セル状態管理', () => {
    it('セルの状態を取得できる', () => {
      const { getCellState, playerField } = useBattleStore.getState()

      const state = getCellState({ x: 0, y: 0 }, playerField)

      expect(state).toBe(CellState.UNEXPLORED)
    })

    it('HIT処理でセル状態が更新される', () => {
      const { processHit, getCellState } = useBattleStore.getState()

      processHit({ x: 2, y: 3 }, 'player')

      const playerField = useBattleStore.getState().playerField
      const state = getCellState({ x: 2, y: 3 }, playerField)
      expect(state).toBe(CellState.HIT)
    })

    it('MISS処理でセル状態が更新される', () => {
      const { processMiss, getCellState } = useBattleStore.getState()

      processMiss({ x: 1, y: 1 }, 'player')

      const playerField = useBattleStore.getState().playerField
      const state = getCellState({ x: 1, y: 1 }, playerField)
      expect(state).toBe(CellState.MISS)
    })
  })

  describe('ダメージ計算', () => {
    it('ダメージを計算できる', () => {
      const { calculateDamage } = useBattleStore.getState()

      const damage = calculateDamage('player')

      // AT=10 なので、ランダム係数を考慮して 9-11 の範囲
      expect(damage).toBeGreaterThanOrEqual(9)
      expect(damage).toBeLessThanOrEqual(11)
    })

    it('ダメージを適用できる', () => {
      const { applyDamage, playerStats } = useBattleStore.getState()
      const initialHP = playerStats.HP

      applyDamage('player', 20)

      expect(useBattleStore.getState().playerStats.HP).toBe(initialHP - 20)
    })

    it('ダメージでHPが0未満にならない', () => {
      const { applyDamage } = useBattleStore.getState()

      applyDamage('player', 200)

      expect(useBattleStore.getState().playerStats.HP).toBe(0)
    })
  })

  describe('勝敗判定', () => {
    it('敵のHPが0の場合、プレイヤー勝利', () => {
      const { applyDamage, checkVictory } = useBattleStore.getState()

      applyDamage('enemy', 200)

      expect(checkVictory()).toBe('player')
    })

    it('プレイヤーのHPが0の場合、敵勝利', () => {
      const { applyDamage, checkVictory } = useBattleStore.getState()

      applyDamage('player', 200)

      expect(checkVictory()).toBe('enemy')
    })

    it('まだ決着がついていない場合はnull', () => {
      const { checkVictory } = useBattleStore.getState()

      expect(checkVictory()).toBeNull()
    })
  })

  describe('アニメーション制御', () => {
    it('アニメーションを設定できる', () => {
      const { setAnimation } = useBattleStore.getState()

      setAnimation('hit', { x: 2, y: 3 })

      const state = useBattleStore.getState()
      expect(state.isAnimating).toBe(true)
      expect(state.currentAnimation.type).toBe('hit')
      expect(state.currentAnimation.position).toEqual({ x: 2, y: 3 })
    })

    it('アニメーションをクリアできる', () => {
      const { setAnimation, clearAnimation } = useBattleStore.getState()

      setAnimation('miss', { x: 1, y: 1 })
      clearAnimation()

      const state = useBattleStore.getState()
      expect(state.isAnimating).toBe(false)
      expect(state.currentAnimation.type).toBeNull()
    })
  })
})

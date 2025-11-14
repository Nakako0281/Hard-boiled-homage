import { describe, it, expect, beforeEach } from 'vitest'
import {
  checkVictory,
  areAllUnitsDestroyed,
  applyVictoryResult,
  isPlayerVictory,
  isPlayerDefeat,
  getVictoryMessage,
  VictoryReason,
} from '@/lib/game/victory'
import { createEmptyGrid } from '@/lib/utils/grid'
import {
  BattlePhase,
  Turn,
  Rotation,
  AIType,
  EnemyId,
} from '@/lib/types/enums'
import type { BattleState } from '@/lib/types/battle'
import type { Field } from '@/lib/types/grid'

describe('victory logic', () => {
  let mockState: BattleState

  beforeEach(() => {
    mockState = {
      phase: BattlePhase.BATTLE,
      turn: Turn.PLAYER,
      playerField: {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [
          {
            unitId: 'ambulance',
            position: { x: 0, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ],
            hitCells: [],
            isDestroyed: false,
          },
        ],
      },
      enemyField: {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [
          {
            unitId: 'ambulance',
            position: { x: 0, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ],
            hitCells: [],
            isDestroyed: false,
          },
        ],
      },
      playerStats: {
        HP: 100,
        maxHP: 100,
        SP: 50,
        maxSP: 50,
        AT: 10,
        DF: 5,
        AR: 1,
      },
      enemyStats: {
        HP: 100,
        maxHP: 100,
        SP: 50,
        maxSP: 50,
        AT: 10,
        DF: 5,
        AR: 1,
      },
      enemy: {
        id: EnemyId.CARRIER_A,
        name: 'Test Enemy',
        stats: {
          HP: 100,
          maxHP: 100,
          SP: 50,
          maxSP: 50,
          AT: 10,
          DF: 5,
          AR: 1,
        },
        units: [],
        aiType: AIType.BALANCED,
        baseReward: 100,
        description: 'Test',
        difficulty: 'easy',
      },
      attackHistory: [],
      canContinueAttack: false,
      consecutiveHits: 0,
      activeSpecialAttack: { type: null },
      specialAttackUsageCount: { player: {}, enemy: {} },
    }
  })

  describe('checkVictory', () => {
    it('通常時は勝敗なし', () => {
      const result = checkVictory(mockState)

      expect(result.isGameOver).toBe(false)
      expect(result.winner).toBeNull()
      expect(result.reason).toBeNull()
    })

    it('プレイヤーのHP0で敗北', () => {
      mockState.playerStats.HP = 0

      const result = checkVictory(mockState)

      expect(result.isGameOver).toBe(true)
      expect(result.winner).toBe(Turn.ENEMY)
      expect(result.reason).toBe(VictoryReason.HP_ZERO)
    })

    it('敵のHP0で勝利', () => {
      mockState.enemyStats.HP = 0

      const result = checkVictory(mockState)

      expect(result.isGameOver).toBe(true)
      expect(result.winner).toBe(Turn.PLAYER)
      expect(result.reason).toBe(VictoryReason.HP_ZERO)
    })

    it('プレイヤーの全部隊破壊で敗北', () => {
      mockState.playerField.placedUnits[0].isDestroyed = true

      const result = checkVictory(mockState)

      expect(result.isGameOver).toBe(true)
      expect(result.winner).toBe(Turn.ENEMY)
      expect(result.reason).toBe(VictoryReason.ALL_UNITS_DESTROYED)
    })

    it('敵の全部隊破壊で勝利', () => {
      mockState.enemyField.placedUnits[0].isDestroyed = true

      const result = checkVictory(mockState)

      expect(result.isGameOver).toBe(true)
      expect(result.winner).toBe(Turn.PLAYER)
      expect(result.reason).toBe(VictoryReason.ALL_UNITS_DESTROYED)
    })

    it('BATTLE以外のフェーズでは判定しない', () => {
      mockState.phase = BattlePhase.PLACEMENT
      mockState.enemyStats.HP = 0

      const result = checkVictory(mockState)

      expect(result.isGameOver).toBe(false)
    })

    it('HP0の判定が全部隊破壊より優先される', () => {
      mockState.playerStats.HP = 0
      mockState.playerField.placedUnits[0].isDestroyed = true

      const result = checkVictory(mockState)

      expect(result.isGameOver).toBe(true)
      expect(result.winner).toBe(Turn.ENEMY)
      expect(result.reason).toBe(VictoryReason.HP_ZERO)
    })
  })

  describe('areAllUnitsDestroyed', () => {
    it('全部隊破壊済みの場合true', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [
          {
            unitId: 'ambulance',
            position: { x: 0, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ],
            hitCells: [
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ],
            isDestroyed: true,
          },
        ],
      }

      const result = areAllUnitsDestroyed(field)

      expect(result).toBe(true)
    })

    it('一部の部隊が残っている場合false', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [
          {
            unitId: 'ambulance',
            position: { x: 0, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ],
            hitCells: [],
            isDestroyed: false,
          },
          {
            unitId: 'harrier',
            position: { x: 3, y: 3 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 3, y: 3 },
              { x: 4, y: 3 },
            ],
            hitCells: [
              { x: 3, y: 3 },
              { x: 4, y: 3 },
            ],
            isDestroyed: true,
          },
        ],
      }

      const result = areAllUnitsDestroyed(field)

      expect(result).toBe(false)
    })

    it('部隊が配置されていない場合false', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const result = areAllUnitsDestroyed(field)

      expect(result).toBe(false)
    })

    it('地雷のみ残っている場合true', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [
          {
            unitId: 'mine',
            position: { x: 0, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [{ x: 0, y: 0 }],
            hitCells: [],
            isDestroyed: false,
          },
          {
            unitId: 'mine',
            position: { x: 2, y: 2 },
            rotation: Rotation.DEG_0,
            occupiedCells: [{ x: 2, y: 2 }],
            hitCells: [],
            isDestroyed: false,
          },
        ],
      }

      const result = areAllUnitsDestroyed(field)

      expect(result).toBe(true)
    })

    it('地雷と通常部隊が混在している場合、通常部隊の破壊状況で判定', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [
          {
            unitId: 'mine',
            position: { x: 0, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [{ x: 0, y: 0 }],
            hitCells: [],
            isDestroyed: false,
          },
          {
            unitId: 'ambulance',
            position: { x: 2, y: 2 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 2, y: 2 },
              { x: 3, y: 2 },
            ],
            hitCells: [
              { x: 2, y: 2 },
              { x: 3, y: 2 },
            ],
            isDestroyed: true,
          },
        ],
      }

      const result = areAllUnitsDestroyed(field)

      expect(result).toBe(true)
    })
  })

  describe('applyVictoryResult', () => {
    it('勝利時にRESULTフェーズに遷移', () => {
      const result = {
        isGameOver: true,
        winner: Turn.PLAYER,
        reason: VictoryReason.HP_ZERO,
      }

      applyVictoryResult(mockState, result)

      expect(mockState.phase).toBe(BattlePhase.RESULT)
    })

    it('敗北時にRESULTフェーズに遷移', () => {
      const result = {
        isGameOver: true,
        winner: Turn.ENEMY,
        reason: VictoryReason.ALL_UNITS_DESTROYED,
      }

      applyVictoryResult(mockState, result)

      expect(mockState.phase).toBe(BattlePhase.RESULT)
    })

    it('勝敗なしの場合フェーズ遷移しない', () => {
      const result = {
        isGameOver: false,
        winner: null,
        reason: null,
      }

      applyVictoryResult(mockState, result)

      expect(mockState.phase).toBe(BattlePhase.BATTLE)
    })
  })

  describe('isPlayerVictory', () => {
    it('プレイヤー勝利時true', () => {
      mockState.enemyStats.HP = 0

      const result = isPlayerVictory(mockState)

      expect(result).toBe(true)
    })

    it('プレイヤー敗北時false', () => {
      mockState.playerStats.HP = 0

      const result = isPlayerVictory(mockState)

      expect(result).toBe(false)
    })

    it('勝敗なし時false', () => {
      const result = isPlayerVictory(mockState)

      expect(result).toBe(false)
    })
  })

  describe('isPlayerDefeat', () => {
    it('プレイヤー敗北時true', () => {
      mockState.playerStats.HP = 0

      const result = isPlayerDefeat(mockState)

      expect(result).toBe(true)
    })

    it('プレイヤー勝利時false', () => {
      mockState.enemyStats.HP = 0

      const result = isPlayerDefeat(mockState)

      expect(result).toBe(false)
    })

    it('勝敗なし時false', () => {
      const result = isPlayerDefeat(mockState)

      expect(result).toBe(false)
    })
  })

  describe('getVictoryMessage', () => {
    it('全部隊破壊で勝利時のメッセージ', () => {
      const message = getVictoryMessage(
        VictoryReason.ALL_UNITS_DESTROYED,
        Turn.PLAYER
      )

      expect(message).toBe('敵の全部隊を撃破しました！')
    })

    it('全部隊破壊で敗北時のメッセージ', () => {
      const message = getVictoryMessage(
        VictoryReason.ALL_UNITS_DESTROYED,
        Turn.ENEMY
      )

      expect(message).toBe('自軍の全部隊が撃破されました...')
    })

    it('HP0で勝利時のメッセージ', () => {
      const message = getVictoryMessage(VictoryReason.HP_ZERO, Turn.PLAYER)

      expect(message).toBe('敵のHPが0になりました！')
    })

    it('HP0で敗北時のメッセージ', () => {
      const message = getVictoryMessage(VictoryReason.HP_ZERO, Turn.ENEMY)

      expect(message).toBe('HPが0になりました...')
    })
  })
})

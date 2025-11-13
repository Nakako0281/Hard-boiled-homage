import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calculateAttackBonus,
  calculateDefenseBonus,
  calculateDirectDamage,
  calculateDestroyExp,
  calculateFinalExp,
  calculateBattleResult,
  calculateHealCost,
  calculateLevelUpCost,
  getGridSizeFromAR,
} from '@/lib/utils/combat'
import { StatType, BattlePhase, Turn, AIType, EnemyId, Rotation } from '@/lib/types/enums'
import type { PlacedUnit } from '@/lib/types/unit'
import type { BattleState } from '@/lib/types/battle'
import type { Enemy } from '@/lib/types/enemy'

describe('combat utilities', () => {
  describe('calculateAttackBonus', () => {
    it('補正なしの場合は0を返す', () => {
      const units: PlacedUnit[] = [
        {
          unitId: 'ambulance',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      expect(calculateAttackBonus(units)).toBe(0)
    })

    it('石油タンカーで+30%', () => {
      const units: PlacedUnit[] = [
        {
          unitId: 'oil_tanker',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      expect(calculateAttackBonus(units)).toBe(0.3)
    })

    it('M4戦車で+50%', () => {
      const units: PlacedUnit[] = [
        {
          unitId: 'm4_tank',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      expect(calculateAttackBonus(units)).toBe(0.5)
    })

    it('石油タンカー + M4戦車で+80%', () => {
      const units: PlacedUnit[] = [
        {
          unitId: 'oil_tanker',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
        {
          unitId: 'm4_tank',
          position: { x: 1, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 1, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      expect(calculateAttackBonus(units)).toBe(0.8)
    })

    it('巨大飛行艇でボーナス値が2倍', () => {
      const units: PlacedUnit[] = [
        {
          unitId: 'oil_tanker',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
        {
          unitId: 'giant_airship',
          position: { x: 1, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 1, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      expect(calculateAttackBonus(units)).toBe(0.6) // 0.3 * 2
    })

    it('破壊された部隊は効果なし', () => {
      const units: PlacedUnit[] = [
        {
          unitId: 'oil_tanker',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: true,
        },
      ]

      expect(calculateAttackBonus(units)).toBe(0)
    })
  })

  describe('calculateDefenseBonus', () => {
    it('補正なしの場合は0を返す', () => {
      const units: PlacedUnit[] = [
        {
          unitId: 'ambulance',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      expect(calculateDefenseBonus(units)).toBe(0)
    })

    it('消防車で+20%', () => {
      const units: PlacedUnit[] = [
        {
          unitId: 'fire_truck',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      expect(calculateDefenseBonus(units)).toBe(0.2)
    })

    it('ダンプで+30%', () => {
      const units: PlacedUnit[] = [
        {
          unitId: 'dump_truck',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      expect(calculateDefenseBonus(units)).toBe(0.3)
    })

    it('消防車 + ダンプで+50%', () => {
      const units: PlacedUnit[] = [
        {
          unitId: 'fire_truck',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
        {
          unitId: 'dump_truck',
          position: { x: 1, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 1, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      expect(calculateDefenseBonus(units)).toBe(0.5)
    })

    it('巨大飛行艇でボーナス値が2倍', () => {
      const units: PlacedUnit[] = [
        {
          unitId: 'fire_truck',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
        {
          unitId: 'giant_airship',
          position: { x: 1, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 1, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      expect(calculateDefenseBonus(units)).toBe(0.4) // 0.2 * 2
    })
  })

  describe('calculateDirectDamage', () => {
    let mockState: BattleState

    beforeEach(() => {
      mockState = {
        phase: BattlePhase.BATTLE,
        turn: Turn.PLAYER,
        playerField: {
          size: { width: 7, height: 7 },
          cells: [],
          placedUnits: [],
        },
        enemyField: {
          size: { width: 7, height: 7 },
          cells: [],
          placedUnits: [],
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

    it('基本ダメージを計算', () => {
      // ランダム要素をモック
      vi.spyOn(Math, 'random').mockReturnValue(0.5) // randomFactor = 1.0

      const damage = calculateDirectDamage('player', mockState)

      // AT(10) * randomFactor(1.0) - DF(5) = 5
      expect(damage).toBe(5)
    })

    it('最低1ダメージ保証', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      // 防御力が攻撃力を上回る場合
      mockState.playerStats.AT = 5
      mockState.enemyStats.DF = 10

      const damage = calculateDirectDamage('player', mockState)

      expect(damage).toBeGreaterThanOrEqual(1)
    })

    it('攻撃力補正が適用される', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      // 石油タンカーを配置
      mockState.playerField.placedUnits = [
        {
          unitId: 'oil_tanker',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      const damage = calculateDirectDamage('player', mockState)

      // AT(10) * (1 + 0.3) * randomFactor(1.0) - DF(5) = 8
      expect(damage).toBe(8)
    })

    it('防御力補正が適用される', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      // 消防車を配置
      mockState.enemyField.placedUnits = [
        {
          unitId: 'fire_truck',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      const damage = calculateDirectDamage('player', mockState)

      // AT(10) * randomFactor(1.0) - DF(5) * (1 + 0.2) = 10 - 6 = 4
      expect(damage).toBe(4)
    })
  })

  describe('calculateDestroyExp', () => {
    it('1マスあたり5EXPを計算', () => {
      expect(calculateDestroyExp(2)).toBe(10)
      expect(calculateDestroyExp(3)).toBe(15)
      expect(calculateDestroyExp(5)).toBe(25)
    })
  })

  describe('calculateFinalExp', () => {
    let mockState: BattleState

    beforeEach(() => {
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
        units: [],
        aiType: AIType.BALANCED,
        baseReward: 100,
        description: 'テスト用の敵',
        difficulty: 'easy',
      }

      mockState = {
        phase: BattlePhase.BATTLE,
        turn: Turn.PLAYER,
        playerField: {
          size: { width: 7, height: 7 },
          cells: [],
          placedUnits: [],
        },
        enemyField: {
          size: { width: 7, height: 7 },
          cells: [],
          placedUnits: [],
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
        enemy: mockEnemy,
        attackHistory: [],
        canContinueAttack: false,
        consecutiveHits: 0,
        activeSpecialAttack: { type: null },
        specialAttackUsageCount: { player: {}, enemy: {} },
      }
    })

    it('占有率ボーナスが計算される', () => {
      const baseExp = 100

      // 占有率50%の場合
      mockState.playerField.placedUnits = [
        {
          unitId: 'unit1',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: Array.from({ length: 25 }, (_, i) => ({
            x: i % 7,
            y: Math.floor(i / 7),
          })),
          hitCells: [],
          isDestroyed: false,
        },
      ]

      const finalExp = calculateFinalExp(mockState, baseExp)

      // 100 + (100 * 0.5 * 0.5) = 125
      expect(finalExp).toBe(125)
    })

    it('旅客機ボーナスが適用される', () => {
      const baseExp = 100

      mockState.playerField.placedUnits = [
        {
          unitId: 'passenger_plane',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      const finalExp = calculateFinalExp(mockState, baseExp)

      // 100 * 1.5 = 150
      expect(finalExp).toBe(150)
    })

    it('破壊された旅客機はボーナス対象外', () => {
      const baseExp = 100

      mockState.playerField.placedUnits = [
        {
          unitId: 'passenger_plane',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [],
          hitCells: [],
          isDestroyed: true,
        },
      ]

      const finalExp = calculateFinalExp(mockState, baseExp)

      expect(finalExp).toBe(100)
    })
  })

  describe('calculateBattleResult', () => {
    let mockState: BattleState

    beforeEach(() => {
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
        units: [],
        aiType: AIType.BALANCED,
        baseReward: 1000,
        description: 'テスト用の敵',
        difficulty: 'easy',
      }

      mockState = {
        phase: BattlePhase.BATTLE,
        turn: Turn.PLAYER,
        playerField: {
          size: { width: 7, height: 7 },
          cells: [],
          placedUnits: [],
        },
        enemyField: {
          size: { width: 7, height: 7 },
          cells: [],
          placedUnits: [],
        },
        playerStats: {
          HP: 80,
          maxHP: 100,
          SP: 50,
          maxSP: 50,
          AT: 10,
          DF: 5,
          AR: 1,
        },
        enemyStats: {
          HP: 0,
          maxHP: 100,
          SP: 50,
          maxSP: 50,
          AT: 10,
          DF: 5,
          AR: 1,
        },
        enemy: mockEnemy,
        attackHistory: [],
        canContinueAttack: false,
        consecutiveHits: 0,
        activeSpecialAttack: { type: null },
        specialAttackUsageCount: { player: {}, enemy: {} },
      }
    })

    it('勝利時の報酬を計算', () => {
      const baseExp = 100
      const result = calculateBattleResult(mockState, 'player', baseExp)

      expect(result.isVictory).toBe(true)
      expect(result.baseReward).toBe(1000)
      expect(result.totalReward).toBeGreaterThan(0)
    })

    it('HP残存ボーナスが計算される', () => {
      const baseExp = 100
      const result = calculateBattleResult(mockState, 'player', baseExp)

      // HP残存率80% → baseReward(1000) * 0.8 * 0.5 = 400
      expect(result.hpBonus).toBe(400)
    })

    it('敗北時は報酬なし', () => {
      const baseExp = 100
      const result = calculateBattleResult(mockState, 'enemy', baseExp)

      expect(result.isVictory).toBe(false)
      expect(result.totalReward).toBe(0)
      expect(result.hpBonus).toBe(0)
      expect(result.unitsBonus).toBe(0)
    })
  })

  describe('calculateHealCost', () => {
    it('1HP = 1SPを計算', () => {
      expect(calculateHealCost(30)).toBe(30)
      expect(calculateHealCost(50)).toBe(50)
      expect(calculateHealCost(100)).toBe(100)
    })
  })

  describe('calculateLevelUpCost', () => {
    it('レベル1→2のコストを計算', () => {
      expect(calculateLevelUpCost(StatType.HP, 1)).toBe(50)
      expect(calculateLevelUpCost(StatType.AT, 1)).toBe(50)
      expect(calculateLevelUpCost(StatType.AR, 1)).toBe(100)
    })

    it('レベルアップで指数的に増加', () => {
      const cost1 = calculateLevelUpCost(StatType.HP, 1)
      const cost2 = calculateLevelUpCost(StatType.HP, 2)
      const cost3 = calculateLevelUpCost(StatType.HP, 3)

      expect(cost2).toBe(Math.floor(50 * 1.3))
      expect(cost3).toBe(Math.floor(50 * 1.3 * 1.3))
      expect(cost2).toBeGreaterThan(cost1)
      expect(cost3).toBeGreaterThan(cost2)
    })
  })

  describe('getGridSizeFromAR', () => {
    it('AR=1で7x7', () => {
      expect(getGridSizeFromAR(1)).toEqual({ width: 7, height: 7 })
    })

    it('AR=2で8x7（横拡張）', () => {
      expect(getGridSizeFromAR(2)).toEqual({ width: 8, height: 7 })
    })

    it('AR=3で8x8（縦拡張）', () => {
      expect(getGridSizeFromAR(3)).toEqual({ width: 8, height: 8 })
    })

    it('AR=4で9x8（横拡張）', () => {
      expect(getGridSizeFromAR(4)).toEqual({ width: 9, height: 8 })
    })

    it('AR=11で12x12', () => {
      expect(getGridSizeFromAR(11)).toEqual({ width: 12, height: 12 })
    })
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getSpecialAttackRangeMultiplier,
  getCrossBombingTargets,
  getColumnBombingTargets,
  getRowBombingTargets,
  executeBurstFire,
  startRapidFire,
  isRapidFireActive,
  executeAutoDetect,
  executeStealTurn,
  getSpecialAttackCost,
  countTriggeredLandmines,
} from '@/lib/game/specialAttacks'
import { createEmptyGrid } from '@/lib/utils/grid'
import {
  CellState,
  Rotation,
  Turn,
  BattlePhase,
  SpecialAttackType,
  AIType,
  EnemyId,
  UnitCategory,
} from '@/lib/types/enums'
import type { Field } from '@/lib/types/grid'
import type { PlacedUnit, Unit } from '@/lib/types/unit'
import type { BattleState } from '@/lib/types/battle'

describe('special attacks logic', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getSpecialAttackRangeMultiplier', () => {
    it('航空母艦がない場合は1を返す', () => {
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

      const result = getSpecialAttackRangeMultiplier(units)

      expect(result).toBe(1)
    })

    it('航空母艦がある場合は2を返す', () => {
      const units: PlacedUnit[] = [
        {
          unitId: 'aircraft_carrier',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        },
      ]

      const result = getSpecialAttackRangeMultiplier(units)

      expect(result).toBe(2)
    })

    it('航空母艦が破壊されている場合は1を返す', () => {
      const units: PlacedUnit[] = [
        {
          unitId: 'aircraft_carrier',
          position: { x: 0, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: 0, y: 0 }],
          hitCells: [{ x: 0, y: 0 }],
          isDestroyed: true,
        },
      ]

      const result = getSpecialAttackRangeMultiplier(units)

      expect(result).toBe(1)
    })
  })

  describe('getCrossBombingTargets', () => {
    it('十字爆撃の範囲を正しく取得（倍率1）', () => {
      const field: Field = {
        size: { width: 10, height: 10 },
        cells: createEmptyGrid({ width: 10, height: 10 }),
        placedUnits: [],
      }

      const center = { x: 5, y: 5 }
      const targets = getCrossBombingTargets(center, field, 1)

      // 中心 + 上下左右3マスずつ = 1 + 3*4 = 13
      expect(targets).toHaveLength(13)
      expect(targets).toContainEqual({ x: 5, y: 5 }) // 中心
      expect(targets).toContainEqual({ x: 5, y: 2 }) // 上3
      expect(targets).toContainEqual({ x: 5, y: 8 }) // 下3
      expect(targets).toContainEqual({ x: 2, y: 5 }) // 左3
      expect(targets).toContainEqual({ x: 8, y: 5 }) // 右3
    })

    it('十字爆撃の範囲を正しく取得（倍率2・航空母艦）', () => {
      const field: Field = {
        size: { width: 20, height: 20 },
        cells: createEmptyGrid({ width: 20, height: 20 }),
        placedUnits: [],
      }

      const center = { x: 10, y: 10 }
      const targets = getCrossBombingTargets(center, field, 2)

      // 中心 + 上下左右6マスずつ = 1 + 6*4 = 25
      expect(targets).toHaveLength(25)
      expect(targets).toContainEqual({ x: 10, y: 4 }) // 上6
      expect(targets).toContainEqual({ x: 10, y: 16 }) // 下6
      expect(targets).toContainEqual({ x: 4, y: 10 }) // 左6
      expect(targets).toContainEqual({ x: 16, y: 10 }) // 右6
    })

    it('フィールド外は含まない', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const center = { x: 0, y: 0 } // 左上隅
      const targets = getCrossBombingTargets(center, field, 1)

      // 中心 + 下3 + 右3 = 1 + 3 + 3 = 7
      expect(targets).toHaveLength(7)
    })
  })

  describe('getColumnBombingTargets', () => {
    it('縦列全体を攻撃範囲として取得', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const position = { x: 3, y: 2 }
      const targets = getColumnBombingTargets(position, field)

      expect(targets).toHaveLength(7) // height
      for (let y = 0; y < 7; y++) {
        expect(targets).toContainEqual({ x: 3, y })
      }
    })
  })

  describe('getRowBombingTargets', () => {
    it('横列全体を攻撃範囲として取得', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const position = { x: 2, y: 3 }
      const targets = getRowBombingTargets(position, field)

      expect(targets).toHaveLength(7) // width
      for (let x = 0; x < 7; x++) {
        expect(targets).toContainEqual({ x, y: 3 })
      }
    })
  })

  describe('executeBurstFire', () => {
    let mockState: BattleState

    beforeEach(() => {
      mockState = {
        phase: BattlePhase.BATTLE,
        turn: Turn.PLAYER,
        playerField: {
          size: { width: 7, height: 7 },
          cells: createEmptyGrid({ width: 7, height: 7 }),
          placedUnits: [],
        },
        enemyField: {
          size: { width: 7, height: 7 },
          cells: createEmptyGrid({ width: 7, height: 7 }),
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
          name: 'Test',
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

    it('HIT時は1回のみの攻撃', () => {
      mockState.enemyField.cells[0][0].unitId = 'ambulance'
      mockState.enemyField.placedUnits.push({
        unitId: 'ambulance',
        position: { x: 0, y: 0 },
        rotation: Rotation.DEG_0,
        occupiedCells: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        hitCells: [],
        isDestroyed: false,
      })

      const result = executeBurstFire({ x: 0, y: 0 }, mockState)

      expect(result.hitCount).toBe(1)
    })

    it('MISS時は3回攻撃', () => {
      const result = executeBurstFire({ x: 3, y: 3 }, mockState)

      // MISS時は最大3回攻撃（フィールドに未探索セルがある限り）
      expect(result.hitCount).toBeGreaterThanOrEqual(0)
      expect(result.totalDamage).toBeGreaterThan(0)
    })
  })

  describe('startRapidFire', () => {
    it('無差別攻撃を開始', () => {
      const mockState = {
        activeSpecialAttack: { type: null },
      } as BattleState

      startRapidFire(mockState)

      expect(mockState.activeSpecialAttack?.type).toBe(
        SpecialAttackType.RAPID
      )
      expect(mockState.activeSpecialAttack?.startTime).toBeDefined()
      expect(mockState.activeSpecialAttack?.endTime).toBeDefined()
    })
  })

  describe('isRapidFireActive', () => {
    it('無差別攻撃が有効な場合はtrue', () => {
      const mockState = {
        activeSpecialAttack: {
          type: SpecialAttackType.RAPID,
          startTime: Date.now(),
          endTime: Date.now() + 5000, // 5秒後
        },
      } as BattleState

      const result = isRapidFireActive(mockState)

      expect(result).toBe(true)
    })

    it('無差別攻撃が終了している場合はfalse', () => {
      const mockState = {
        activeSpecialAttack: {
          type: SpecialAttackType.RAPID,
          startTime: Date.now() - 15000, // 15秒前
          endTime: Date.now() - 5000, // 5秒前に終了
        },
      } as BattleState

      const result = isRapidFireActive(mockState)

      expect(result).toBe(false)
    })

    it('特殊攻撃がRAPIDでない場合はfalse', () => {
      const mockState = {
        activeSpecialAttack: { type: null },
      } as BattleState

      const result = isRapidFireActive(mockState)

      expect(result).toBe(false)
    })
  })

  describe('executeAutoDetect', () => {
    it('未探索の部隊マスを1つ発見', () => {
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
        ],
      }

      field.cells[0][0].unitId = 'ambulance'
      field.cells[0][1].unitId = 'ambulance'

      const result = executeAutoDetect(field)

      expect(result).not.toBeNull()
      if (result) {
        // HITしたセルは状態が更新される
        expect(field.cells[result.y][result.x].state).toBe(CellState.HIT)
      }
    })

    it('未探索の部隊がない場合はnullを返す', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const result = executeAutoDetect(field)

      expect(result).toBeNull()
    })
  })

  describe('executeStealTurn', () => {
    it('ターンをプレイヤーに設定', () => {
      const mockState = {
        turn: Turn.ENEMY,
        canContinueAttack: false,
      } as BattleState

      executeStealTurn(mockState)

      expect(mockState.turn).toBe(Turn.PLAYER)
      expect(mockState.canContinueAttack).toBe(true)
    })
  })

  describe('getSpecialAttackCost', () => {
    it('基本SPコストを返す（増加なし）', () => {
      const unit: Unit = {
        id: 'harrier',
        name: 'ハリアー',
        size: 3,
        shape: [[1, 1, 1]],
        price: 500,
        category: UnitCategory.ATTACK,
        maxPlacement: 1,
        description: 'Test',
        specialAttack: {
          name: '十字爆撃',
          type: SpecialAttackType.CROSS,
          spCost: 20,
          baseSpCost: 20,
        },
      }

      const cost = getSpecialAttackCost('harrier', 0, unit)

      expect(cost).toBe(20)
    })

    it('使用回数に応じて増加（ガプリーノ専用）', () => {
      const unit: Unit = {
        id: 'guided_missile',
        name: '自走対空ミサイル',
        size: 2,
        shape: [[1, 1]],
        price: 300,
        category: UnitCategory.ATTACK,
        maxPlacement: 1,
        description: 'Test',
        specialAttack: {
          name: '誘導弾',
          type: SpecialAttackType.AUTO_DETECT,
          spCost: 16,
          baseSpCost: 16,
          spIncrease: 8,
        },
      }

      const cost1 = getSpecialAttackCost('guided_missile', 0, unit)
      const cost2 = getSpecialAttackCost('guided_missile', 1, unit)
      const cost3 = getSpecialAttackCost('guided_missile', 2, unit)

      expect(cost1).toBe(16)
      expect(cost2).toBe(24) // 16 + 8
      expect(cost3).toBe(32) // 16 + 8*2
    })
  })

  describe('countTriggeredLandmines', () => {
    it('踏んだ地雷の数をカウント', () => {
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

      field.cells[0][0].unitId = 'mine'
      field.cells[0][0].state = CellState.HIT

      field.cells[2][2].unitId = 'mine'
      field.cells[2][2].state = CellState.HIT

      const attackedPositions = [
        { x: 0, y: 0 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ]

      const count = countTriggeredLandmines(attackedPositions, field)

      expect(count).toBe(2)
    })

    it('地雷を踏んでいない場合は0を返す', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const attackedPositions = [{ x: 0, y: 0 }]

      const count = countTriggeredLandmines(attackedPositions, field)

      expect(count).toBe(0)
    })
  })
})

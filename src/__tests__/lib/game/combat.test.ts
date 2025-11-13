import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isHit,
  processHit,
  processMiss,
  checkUnitDestroyed,
  triggerLandmineCounter,
  getRandomUnexploredCell,
  switchTurn,
  executeAttack,
  resetContinueAttack,
} from '@/lib/game/combat'
import { createEmptyGrid } from '@/lib/utils/grid'
import {
  CellState,
  Turn,
  Rotation,
  BattlePhase,
  AIType,
  EnemyId,
} from '@/lib/types/enums'
import type { Field } from '@/lib/types/grid'
import type { BattleState } from '@/lib/types/battle'
import type { PlacedUnit } from '@/lib/types/unit'

describe('combat logic', () => {
  beforeEach(() => {
    // ランダム性をモック
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('isHit', () => {
    it('部隊があり未探索の場合はtrueを返す', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      field.cells[0][0].unitId = 'ambulance'
      field.cells[0][0].state = CellState.UNEXPLORED

      const result = isHit({ x: 0, y: 0 }, field)

      expect(result).toBe(true)
    })

    it('部隊がない場合はfalseを返す', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const result = isHit({ x: 0, y: 0 }, field)

      expect(result).toBe(false)
    })

    it('既に攻撃済みの場合はfalseを返す', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      field.cells[0][0].unitId = 'ambulance'
      field.cells[0][0].state = CellState.HIT

      const result = isHit({ x: 0, y: 0 }, field)

      expect(result).toBe(false)
    })
  })

  describe('processHit', () => {
    it('HITを処理してセル状態を更新', () => {
      const placedUnit: PlacedUnit = {
        unitId: 'ambulance',
        position: { x: 0, y: 0 },
        rotation: Rotation.DEG_0,
        occupiedCells: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        hitCells: [],
        isDestroyed: false,
      }

      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [placedUnit],
      }

      field.cells[0][0].unitId = 'ambulance'

      const result = processHit({ x: 0, y: 0 }, field)

      expect(result.unitId).toBe('ambulance')
      expect(result.isDestroyed).toBe(false)
      expect(result.isLandmine).toBe(false)
      expect(field.cells[0][0].state).toBe(CellState.HIT)
      expect(placedUnit.hitCells).toHaveLength(1)
      expect(placedUnit.hitCells[0]).toEqual({ x: 0, y: 0 })
    })

    it('全セルにHITしたら破壊判定', () => {
      const placedUnit: PlacedUnit = {
        unitId: 'ambulance',
        position: { x: 0, y: 0 },
        rotation: Rotation.DEG_0,
        occupiedCells: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        hitCells: [{ x: 0, y: 0 }], // 既に1マスHIT済み
        isDestroyed: false,
      }

      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [placedUnit],
      }

      field.cells[0][1].unitId = 'ambulance'

      const result = processHit({ x: 1, y: 0 }, field)

      expect(result.isDestroyed).toBe(true)
      expect(placedUnit.isDestroyed).toBe(true)
      expect(field.cells[0][0].state).toBe(CellState.DESTROYED)
      expect(field.cells[0][1].state).toBe(CellState.DESTROYED)
    })

    it('地雷の場合はisLandmineがtrue', () => {
      const placedUnit: PlacedUnit = {
        unitId: 'mine',
        position: { x: 0, y: 0 },
        rotation: Rotation.DEG_0,
        occupiedCells: [{ x: 0, y: 0 }],
        hitCells: [],
        isDestroyed: false,
      }

      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [placedUnit],
      }

      field.cells[0][0].unitId = 'mine'

      const result = processHit({ x: 0, y: 0 }, field)

      expect(result.isLandmine).toBe(true)
      expect(result.isDestroyed).toBe(true) // 地雷は1マスなので即破壊
    })
  })

  describe('processMiss', () => {
    it('MISS状態に更新する', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      processMiss({ x: 0, y: 0 }, field)

      expect(field.cells[0][0].state).toBe(CellState.MISS)
    })
  })

  describe('checkUnitDestroyed', () => {
    it('全セルがHITしていれば破壊', () => {
      const placedUnit: PlacedUnit = {
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
        isDestroyed: false,
      }

      const result = checkUnitDestroyed(placedUnit)

      expect(result).toBe(true)
    })

    it('一部しかHITしていなければ未破壊', () => {
      const placedUnit: PlacedUnit = {
        unitId: 'ambulance',
        position: { x: 0, y: 0 },
        rotation: Rotation.DEG_0,
        occupiedCells: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        hitCells: [{ x: 0, y: 0 }],
        isDestroyed: false,
      }

      const result = checkUnitDestroyed(placedUnit)

      expect(result).toBe(false)
    })
  })

  describe('getRandomUnexploredCell', () => {
    it('未探索セルからランダムに1つ選択', () => {
      const field: Field = {
        size: { width: 3, height: 3 },
        cells: createEmptyGrid({ width: 3, height: 3 }),
        placedUnits: [],
      }

      // 一部を探索済みに
      field.cells[0][0].state = CellState.HIT
      field.cells[0][1].state = CellState.MISS

      const result = getRandomUnexploredCell(field)

      expect(result).not.toBeNull()
      if (result) {
        expect(field.cells[result.y][result.x].state).toBe(
          CellState.UNEXPLORED
        )
      }
    })

    it('未探索セルがない場合はnullを返す', () => {
      const field: Field = {
        size: { width: 2, height: 2 },
        cells: createEmptyGrid({ width: 2, height: 2 }),
        placedUnits: [],
      }

      // 全て探索済みに
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          field.cells[y][x].state = CellState.MISS
        }
      }

      const result = getRandomUnexploredCell(field)

      expect(result).toBeNull()
    })
  })

  describe('switchTurn', () => {
    it('PLAYERからENEMYに切り替わる', () => {
      const result = switchTurn(Turn.PLAYER)
      expect(result).toBe(Turn.ENEMY)
    })

    it('ENEMYからPLAYERに切り替わる', () => {
      const result = switchTurn(Turn.ENEMY)
      expect(result).toBe(Turn.PLAYER)
    })
  })

  describe('executeAttack', () => {
    let mockState: BattleState

    beforeEach(() => {
      const placedUnit: PlacedUnit = {
        unitId: 'ambulance',
        position: { x: 0, y: 0 },
        rotation: Rotation.DEG_0,
        occupiedCells: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
        hitCells: [],
        isDestroyed: false,
      }

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
          placedUnits: [placedUnit],
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

      mockState.enemyField.cells[0][0].unitId = 'ambulance'
    })

    it('HITの場合は連続攻撃可能', () => {
      const result = executeAttack({ x: 0, y: 0 }, mockState)

      expect(result.success).toBe(true)
      expect(result.isHit).toBe(true)
      expect(result.canContinue).toBe(true)
      expect(mockState.canContinueAttack).toBe(true)
      expect(mockState.consecutiveHits).toBe(1)
      expect(mockState.turn).toBe(Turn.PLAYER) // ターンは変わらない
    })

    it('MISSの場合はダメージを与えてターン交代', () => {
      const result = executeAttack({ x: 3, y: 3 }, mockState)

      expect(result.success).toBe(true)
      expect(result.isHit).toBe(false)
      expect(result.canContinue).toBe(false)
      expect(result.damage).toBeGreaterThan(0)
      expect(mockState.enemyStats.HP).toBeLessThan(100)
      expect(mockState.turn).toBe(Turn.ENEMY) // ターン交代
      expect(mockState.canContinueAttack).toBe(false)
      expect(mockState.consecutiveHits).toBe(0)
    })

    it('地雷HITの場合はカウンター攻撃とターン交代', () => {
      const mineUnit: PlacedUnit = {
        unitId: 'mine',
        position: { x: 2, y: 2 },
        rotation: Rotation.DEG_0,
        occupiedCells: [{ x: 2, y: 2 }],
        hitCells: [],
        isDestroyed: false,
      }

      mockState.enemyField.placedUnits.push(mineUnit)
      mockState.enemyField.cells[2][2].unitId = 'mine'

      const result = executeAttack({ x: 2, y: 2 }, mockState)

      expect(result.success).toBe(true)
      expect(result.isHit).toBe(true)
      expect(result.isLandmine).toBe(true)
      expect(result.canContinue).toBe(false)
      expect(mockState.turn).toBe(Turn.ENEMY) // ターン交代
    })

    it('攻撃履歴が記録される', () => {
      executeAttack({ x: 0, y: 0 }, mockState)

      expect(mockState.attackHistory).toHaveLength(1)
      expect(mockState.attackHistory[0].turn).toBe(Turn.PLAYER)
      expect(mockState.attackHistory[0].position).toEqual({ x: 0, y: 0 })
      expect(mockState.attackHistory[0].result).toBe('hit')
    })
  })

  describe('resetContinueAttack', () => {
    it('連続攻撃状態をリセット', () => {
      const mockState = {
        canContinueAttack: true,
        consecutiveHits: 3,
      } as BattleState

      resetContinueAttack(mockState)

      expect(mockState.canContinueAttack).toBe(false)
      expect(mockState.consecutiveHits).toBe(0)
    })
  })

  describe('triggerLandmineCounter', () => {
    it('プレイヤーが地雷を踏んだ場合のカウンター攻撃', () => {
      const mockState: BattleState = {
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

      const initialHP = mockState.playerStats.HP

      triggerLandmineCounter('player', mockState)

      // カウンター攻撃でダメージを受けるかMISSしてダメージを受ける
      expect(mockState.playerStats.HP).toBeLessThanOrEqual(initialHP)
    })
  })
})

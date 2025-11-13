import { describe, it, expect } from 'vitest'
import {
  validatePlacement,
  isPlacementComplete,
  checkPlacementValidity,
  getPlacementStats,
} from '@/lib/game/placement'
import { createEmptyGrid } from '@/lib/utils/grid'
import { Rotation, UnitCategory } from '@/lib/types/enums'
import type { Field } from '@/lib/types/grid'
import type { Unit, PlacedUnit } from '@/lib/types/unit'

describe('placement logic', () => {
  const mockUnit: Unit = {
    id: 'ambulance',
    name: '救急車',
    size: 2,
    shape: [
      [1, 1],
      [0, 0],
    ],
    price: 100,
    category: UnitCategory.HEAL,
    maxPlacement: 1,
    description: 'テスト用ユニット',
  }

  const mockMine: Unit = {
    id: 'mine',
    name: '地雷',
    size: 1,
    shape: [[1]],
    price: 50,
    category: UnitCategory.SPECIAL,
    maxPlacement: 6,
    description: '地雷ユニット',
  }

  describe('validatePlacement', () => {
    it('部隊が0個の場合はエラーを返す', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const result = validatePlacement(field)

      expect(result.isValid).toBe(false)
      expect(result.isComplete).toBe(false)
      expect(result.errors).toContain('部隊が1つも配置されていません')
    })

    it('部隊が3個未満の場合は警告を返す', () => {
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

      // セルにunitIdを設定
      field.cells[0][0].unitId = 'ambulance'
      field.cells[0][1].unitId = 'ambulance'

      const result = validatePlacement(field)

      expect(result.isValid).toBe(true)
      expect(result.isComplete).toBe(false)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('推奨部隊数は3部隊以上です')
    })

    it('部隊が3個以上で有効な配置の場合は完了と判定', () => {
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
            unitId: 'fire_truck',
            position: { x: 3, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 3, y: 0 },
              { x: 4, y: 0 },
            ],
            hitCells: [],
            isDestroyed: false,
          },
          {
            unitId: 'dump_truck',
            position: { x: 0, y: 2 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 0, y: 2 },
              { x: 1, y: 2 },
            ],
            hitCells: [],
            isDestroyed: false,
          },
        ],
      }

      // セルにunitIdを設定
      field.cells[0][0].unitId = 'ambulance'
      field.cells[0][1].unitId = 'ambulance'
      field.cells[0][3].unitId = 'fire_truck'
      field.cells[0][4].unitId = 'fire_truck'
      field.cells[2][0].unitId = 'dump_truck'
      field.cells[2][1].unitId = 'dump_truck'

      const result = validatePlacement(field)

      expect(result.isValid).toBe(true)
      expect(result.isComplete).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('占有セルがフィールド外の場合はエラーを返す', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [
          {
            unitId: 'ambulance',
            position: { x: 0, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 10, y: 10 }, // フィールド外
              { x: 1, y: 0 },
            ],
            hitCells: [],
            isDestroyed: false,
          },
        ],
      }

      const result = validatePlacement(field)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('フィールド外')
    })

    it('占有セルとフィールドの状態が不一致の場合はエラーを返す', () => {
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

      // セルのunitIdを設定しない（不一致状態）

      const result = validatePlacement(field)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('不一致')
    })

    it('占有率が低い場合は警告を返す', () => {
      const field: Field = {
        size: { width: 10, height: 10 }, // 100マス
        cells: createEmptyGrid({ width: 10, height: 10 }),
        placedUnits: [
          {
            unitId: 'ambulance',
            position: { x: 0, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ], // 2マスのみ（占有率2%）
            hitCells: [],
            isDestroyed: false,
          },
          {
            unitId: 'fire_truck',
            position: { x: 3, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 3, y: 0 },
              { x: 4, y: 0 },
            ],
            hitCells: [],
            isDestroyed: false,
          },
          {
            unitId: 'dump_truck',
            position: { x: 0, y: 2 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 0, y: 2 },
              { x: 1, y: 2 },
            ],
            hitCells: [],
            isDestroyed: false,
          },
        ],
      }

      // セルにunitIdを設定
      field.cells[0][0].unitId = 'ambulance'
      field.cells[0][1].unitId = 'ambulance'
      field.cells[0][3].unitId = 'fire_truck'
      field.cells[0][4].unitId = 'fire_truck'
      field.cells[2][0].unitId = 'dump_truck'
      field.cells[2][1].unitId = 'dump_truck'

      const result = validatePlacement(field)

      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some((w) => w.includes('占有率'))).toBe(true)
    })
  })

  describe('isPlacementComplete', () => {
    it('配置完了の場合はtrueを返す', () => {
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
            unitId: 'fire_truck',
            position: { x: 3, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 3, y: 0 },
              { x: 4, y: 0 },
            ],
            hitCells: [],
            isDestroyed: false,
          },
          {
            unitId: 'dump_truck',
            position: { x: 0, y: 2 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 0, y: 2 },
              { x: 1, y: 2 },
            ],
            hitCells: [],
            isDestroyed: false,
          },
        ],
      }

      // セルにunitIdを設定
      field.cells[0][0].unitId = 'ambulance'
      field.cells[0][1].unitId = 'ambulance'
      field.cells[0][3].unitId = 'fire_truck'
      field.cells[0][4].unitId = 'fire_truck'
      field.cells[2][0].unitId = 'dump_truck'
      field.cells[2][1].unitId = 'dump_truck'

      const result = isPlacementComplete(field)

      expect(result).toBe(true)
    })

    it('配置が不完全な場合はfalseを返す', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const result = isPlacementComplete(field)

      expect(result).toBe(false)
    })
  })

  describe('checkPlacementValidity', () => {
    it('フィールド外の場合はエラーを返す', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const errors = checkPlacementValidity(
        mockUnit,
        { x: 6, y: 0 }, // 7x7のフィールドで x=6 に幅2のユニットは配置不可
        Rotation.DEG_0,
        field
      )

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('フィールド外')
    })

    it('既に他の部隊がある場合はエラーを返す', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [
          {
            unitId: 'fire_truck',
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

      // セルにunitIdを設定
      field.cells[0][0].unitId = 'fire_truck'
      field.cells[0][1].unitId = 'fire_truck'

      const errors = checkPlacementValidity(
        mockUnit,
        { x: 0, y: 0 }, // 既に占有されている位置
        Rotation.DEG_0,
        field
      )

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('他の部隊が配置されています')
    })

    it('地雷が6個以上の場合はエラーを返す', () => {
      const placedMines: PlacedUnit[] = []
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: placedMines,
      }

      // 6個の地雷を配置
      for (let i = 0; i < 6; i++) {
        placedMines.push({
          unitId: 'mine',
          position: { x: i, y: 0 },
          rotation: Rotation.DEG_0,
          occupiedCells: [{ x: i, y: 0 }],
          hitCells: [],
          isDestroyed: false,
        })
        field.cells[0][i].unitId = 'mine'
      }

      const errors = checkPlacementValidity(
        mockMine,
        { x: 6, y: 0 }, // 7個目の地雷
        Rotation.DEG_0,
        field
      )

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('地雷は最大6個まで')
    })

    it('同じ部隊が既に配置されている場合はエラーを返す（地雷以外）', () => {
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

      const errors = checkPlacementValidity(
        mockUnit,
        { x: 3, y: 0 }, // 別の位置だが同じユニットID
        Rotation.DEG_0,
        field
      )

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('既に配置されています')
    })

    it('配置可能な場合は空配列を返す', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const errors = checkPlacementValidity(
        mockUnit,
        { x: 0, y: 0 },
        Rotation.DEG_0,
        field
      )

      expect(errors.length).toBe(0)
    })
  })

  describe('getPlacementStats', () => {
    it('配置統計を正しく計算する', () => {
      const field: Field = {
        size: { width: 7, height: 7 }, // 49マス
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [
          {
            unitId: 'ambulance',
            position: { x: 0, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ], // 2マス
            hitCells: [],
            isDestroyed: false,
          },
          {
            unitId: 'mine',
            position: { x: 3, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [{ x: 3, y: 0 }], // 1マス
            hitCells: [],
            isDestroyed: false,
          },
          {
            unitId: 'mine',
            position: { x: 4, y: 0 },
            rotation: Rotation.DEG_0,
            occupiedCells: [{ x: 4, y: 0 }], // 1マス
            hitCells: [],
            isDestroyed: false,
          },
          {
            unitId: 'fire_truck',
            position: { x: 0, y: 2 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 0, y: 2 },
              { x: 1, y: 2 },
            ], // 2マス
            hitCells: [],
            isDestroyed: false,
          },
        ],
      }

      const stats = getPlacementStats(field)

      expect(stats.totalUnits).toBe(4)
      expect(stats.occupiedCells).toBe(6) // 2 + 1 + 1 + 2
      expect(stats.occupancyRate).toBeCloseTo(6 / 49, 2) // 約12.2%
      expect(stats.mineCount).toBe(2)
      expect(stats.hasMinimumUnits).toBe(true) // 4 >= 3
    })

    it('部隊が少ない場合はhasMinimumUnitsがfalse', () => {
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

      const stats = getPlacementStats(field)

      expect(stats.hasMinimumUnits).toBe(false)
    })
  })
})

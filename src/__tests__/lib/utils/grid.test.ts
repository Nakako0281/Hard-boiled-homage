import { describe, it, expect } from 'vitest'
import {
  createEmptyGrid,
  getCellAt,
  updateCellAt,
  getUnitOccupiedCells,
  canPlaceUnit,
  getUnitsInArea,
  placeUnitOnField,
  removeUnitFromField,
  getUnexploredCellCount,
  getOccupiedCellCount,
  cloneGrid,
} from '@/lib/utils/grid'
import { CellState, Rotation, UnitCategory } from '@/lib/types/enums'
import type { GridSize } from '@/lib/types/position'
import type { Unit } from '@/lib/types/unit'
import type { Field } from '@/lib/types/grid'

describe('grid utilities', () => {
  describe('createEmptyGrid', () => {
    it('指定サイズの空グリッドを生成', () => {
      const size: GridSize = { width: 5, height: 5 }
      const grid = createEmptyGrid(size)

      expect(grid).toHaveLength(5)
      expect(grid[0]).toHaveLength(5)
      expect(grid[0][0]).toEqual({
        position: { x: 0, y: 0 },
        state: CellState.UNEXPLORED,
        isRevealed: false,
      })
    })

    it('すべてのセルがUNEXPLOREDで初期化される', () => {
      const size: GridSize = { width: 3, height: 3 }
      const grid = createEmptyGrid(size)

      for (let y = 0; y < size.height; y++) {
        for (let x = 0; x < size.width; x++) {
          expect(grid[y][x].state).toBe(CellState.UNEXPLORED)
          expect(grid[y][x].isRevealed).toBe(false)
        }
      }
    })

    it('非正方形グリッドも正しく生成', () => {
      const size: GridSize = { width: 7, height: 10 }
      const grid = createEmptyGrid(size)

      expect(grid).toHaveLength(10)
      expect(grid[0]).toHaveLength(7)
    })
  })

  describe('getCellAt', () => {
    const grid = createEmptyGrid({ width: 5, height: 5 })

    it('有効な位置のセルを取得', () => {
      const cell = getCellAt(grid, { x: 2, y: 3 })

      expect(cell).not.toBeNull()
      expect(cell?.position).toEqual({ x: 2, y: 3 })
    })

    it('範囲外の位置ではnullを返す', () => {
      expect(getCellAt(grid, { x: -1, y: 0 })).toBeNull()
      expect(getCellAt(grid, { x: 0, y: -1 })).toBeNull()
      expect(getCellAt(grid, { x: 5, y: 0 })).toBeNull()
      expect(getCellAt(grid, { x: 0, y: 5 })).toBeNull()
    })
  })

  describe('updateCellAt', () => {
    it('指定位置のセルを更新', () => {
      const grid = createEmptyGrid({ width: 3, height: 3 })
      const updatedGrid = updateCellAt(grid, { x: 1, y: 1 }, {
        state: CellState.HIT,
        isRevealed: true,
      })

      const cell = getCellAt(updatedGrid, { x: 1, y: 1 })
      expect(cell?.state).toBe(CellState.HIT)
      expect(cell?.isRevealed).toBe(true)
    })

    it('元のグリッドは変更されない（イミュータブル）', () => {
      const grid = createEmptyGrid({ width: 3, height: 3 })
      const originalState = getCellAt(grid, { x: 1, y: 1 })?.state

      updateCellAt(grid, { x: 1, y: 1 }, { state: CellState.HIT })

      expect(getCellAt(grid, { x: 1, y: 1 })?.state).toBe(originalState)
    })
  })

  describe('getUnitOccupiedCells', () => {
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

    it('0度回転で正しい占有セルを取得', () => {
      const cells = getUnitOccupiedCells(
        mockUnit,
        { x: 0, y: 0 },
        Rotation.DEG_0
      )

      expect(cells).toHaveLength(2)
      expect(cells).toContainEqual({ x: 0, y: 0 })
      expect(cells).toContainEqual({ x: 1, y: 0 })
    })

    it('90度回転で正しい占有セルを取得', () => {
      const cells = getUnitOccupiedCells(
        mockUnit,
        { x: 0, y: 0 },
        Rotation.DEG_90
      )

      expect(cells).toHaveLength(2)
      expect(cells).toContainEqual({ x: 1, y: 0 })
      expect(cells).toContainEqual({ x: 1, y: 1 })
    })

    it('配置位置のオフセットが正しく適用される', () => {
      const cells = getUnitOccupiedCells(
        mockUnit,
        { x: 3, y: 2 },
        Rotation.DEG_0
      )

      expect(cells).toContainEqual({ x: 3, y: 2 })
      expect(cells).toContainEqual({ x: 4, y: 2 })
    })
  })

  describe('canPlaceUnit', () => {
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

    it('空フィールドに配置可能', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const result = canPlaceUnit(mockUnit, { x: 0, y: 0 }, Rotation.DEG_0, field)
      expect(result).toBe(true)
    })

    it('範囲外への配置は不可', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      // 右端をはみ出す
      const result = canPlaceUnit(mockUnit, { x: 6, y: 0 }, Rotation.DEG_0, field)
      expect(result).toBe(false)
    })

    it('既に配置済みの位置には配置不可', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      // 最初に配置
      const updatedField = placeUnitOnField(
        field,
        mockUnit,
        'unit1',
        { x: 0, y: 0 },
        Rotation.DEG_0
      )

      expect(updatedField).not.toBeNull()

      // 重複配置を試みる
      const result = canPlaceUnit(
        mockUnit,
        { x: 0, y: 0 },
        Rotation.DEG_0,
        updatedField!
      )
      expect(result).toBe(false)
    })
  })

  describe('placeUnitOnField', () => {
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

    it('ユニットをフィールドに正しく配置', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const result = placeUnitOnField(
        field,
        mockUnit,
        'unit1',
        { x: 2, y: 3 },
        Rotation.DEG_0
      )

      expect(result).not.toBeNull()
      expect(result?.placedUnits).toHaveLength(1)
      expect(result?.placedUnits[0].unitId).toBe('unit1')
      expect(result?.placedUnits[0].position).toEqual({ x: 2, y: 3 })

      // セルにunitIdが設定されているか確認
      const cell1 = getCellAt(result!.cells, { x: 2, y: 3 })
      const cell2 = getCellAt(result!.cells, { x: 3, y: 3 })
      expect(cell1?.unitId).toBe('unit1')
      expect(cell2?.unitId).toBe('unit1')
    })

    it('配置不可能な場合はnullを返す', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      // 範囲外への配置
      const result = placeUnitOnField(
        field,
        mockUnit,
        'unit1',
        { x: 6, y: 0 },
        Rotation.DEG_0
      )

      expect(result).toBeNull()
    })
  })

  describe('removeUnitFromField', () => {
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

    it('ユニットをフィールドから削除', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      // 配置
      const placedField = placeUnitOnField(
        field,
        mockUnit,
        'unit1',
        { x: 2, y: 3 },
        Rotation.DEG_0
      )!

      // 削除
      const removedField = removeUnitFromField(placedField, 'unit1')

      expect(removedField.placedUnits).toHaveLength(0)

      // セルからunitIdが削除されているか確認
      const cell1 = getCellAt(removedField.cells, { x: 2, y: 3 })
      const cell2 = getCellAt(removedField.cells, { x: 3, y: 3 })
      expect(cell1?.unitId).toBeUndefined()
      expect(cell2?.unitId).toBeUndefined()
    })

    it('存在しないユニットIDの場合は何もしない', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const result = removeUnitFromField(field, 'nonexistent')

      expect(result).toEqual(field)
    })
  })

  describe('getUnitsInArea', () => {
    it('指定エリア内のユニットを取得', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [
          {
            unitId: 'unit1',
            position: { x: 1, y: 1 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 1, y: 1 },
              { x: 2, y: 1 },
            ],
            hitCells: [],
            isDestroyed: false,
          },
          {
            unitId: 'unit2',
            position: { x: 5, y: 5 },
            rotation: Rotation.DEG_0,
            occupiedCells: [
              { x: 5, y: 5 },
              { x: 6, y: 5 },
            ],
            hitCells: [],
            isDestroyed: false,
          },
        ],
      }

      const units = getUnitsInArea(field, { x: 0, y: 0 }, { x: 3, y: 3 })

      expect(units).toHaveLength(1)
      expect(units[0].unitId).toBe('unit1')
    })

    it('エリア内にユニットがない場合は空配列', () => {
      const field: Field = {
        size: { width: 7, height: 7 },
        cells: createEmptyGrid({ width: 7, height: 7 }),
        placedUnits: [],
      }

      const units = getUnitsInArea(field, { x: 0, y: 0 }, { x: 3, y: 3 })

      expect(units).toHaveLength(0)
    })
  })

  describe('getUnexploredCellCount', () => {
    it('未探索セル数を正しくカウント', () => {
      const grid = createEmptyGrid({ width: 5, height: 5 })

      const count = getUnexploredCellCount(grid)
      expect(count).toBe(25)
    })

    it('一部探索済みの場合も正しくカウント', () => {
      let grid = createEmptyGrid({ width: 5, height: 5 })
      grid = updateCellAt(grid, { x: 0, y: 0 }, { state: CellState.HIT })
      grid = updateCellAt(grid, { x: 1, y: 0 }, { state: CellState.MISS })

      const count = getUnexploredCellCount(grid)
      expect(count).toBe(23)
    })
  })

  describe('getOccupiedCellCount', () => {
    it('ユニット配置済みセル数を正しくカウント', () => {
      let grid = createEmptyGrid({ width: 5, height: 5 })
      grid = updateCellAt(grid, { x: 0, y: 0 }, { unitId: 'unit1' })
      grid = updateCellAt(grid, { x: 1, y: 0 }, { unitId: 'unit1' })
      grid = updateCellAt(grid, { x: 2, y: 0 }, { unitId: 'unit2' })

      const count = getOccupiedCellCount(grid)
      expect(count).toBe(3)
    })

    it('ユニットがない場合は0', () => {
      const grid = createEmptyGrid({ width: 5, height: 5 })

      const count = getOccupiedCellCount(grid)
      expect(count).toBe(0)
    })
  })

  describe('cloneGrid', () => {
    it('グリッドをディープコピー', () => {
      const grid = createEmptyGrid({ width: 3, height: 3 })
      const cloned = cloneGrid(grid)

      expect(cloned).toEqual(grid)
      expect(cloned).not.toBe(grid)
      expect(cloned[0]).not.toBe(grid[0])
      expect(cloned[0][0]).not.toBe(grid[0][0])
    })

    it('クローンを変更しても元のグリッドは変わらない', () => {
      const grid = createEmptyGrid({ width: 3, height: 3 })
      const cloned = cloneGrid(grid)

      cloned[0][0].state = CellState.HIT

      expect(grid[0][0].state).toBe(CellState.UNEXPLORED)
    })
  })
})

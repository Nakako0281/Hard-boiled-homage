import { create } from 'zustand'
import { BattlePhase, Turn, CellState, SpecialAttackType } from '@/lib/types/enums'
import type { Field } from '@/lib/types/grid'
import type { PlayerStats, EnemyStats } from '@/lib/types/stats'
import type { Enemy } from '@/lib/types/enemy'
import type { Position } from '@/lib/types/position'
import type { PlacedUnit } from '@/lib/types/unit'
import type { AttackLog, BattleResult } from '@/lib/types/battle'

/**
 * 攻撃結果
 */
interface AttackResult {
  success: boolean
  isHit: boolean
  damage?: number
  destroyedUnitId?: string
  canContinue: boolean
}

/**
 * 戦闘ストアの状態
 */
interface BattleState {
  // 戦闘フェーズ
  phase: BattlePhase
  turn: Turn

  // フィールド
  playerField: Field
  enemyField: Field

  // 戦闘中のステータス
  playerStats: PlayerStats
  enemyStats: EnemyStats

  // 対戦相手
  enemy: Enemy | null

  // 攻撃履歴
  attackHistory: AttackLog[]

  // 連続攻撃制御
  canContinueAttack: boolean
  consecutiveHits: number

  // 特殊攻撃状態
  activeSpecialAttack: {
    type: SpecialAttackType | null
    startTime?: number
    endTime?: number
    remainingAttacks?: number
  }

  // 特殊攻撃使用回数（ガプリーノ専用）
  specialAttackUsageCount: {
    player: { [unitId: string]: number }
    enemy: { [unitId: string]: number }
  }

  // 戦闘結果（結果フェーズで使用）
  battleResult: BattleResult | null

  // アニメーション制御
  isAnimating: boolean
  currentAnimation: {
    type: 'hit' | 'miss' | 'destroy' | 'special' | null
    position?: Position
  }
}

/**
 * 戦闘ストアのアクション
 */
interface BattleActions {
  // 戦闘初期化
  initializeBattle: (enemy: Enemy, playerUnits: PlacedUnit[]) => void
  resetBattle: () => void

  // フェーズ制御
  setPhase: (phase: BattlePhase) => void
  switchTurn: () => void

  // 攻撃処理
  attack: (position: Position) => AttackResult
  executeSpecialAttack: (unitId: string, position: Position) => AttackResult

  // HIT/MISS判定
  checkHit: (position: Position, field: Field) => boolean
  processHit: (position: Position, field: 'player' | 'enemy') => void
  processMiss: (position: Position, field: 'player' | 'enemy') => void

  // 部隊破壊
  checkUnitDestroyed: (unitId: string, field: Field) => boolean
  destroyUnit: (unitId: string, field: 'player' | 'enemy') => void

  // ダメージ処理
  calculateDamage: (attacker: 'player' | 'enemy') => number
  applyDamage: (target: 'player' | 'enemy', damage: number) => void

  // 地雷処理
  triggerCounterAttack: (target: 'player' | 'enemy') => void

  // 勝敗判定
  checkVictory: () => 'player' | 'enemy' | null
  endBattle: (winner: 'player' | 'enemy') => void

  // 特殊攻撃
  canUseSpecialAttack: (unitId: string) => boolean
  getSpecialAttackCost: (unitId: string) => number
  activateSpecialAttack: (type: SpecialAttackType) => void
  deactivateSpecialAttack: () => void

  // AI処理
  executeEnemyTurn: () => Promise<void>

  // アニメーション
  setAnimation: (
    type: 'hit' | 'miss' | 'destroy' | 'special',
    position?: Position
  ) => void
  clearAnimation: () => void

  // ユーティリティ
  getCellState: (position: Position, field: Field) => CellState
  getPlacedUnit: (position: Position, field: Field) => PlacedUnit | null
  isValidPosition: (position: Position, fieldSize: { width: number; height: number }) => boolean
}

/**
 * 空のフィールドを作成
 */
function createEmptyField(width: number, height: number): Field {
  const cells = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      position: { x, y },
      state: CellState.UNEXPLORED,
      isRevealed: false,
    }))
  )

  return {
    size: { width, height },
    cells,
    placedUnits: [],
  }
}

/**
 * 戦闘ストア
 */
export const useBattleStore = create<BattleState & BattleActions>(
  (set, get) => ({
    // State
    phase: BattlePhase.PLACEMENT,
    turn: Turn.PLAYER,
    playerField: createEmptyField(7, 7),
    enemyField: createEmptyField(7, 7),
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
    enemy: null,
    attackHistory: [],
    canContinueAttack: false,
    consecutiveHits: 0,
    activeSpecialAttack: {
      type: null,
    },
    specialAttackUsageCount: {
      player: {},
      enemy: {},
    },
    battleResult: null,
    isAnimating: false,
    currentAnimation: {
      type: null,
    },

    // Actions
    initializeBattle: (enemy, playerUnits) => {
      // TODO: プレイヤーのARレベルに応じたフィールドサイズ決定
      // TODO: 敵のARレベルに応じたフィールドサイズ決定
      // TODO: 敵の部隊をランダム配置（AI）
      // TODO: 先制攻撃判定

      const playerFieldSize = 7 + 0 // AR level - 1
      const enemyFieldSize = 7 + (enemy.stats.AR - 1)

      set({
        phase: BattlePhase.BATTLE,
        turn: Turn.PLAYER,
        playerField: {
          ...createEmptyField(playerFieldSize, playerFieldSize),
          placedUnits: playerUnits,
        },
        enemyField: createEmptyField(enemyFieldSize, enemyFieldSize),
        playerStats: { ...get().playerStats },
        enemyStats: { ...enemy.stats },
        enemy,
        attackHistory: [],
        canContinueAttack: false,
        consecutiveHits: 0,
        activeSpecialAttack: { type: null },
        specialAttackUsageCount: { player: {}, enemy: {} },
        battleResult: null,
      })
    },

    resetBattle: () =>
      set({
        phase: BattlePhase.PLACEMENT,
        turn: Turn.PLAYER,
        playerField: createEmptyField(7, 7),
        enemyField: createEmptyField(7, 7),
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
        enemy: null,
        attackHistory: [],
        canContinueAttack: false,
        consecutiveHits: 0,
        activeSpecialAttack: { type: null },
        specialAttackUsageCount: { player: {}, enemy: {} },
        battleResult: null,
        isAnimating: false,
        currentAnimation: { type: null },
      }),

    setPhase: (phase) => set({ phase }),

    switchTurn: () =>
      set((state) => ({
        turn: state.turn === Turn.PLAYER ? Turn.ENEMY : Turn.PLAYER,
        canContinueAttack: false,
        consecutiveHits: 0,
      })),

    attack: (position) => {
      const state = get()

      // 1. 有効性チェック
      const targetField = state.turn === Turn.PLAYER ? state.enemyField : state.playerField
      if (!get().isValidPosition(position, targetField.size)) {
        return { success: false, isHit: false, canContinue: false }
      }

      // 2. HIT判定
      const isHit = get().checkHit(position, targetField)

      if (isHit) {
        // 3a. HIT処理
        get().processHit(position, state.turn === Turn.PLAYER ? 'enemy' : 'player')

        // 4a. 部隊破壊判定
        const unit = get().getPlacedUnit(position, targetField)
        if (unit && get().checkUnitDestroyed(unit.unitId, targetField)) {
          get().destroyUnit(unit.unitId, state.turn === Turn.PLAYER ? 'enemy' : 'player')

          // 5a. 地雷判定（TODO: 地雷の判定ロジック）
          // if (unit.unitId === 'mine') {
          //   get().triggerCounterAttack(state.turn === Turn.PLAYER ? 'player' : 'enemy')
          //   return { success: true, isHit: true, canContinue: false, destroyedUnitId: unit.unitId }
          // }
        }

        set((state) => ({
          canContinueAttack: true,
          consecutiveHits: state.consecutiveHits + 1,
        }))

        return {
          success: true,
          isHit: true,
          canContinue: true,
          destroyedUnitId: unit?.unitId,
        }
      } else {
        // 3b. MISS処理
        get().processMiss(position, state.turn === Turn.PLAYER ? 'enemy' : 'player')

        // 4b. ダメージ計算・適用
        const damage = get().calculateDamage(
          state.turn === Turn.PLAYER ? 'player' : 'enemy'
        )
        get().applyDamage(
          state.turn === Turn.PLAYER ? 'enemy' : 'player',
          damage
        )

        // 5b. ターン交代
        get().switchTurn()

        return { success: true, isHit: false, canContinue: false, damage }
      }
    },

    executeSpecialAttack: (_unitId, _position) => {
      // TODO: 特殊攻撃の実装
      return { success: false, isHit: false, canContinue: false }
    },

    checkHit: (position, field) => {
      const cell = field.cells[position.y][position.x]
      return !!(
        cell.unitId !== undefined && cell.state === CellState.UNEXPLORED
      )
    },

    processHit: (position, fieldType) => {
      set((state) => {
        const field = fieldType === 'player' ? state.playerField : state.enemyField
        const newCells = field.cells.map((row, y) =>
          row.map((cell, x) => {
            if (x === position.x && y === position.y) {
              return { ...cell, state: CellState.HIT, isRevealed: true }
            }
            return cell
          })
        )

        return {
          [fieldType === 'player' ? 'playerField' : 'enemyField']: {
            ...field,
            cells: newCells,
          },
        }
      })
    },

    processMiss: (position, fieldType) => {
      set((state) => {
        const field = fieldType === 'player' ? state.playerField : state.enemyField
        const newCells = field.cells.map((row, y) =>
          row.map((cell, x) => {
            if (x === position.x && y === position.y) {
              return { ...cell, state: CellState.MISS, isRevealed: true }
            }
            return cell
          })
        )

        return {
          [fieldType === 'player' ? 'playerField' : 'enemyField']: {
            ...field,
            cells: newCells,
          },
        }
      })
    },

    checkUnitDestroyed: (unitId, field) => {
      const unit = field.placedUnits.find((u) => u.unitId === unitId)
      if (!unit) return false

      // すべてのoccupiedCellsがHITされているかチェック
      return unit.occupiedCells.every((pos) => {
        const cell = field.cells[pos.y][pos.x]
        return cell.state === CellState.HIT
      })
    },

    destroyUnit: (unitId, fieldType) => {
      set((state) => {
        const field =
          fieldType === 'player' ? state.playerField : state.enemyField

        return {
          [fieldType === 'player' ? 'playerField' : 'enemyField']: {
            ...field,
            placedUnits: field.placedUnits.map((u) =>
              u.unitId === unitId ? { ...u, isDestroyed: true } : u
            ),
          },
        }
      })
    },

    calculateDamage: (attacker) => {
      const state = get()
      const attackerStats =
        attacker === 'player' ? state.playerStats : state.enemyStats

      // baseDamage = AT × (1 + random(-0.1, 0.1))
      const randomFactor = 1 + (Math.random() * 0.2 - 0.1)
      const baseDamage = Math.floor(attackerStats.AT * randomFactor)

      // TODO: 攻撃力補正（石油タンカー、M4戦車、巨大飛行艇）を計算
      // TODO: 防御力補正（消防車、ダンプ、巨大飛行艇）を計算

      return Math.max(1, baseDamage)
    },

    applyDamage: (target, damage) => {
      set((state) => {
        if (target === 'player') {
          return {
            playerStats: {
              ...state.playerStats,
              HP: Math.max(0, state.playerStats.HP - damage),
            },
          }
        } else {
          return {
            enemyStats: {
              ...state.enemyStats,
              HP: Math.max(0, state.enemyStats.HP - damage),
            },
          }
        }
      })
    },

    triggerCounterAttack: (target) => {
      // TODO: 地雷のカウンター攻撃実装
      // 固定1ダメージ
      get().applyDamage(target, 1)
    },

    checkVictory: () => {
      const state = get()

      // プレイヤー勝利条件
      if (state.enemyStats.HP <= 0) {
        return 'player'
      }
      if (
        state.enemyField.placedUnits.length > 0 &&
        state.enemyField.placedUnits.every((u) => u.isDestroyed)
      ) {
        return 'player'
      }

      // 敵勝利条件
      if (state.playerStats.HP <= 0) {
        return 'enemy'
      }
      if (
        state.playerField.placedUnits.length > 0 &&
        state.playerField.placedUnits.every((u) => u.isDestroyed)
      ) {
        return 'enemy'
      }

      return null
    },

    endBattle: (_winner) => {
      // TODO: 戦闘結果を計算
      // TODO: playerStoreを更新
      // TODO: gameStoreを更新
      set({ phase: BattlePhase.RESULT })
    },

    canUseSpecialAttack: (_unitId) => {
      // TODO: 特殊攻撃使用可能判定
      return false
    },

    getSpecialAttackCost: (_unitId) => {
      // TODO: 特殊攻撃のSP消費量を取得
      return 0
    },

    activateSpecialAttack: (type) => {
      set({ activeSpecialAttack: { type } })
    },

    deactivateSpecialAttack: () => {
      set({ activeSpecialAttack: { type: null } })
    },

    executeEnemyTurn: async () => {
      // TODO: AIエンジンを呼び出して次の手を決定
      // TODO: 攻撃実行
      // TODO: 勝敗判定
    },

    setAnimation: (type, position) => {
      set({
        isAnimating: true,
        currentAnimation: { type, position },
      })
    },

    clearAnimation: () => {
      set({
        isAnimating: false,
        currentAnimation: { type: null },
      })
    },

    getCellState: (position, field) => {
      return field.cells[position.y][position.x].state
    },

    getPlacedUnit: (position, field) => {
      return (
        field.placedUnits.find((unit) =>
          unit.occupiedCells.some(
            (pos) => pos.x === position.x && pos.y === position.y
          )
        ) || null
      )
    },

    isValidPosition: (position, fieldSize) => {
      return (
        position.x >= 0 &&
        position.x < fieldSize.width &&
        position.y >= 0 &&
        position.y < fieldSize.height
      )
    },
  })
)

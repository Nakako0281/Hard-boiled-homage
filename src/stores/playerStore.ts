import { create } from 'zustand'
import { CharacterType, StatType } from '@/lib/types/enums'
import type {
  PlayerStats,
  PlayerMaxStats,
  PlayerLevel,
} from '@/lib/types/stats'
import type { PlacedUnit } from '@/lib/types/unit'
import type { SaveData } from '@/lib/types/storage'

/**
 * プレイヤーストアの状態
 */
interface PlayerState {
  // キャラクター
  character: CharacterType | null

  // ステータス
  stats: PlayerStats
  maxStats: PlayerMaxStats
  levels: PlayerLevel

  // 経済
  money: number
  exp: number

  // 部隊
  ownedUnits: string[] // 所持部隊IDの配列
  placedUnits: PlacedUnit[] // 配置済み部隊（戦闘中のみ使用）
}

/**
 * プレイヤーストアのアクション
 */
interface PlayerActions {
  // 初期化
  selectCharacter: (character: CharacterType) => void
  resetPlayer: () => void

  // ステータス管理
  updateStats: (stats: Partial<PlayerStats>) => void
  restoreStats: () => void // maxStatsに戻す

  // ダメージ・回復
  takeDamage: (amount: number) => void
  canHeal: () => boolean
  heal: () => {
    success: boolean
    healAmount: number
    spCost: number
    reason?: string
  }
  consumeSP: (amount: number) => boolean

  // 経済
  addMoney: (amount: number) => void
  spendMoney: (amount: number) => boolean
  addExp: (amount: number) => void

  // レベルアップ
  canLevelUp: (stat: StatType) => boolean
  getLevelUpCost: (stat: StatType) => number
  levelUp: (stat: StatType) => boolean

  // 部隊管理
  buyUnit: (unitId: string, price: number) => boolean
  hasUnit: (unitId: string) => boolean
  getUnitCount: (unitId: string) => number

  // 部隊配置（戦闘準備フェーズ）
  placeUnit: (unit: PlacedUnit) => boolean
  removeUnit: (unitId: string) => void
  clearPlacedUnits: () => void
  canPlaceUnit: (unitId: string) => boolean

  // セーブ用データ取得
  getPlayerData: () => SaveData['player']
  loadPlayerData: (data: SaveData['player']) => void
}

/**
 * レベルアップコスト計算
 */
function calculateLevelUpCost(stat: StatType, currentLevel: number): number {
  const baseCost: Record<StatType, number> = {
    [StatType.HP]: 50,
    [StatType.SP]: 30,
    [StatType.AT]: 40,
    [StatType.DF]: 35,
    [StatType.AR]: 60,
  }

  return Math.floor(baseCost[stat] * Math.pow(1.3, currentLevel - 1))
}

/**
 * 初期ステータス
 */
const initialStats: PlayerStats = {
  HP: 100,
  maxHP: 100,
  SP: 50,
  maxSP: 50,
  AT: 10,
  DF: 5,
  AR: 1,
}

const initialMaxStats: PlayerMaxStats = {
  maxHP: 100,
  maxSP: 50,
  maxAR: 11,
}

const initialLevels: PlayerLevel = {
  [StatType.HP]: 1,
  [StatType.SP]: 1,
  [StatType.AT]: 1,
  [StatType.DF]: 1,
  [StatType.AR]: 1,
}

/**
 * プレイヤーストア
 */
export const usePlayerStore = create<PlayerState & PlayerActions>(
  (set, get) => ({
    // State
    character: null,
    stats: { ...initialStats },
    maxStats: { ...initialMaxStats },
    levels: { ...initialLevels },
    money: 0,
    exp: 0,
    ownedUnits: [],
    placedUnits: [],

    // Actions
    selectCharacter: (character) => set({ character }),

    resetPlayer: () =>
      set({
        character: null,
        stats: { ...initialStats },
        maxStats: { ...initialMaxStats },
        levels: { ...initialLevels },
        money: 0,
        exp: 0,
        ownedUnits: [],
        placedUnits: [],
      }),

    updateStats: (newStats) =>
      set((state) => ({
        stats: { ...state.stats, ...newStats },
      })),

    restoreStats: () =>
      set((state) => ({
        stats: {
          HP: state.maxStats.maxHP,
          maxHP: state.maxStats.maxHP,
          SP: state.maxStats.maxSP,
          maxSP: state.maxStats.maxSP,
          AT: state.stats.AT,
          DF: state.stats.DF,
          AR: state.stats.AR,
        },
      })),

    takeDamage: (amount) =>
      set((state) => ({
        stats: {
          ...state.stats,
          HP: Math.max(0, state.stats.HP - amount),
        },
      })),

    canHeal: () => {
      const state = get()
      const maxHealAmount = Math.floor(state.stats.maxHP * 0.3)
      const missingHP = state.stats.maxHP - state.stats.HP

      // 最低回復量を満たせるか && SPが足りるか
      return missingHP >= maxHealAmount && state.stats.SP >= maxHealAmount
    },

    heal: () => {
      const state = get()

      // 回復量を計算（最大HPの30%）
      const maxHealAmount = Math.floor(state.stats.maxHP * 0.3)
      const missingHP = state.stats.maxHP - state.stats.HP
      const actualHealAmount = Math.min(maxHealAmount, missingHP)

      // 回復可能性チェック
      if (actualHealAmount < maxHealAmount) {
        return {
          success: false,
          healAmount: 0,
          spCost: 0,
          reason: `最低${maxHealAmount}HP回復できません`,
        }
      }

      // SP消費量（1HP = 1SP）
      const spCost = actualHealAmount

      if (state.stats.SP < spCost) {
        return {
          success: false,
          healAmount: 0,
          spCost: 0,
          reason: 'SPが不足しています',
        }
      }

      // 回復を実行
      set((state) => ({
        stats: {
          ...state.stats,
          HP: Math.min(
            state.stats.maxHP,
            state.stats.HP + actualHealAmount
          ),
          SP: state.stats.SP - spCost,
        },
      }))

      return {
        success: true,
        healAmount: actualHealAmount,
        spCost,
      }
    },

    consumeSP: (amount) => {
      const state = get()
      if (state.stats.SP < amount) return false

      set((state) => ({
        stats: { ...state.stats, SP: state.stats.SP - amount },
      }))
      return true
    },

    addMoney: (amount) =>
      set((state) => ({
        money: state.money + amount,
      })),

    spendMoney: (amount) => {
      const state = get()
      if (state.money < amount) return false

      set({ money: state.money - amount })
      return true
    },

    addExp: (amount) =>
      set((state) => ({
        exp: state.exp + amount,
      })),

    canLevelUp: (stat) => {
      const state = get()
      const cost = get().getLevelUpCost(stat)
      return state.money >= cost
    },

    getLevelUpCost: (stat) => {
      const state = get()
      return calculateLevelUpCost(stat, state.levels[stat])
    },

    levelUp: (stat) => {
      const cost = get().getLevelUpCost(stat)

      if (!get().spendMoney(cost)) return false

      // ステータス上昇量
      const increases: Record<StatType, number> = {
        [StatType.HP]: 20,
        [StatType.SP]: 10,
        [StatType.AT]: 5,
        [StatType.DF]: 3,
        [StatType.AR]: 1,
      }

      const increase = increases[stat]

      set((state) => {
        const newStats = { ...state.stats }
        const newMaxStats = { ...state.maxStats }

        // ステータスを上昇
        newStats[stat] = state.stats[stat] + increase

        // HP/SPの場合は最大値も更新
        if (stat === StatType.HP) {
          newStats.maxHP = state.stats.maxHP + increase
          newMaxStats.maxHP = state.maxStats.maxHP + increase
        } else if (stat === StatType.SP) {
          newStats.maxSP = state.stats.maxSP + increase
          newMaxStats.maxSP = state.maxStats.maxSP + increase
        }

        return {
          levels: { ...state.levels, [stat]: state.levels[stat] + 1 },
          stats: newStats,
          maxStats: newMaxStats,
        }
      })

      return true
    },

    buyUnit: (unitId, price) => {
      if (!get().spendMoney(price)) return false

      set((state) => ({
        ownedUnits: [...state.ownedUnits, unitId],
      }))
      return true
    },

    hasUnit: (unitId) => {
      return get().ownedUnits.includes(unitId)
    },

    getUnitCount: (unitId) => {
      return get().ownedUnits.filter((id) => id === unitId).length
    },

    placeUnit: (unit) => {
      // TODO: 配置可能かチェック
      // - 同じ部隊が既に配置されていないか（地雷以外）
      // - 配置位置が有効か
      // - グリッド内に収まるか

      set((state) => ({
        placedUnits: [...state.placedUnits, unit],
      }))
      return true
    },

    removeUnit: (unitId) => {
      set((state) => ({
        placedUnits: state.placedUnits.filter((u) => u.unitId !== unitId),
      }))
    },

    clearPlacedUnits: () => set({ placedUnits: [] }),

    canPlaceUnit: (unitId) => {
      // TODO: 配置可能判定ロジック
      const state = get()
      return state.ownedUnits.includes(unitId)
    },

    getPlayerData: () => {
      const state = get()
      return {
        character: state.character!,
        stats: state.stats,
        maxStats: state.maxStats,
        levels: state.levels,
        money: state.money,
        exp: state.exp,
        ownedUnits: state.ownedUnits,
      }
    },

    loadPlayerData: (data) => {
      set({
        character: data.character,
        stats: data.stats,
        maxStats: data.maxStats,
        levels: data.levels,
        money: data.money,
        exp: data.exp,
        ownedUnits: data.ownedUnits,
      })
    },
  })
)

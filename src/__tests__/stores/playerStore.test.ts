import { describe, it, expect, beforeEach } from 'vitest'
import { usePlayerStore } from '@/stores/playerStore'
import { CharacterType, StatType } from '@/lib/types/enums'

describe('playerStore', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    usePlayerStore.getState().resetPlayer()
  })

  describe('初期化', () => {
    it('初期状態が正しく設定されている', () => {
      const state = usePlayerStore.getState()

      expect(state.character).toBeNull()
      expect(state.stats.HP).toBe(100)
      expect(state.stats.SP).toBe(50)
      expect(state.money).toBe(0)
      expect(state.exp).toBe(0)
      expect(state.ownedUnits).toEqual([])
    })

    it('キャラクターを選択できる', () => {
      const { selectCharacter } = usePlayerStore.getState()

      selectCharacter(CharacterType.JACK)

      expect(usePlayerStore.getState().character).toBe(CharacterType.JACK)
    })
  })

  describe('ステータス管理', () => {
    it('ダメージを受けるとHPが減少する', () => {
      const { takeDamage } = usePlayerStore.getState()

      takeDamage(30)

      expect(usePlayerStore.getState().stats.HP).toBe(70)
    })

    it('HPが0未満にならない', () => {
      const { takeDamage } = usePlayerStore.getState()

      takeDamage(150)

      expect(usePlayerStore.getState().stats.HP).toBe(0)
    })

    it('statsを更新できる', () => {
      const { updateStats } = usePlayerStore.getState()

      updateStats({ HP: 80, SP: 30 })

      const state = usePlayerStore.getState()
      expect(state.stats.HP).toBe(80)
      expect(state.stats.SP).toBe(30)
    })
  })

  describe('回復処理', () => {
    beforeEach(() => {
      // HPを減らしておく
      usePlayerStore.getState().takeDamage(40)
    })

    it('回復可能な場合はtrueを返す', () => {
      const { canHeal } = usePlayerStore.getState()

      expect(canHeal()).toBe(true)
    })

    it('回復処理が成功する', () => {
      const { heal } = usePlayerStore.getState()
      const initialHP = usePlayerStore.getState().stats.HP

      const result = heal()

      expect(result.success).toBe(true)
      expect(result.healAmount).toBe(30) // 最大HPの30%
      expect(result.spCost).toBe(30)
      expect(usePlayerStore.getState().stats.HP).toBe(initialHP + 30)
    })

    it('SP不足の場合は回復できない', () => {
      const { consumeSP, heal } = usePlayerStore.getState()

      // SPを消費
      consumeSP(40)

      const result = heal()

      expect(result.success).toBe(false)
      expect(result.reason).toBe('SPが不足しています')
    })
  })

  describe('経済システム', () => {
    it('お金を追加できる', () => {
      const { addMoney } = usePlayerStore.getState()

      addMoney(100)

      expect(usePlayerStore.getState().money).toBe(100)
    })

    it('お金を使える', () => {
      const { addMoney, spendMoney } = usePlayerStore.getState()

      addMoney(100)
      const result = spendMoney(60)

      expect(result).toBe(true)
      expect(usePlayerStore.getState().money).toBe(40)
    })

    it('所持金不足の場合は使えない', () => {
      const { spendMoney } = usePlayerStore.getState()

      const result = spendMoney(100)

      expect(result).toBe(false)
      expect(usePlayerStore.getState().money).toBe(0)
    })

    it('経験値を追加できる', () => {
      const { addExp } = usePlayerStore.getState()

      addExp(50)

      expect(usePlayerStore.getState().exp).toBe(50)
    })
  })

  describe('レベルアップ', () => {
    beforeEach(() => {
      // お金を追加
      usePlayerStore.getState().addMoney(1000)
    })

    it('HPレベルアップでHPが増加する', () => {
      const { levelUp } = usePlayerStore.getState()
      const initialHP = usePlayerStore.getState().stats.HP
      const initialMaxHP = usePlayerStore.getState().stats.maxHP

      const result = levelUp(StatType.HP)

      expect(result).toBe(true)
      const state = usePlayerStore.getState()
      expect(state.stats.HP).toBe(initialHP + 20)
      expect(state.stats.maxHP).toBe(initialMaxHP + 20)
      expect(state.levels[StatType.HP]).toBe(2)
    })

    it('ATレベルアップでATが増加する', () => {
      const { levelUp } = usePlayerStore.getState()
      const initialAT = usePlayerStore.getState().stats.AT

      const result = levelUp(StatType.AT)

      expect(result).toBe(true)
      expect(usePlayerStore.getState().stats.AT).toBe(initialAT + 5)
      expect(usePlayerStore.getState().levels[StatType.AT]).toBe(2)
    })

    it('お金が不足している場合はレベルアップできない', () => {
      const { resetPlayer, levelUp } = usePlayerStore.getState()

      resetPlayer()

      const result = levelUp(StatType.HP)

      expect(result).toBe(false)
      expect(usePlayerStore.getState().levels[StatType.HP]).toBe(1)
    })

    it('レベルアップコストが正しく計算される', () => {
      const { getLevelUpCost } = usePlayerStore.getState()

      const cost1 = getLevelUpCost(StatType.HP)
      expect(cost1).toBe(50) // レベル1→2

      // レベルアップ後
      usePlayerStore.getState().levelUp(StatType.HP)
      const cost2 = getLevelUpCost(StatType.HP)
      expect(cost2).toBe(Math.floor(50 * 1.3)) // レベル2→3
    })
  })

  describe('部隊管理', () => {
    it('部隊を購入できる', () => {
      const { addMoney, buyUnit } = usePlayerStore.getState()

      addMoney(100)
      const result = buyUnit('ambulance', 80)

      expect(result).toBe(true)
      expect(usePlayerStore.getState().ownedUnits).toContain('ambulance')
      expect(usePlayerStore.getState().money).toBe(20)
    })

    it('所持金不足の場合は部隊を購入できない', () => {
      const { buyUnit } = usePlayerStore.getState()

      const result = buyUnit('ambulance', 80)

      expect(result).toBe(false)
      expect(usePlayerStore.getState().ownedUnits).toEqual([])
    })

    it('部隊の所持数を取得できる', () => {
      const { addMoney, buyUnit, getUnitCount } = usePlayerStore.getState()

      addMoney(200)
      buyUnit('mine', 50)
      buyUnit('mine', 50)
      buyUnit('ambulance', 50)

      expect(getUnitCount('mine')).toBe(2)
      expect(getUnitCount('ambulance')).toBe(1)
      expect(getUnitCount('harrier')).toBe(0)
    })
  })

  describe('セーブ/ロード', () => {
    it('プレイヤーデータを取得できる', () => {
      const { selectCharacter, addMoney, addExp, getPlayerData } =
        usePlayerStore.getState()

      selectCharacter(CharacterType.GAPRINO)
      addMoney(500)
      addExp(100)

      const data = getPlayerData()

      expect(data.character).toBe(CharacterType.GAPRINO)
      expect(data.money).toBe(500)
      expect(data.exp).toBe(100)
    })

    it('プレイヤーデータをロードできる', () => {
      const { loadPlayerData } = usePlayerStore.getState()

      const mockData = {
        character: CharacterType.JACK,
        stats: {
          HP: 120,
          maxHP: 120,
          SP: 60,
          maxSP: 60,
          AT: 15,
          DF: 8,
          AR: 2,
        },
        maxStats: {
          maxHP: 120,
          maxSP: 60,
          maxAR: 11,
        },
        levels: {
          [StatType.HP]: 2,
          [StatType.SP]: 2,
          [StatType.AT]: 2,
          [StatType.DF]: 2,
          [StatType.AR]: 2,
        },
        money: 300,
        exp: 50,
        ownedUnits: ['ambulance', 'mine'],
      }

      loadPlayerData(mockData)

      const state = usePlayerStore.getState()
      expect(state.character).toBe(CharacterType.JACK)
      expect(state.stats.HP).toBe(120)
      expect(state.money).toBe(300)
      expect(state.ownedUnits).toEqual(['ambulance', 'mine'])
    })
  })
})

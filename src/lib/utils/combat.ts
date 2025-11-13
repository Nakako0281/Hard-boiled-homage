import type { PlacedUnit } from '@/lib/types/unit'
import type { BattleState, BattleResult } from '@/lib/types/battle'
import { StatType } from '@/lib/types/enums'

/**
 * 攻撃力補正を計算
 * @param placedUnits 配置部隊リスト
 * @returns 攻撃力の補正倍率
 */
export function calculateAttackBonus(placedUnits: PlacedUnit[]): number {
  let bonus = 0

  // 石油タンカー: +30%
  if (
    placedUnits.some((u) => u.unitId === 'oil_tanker' && !u.isDestroyed)
  ) {
    bonus += 0.3
  }

  // M4戦車: +50%
  if (placedUnits.some((u) => u.unitId === 'm4_tank' && !u.isDestroyed)) {
    bonus += 0.5
  }

  // 巨大飛行艇: ステータスUP効果値を2倍に
  const hasGiantAirship = placedUnits.some(
    (u) => u.unitId === 'giant_airship' && !u.isDestroyed
  )
  const hasAtkBuffUnit = placedUnits.some(
    (u) =>
      (u.unitId === 'oil_tanker' || u.unitId === 'm4_tank') && !u.isDestroyed
  )

  if (hasGiantAirship && hasAtkBuffUnit && bonus > 0) {
    bonus *= 2 // ボーナス値を2倍に
  }

  return bonus
}

/**
 * 防御力補正を計算
 * @param placedUnits 配置部隊リスト
 * @returns 防御力の補正倍率
 */
export function calculateDefenseBonus(placedUnits: PlacedUnit[]): number {
  let bonus = 0

  // 消防車: +20%
  if (
    placedUnits.some((u) => u.unitId === 'fire_truck' && !u.isDestroyed)
  ) {
    bonus += 0.2
  }

  // ダンプ: +30%
  if (placedUnits.some((u) => u.unitId === 'dump_truck' && !u.isDestroyed)) {
    bonus += 0.3
  }

  // 巨大飛行艇: ステータスUP効果値を2倍に
  const hasGiantAirship = placedUnits.some(
    (u) => u.unitId === 'giant_airship' && !u.isDestroyed
  )
  const hasDefBuffUnit = placedUnits.some(
    (u) =>
      (u.unitId === 'fire_truck' || u.unitId === 'dump_truck') &&
      !u.isDestroyed
  )

  if (hasGiantAirship && hasDefBuffUnit && bonus > 0) {
    bonus *= 2 // ボーナス値を2倍に
  }

  return bonus
}

/**
 * 直接攻撃（部隊に外れた時）のダメージを計算
 * @param attacker 攻撃側（'player' or 'enemy'）
 * @param state 戦闘状態
 * @returns ダメージ量
 */
export function calculateDirectDamage(
  attacker: 'player' | 'enemy',
  state: BattleState
): number {
  // 1. 攻撃側と防御側のデータを取得
  const attackerStats =
    attacker === 'player' ? state.playerStats : state.enemyStats
  const defenderStats =
    attacker === 'player' ? state.enemyStats : state.playerStats
  const attackerUnits =
    attacker === 'player'
      ? state.playerField.placedUnits
      : state.enemyField.placedUnits
  const defenderUnits =
    attacker === 'player'
      ? state.enemyField.placedUnits
      : state.playerField.placedUnits

  // 2. 基本攻撃力を取得
  const baseAT = attackerStats.AT
  const baseDF = defenderStats.DF

  // 3. ランダムブレ（±10%）
  const randomFactor = 1 + (Math.random() * 0.2 - 0.1) // 0.9 ~ 1.1

  // 4. 攻撃力補正を計算
  const atkBonus = calculateAttackBonus(attackerUnits)
  const totalAT = baseAT * (1 + atkBonus) * randomFactor

  // 5. 防御力補正を計算
  const defBonus = calculateDefenseBonus(defenderUnits)
  const totalDF = baseDF * (1 + defBonus)

  // 6. 最終ダメージ計算（最低1ダメージ保証）
  const finalDamage = Math.max(1, Math.floor(totalAT - totalDF))

  return finalDamage
}

/**
 * 部隊破壊時の経験値を計算
 * @param unitSize 破壊した部隊のサイズ（マス数）
 * @returns 経験値
 */
export function calculateDestroyExp(unitSize: number): number {
  // 1マスあたり5 EXP
  return unitSize * 5
}

/**
 * 戦闘終了時の最終経験値を計算
 * @param state 戦闘状態
 * @param baseExp 基本経験値（破壊した部隊の合計）
 * @returns 最終経験値
 */
export function calculateFinalExp(
  state: BattleState,
  baseExp: number
): number {
  // 1. 占有率ボーナス
  const totalCells =
    state.playerField.size.width * state.playerField.size.height
  const occupiedCells = state.playerField.placedUnits.reduce(
    (sum, u) => sum + u.occupiedCells.length,
    0
  )
  const occupancyRate = occupiedCells / totalCells
  const occupancyBonus = baseExp * occupancyRate * 0.5

  let finalExp = baseExp + occupancyBonus

  // 2. 旅客機ボーナス（生存していれば×1.5）
  const hasPassengerPlane = state.playerField.placedUnits.some(
    (u) => u.unitId === 'passenger_plane' && !u.isDestroyed
  )

  if (hasPassengerPlane) {
    finalExp *= 1.5
  }

  return Math.floor(finalExp)
}

/**
 * 戦闘終了時の報酬を計算
 * @param state 戦闘状態
 * @param winner 勝者
 * @param baseExp 基本経験値
 * @returns 戦闘結果
 */
export function calculateBattleResult(
  state: BattleState,
  winner: 'player' | 'enemy',
  baseExp: number
): BattleResult {
  const isVictory = winner === 'player'

  // 破壊した部隊数をカウント
  const unitsDestroyed = state.enemyField.placedUnits.filter(
    (u) => u.isDestroyed
  ).length
  const unitsLost = state.playerField.placedUnits.filter(
    (u) => u.isDestroyed
  ).length

  const totalExp = calculateFinalExp(state, baseExp)

  // 賞金計算（勝利時のみ）
  let totalReward = 0
  let hpBonus = 0
  let unitsBonus = 0

  if (isVictory && state.enemy) {
    const baseReward = state.enemy.baseReward

    // HP残存率（maxHPを使用）
    const hpRate = state.playerStats.HP / state.playerStats.maxHP
    hpBonus = Math.floor(baseReward * hpRate * 0.5)

    // 部隊残存率
    const totalUnits = state.playerField.placedUnits.length
    const remainingUnits = totalUnits - unitsLost
    const unitsRate = totalUnits > 0 ? remainingUnits / totalUnits : 0
    unitsBonus = Math.floor(baseReward * unitsRate * 0.3)

    totalReward = Math.floor(baseReward + hpBonus + unitsBonus)
  }

  // 旅客機ボーナスの判定
  const hasPassengerPlane = state.playerField.placedUnits.some(
    (u) => u.unitId === 'passenger_plane' && !u.isDestroyed
  )

  return {
    isVictory,
    totalDamageDealt: 0, // 攻撃履歴から計算する必要がある
    totalDamageReceived: 0, // 攻撃履歴から計算する必要がある
    unitsDestroyed,
    unitsLost,
    baseReward: state.enemy?.baseReward || 0,
    hpBonus,
    unitsBonus,
    totalReward,
    baseExp,
    occupancyBonus: Math.floor(baseExp * (state.playerField.placedUnits.reduce(
      (sum, u) => sum + u.occupiedCells.length,
      0
    ) / (state.playerField.size.width * state.playerField.size.height)) * 0.5),
    passengerBonus: hasPassengerPlane,
    totalExp,
    remainingHP: state.playerStats.HP,
    remainingUnits: state.playerField.placedUnits.length - unitsLost,
  }
}

/**
 * HP回復にかかるコストを計算
 * @param healAmount 回復量
 * @returns コスト（SP）
 */
export function calculateHealCost(healAmount: number): number {
  return healAmount // 1HP = 1SP
}

/**
 * レベルアップコストを計算
 * @param stat ステータスタイプ
 * @param currentLevel 現在のレベル
 * @returns コスト（お金）
 */
export function calculateLevelUpCost(
  stat: StatType,
  currentLevel: number
): number {
  const baseCost: Record<StatType, number> = {
    [StatType.HP]: 50,
    [StatType.SP]: 50,
    [StatType.AT]: 50,
    [StatType.DF]: 50,
    [StatType.AR]: 100,
  }

  // 指数関数的に増加: baseCost * 1.3^(currentLevel - 1)
  return Math.floor(baseCost[stat] * Math.pow(1.3, currentLevel - 1))
}

/**
 * ARレベルからグリッドサイズを計算
 * @param arLevel ARレベル（1～11）
 * @returns グリッドサイズ
 */
export function getGridSizeFromAR(arLevel: number): {
  width: number
  height: number
} {
  // 基本サイズ: 7x7
  const baseWidth = 7
  const baseHeight = 7

  // ARレベル1が基準
  if (arLevel === 1) {
    return { width: baseWidth, height: baseHeight }
  }

  // ARレベル2以降は交互に横・縦を拡張
  let width = baseWidth
  let height = baseHeight

  for (let level = 2; level <= arLevel; level++) {
    // 偶数レベル: 横方向拡張
    if (level % 2 === 0) {
      width++
    }
    // 奇数レベル: 縦方向拡張
    else {
      height++
    }
  }

  return { width, height }
}

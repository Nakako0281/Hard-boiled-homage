import type { Position } from '@/lib/types/position'
import type { Field } from '@/lib/types/grid'
import type { BattleState } from '@/lib/types/battle'
import type { PlacedUnit, Unit } from '@/lib/types/unit'
import { CellState, SpecialAttackType, Turn } from '@/lib/types/enums'
import { isPositionInBounds } from '@/lib/utils/position'
import { executeAttack, getRandomUnexploredCell, processHit } from './combat'

/**
 * 特殊攻撃範囲取得結果
 */
export interface SpecialAttackTargets {
  positions: Position[]
  multiplier: number
}

/**
 * 航空母艦の効果を適用
 * 全特殊攻撃の範囲を2倍にする
 * @param placedUnits 配置部隊リスト
 * @returns 倍率（1 or 2）
 */
export function getSpecialAttackRangeMultiplier(
  placedUnits: PlacedUnit[]
): number {
  const hasCarrier = placedUnits.some(
    (u) => u.unitId === 'aircraft_carrier' && !u.isDestroyed
  )
  return hasCarrier ? 2 : 1
}

/**
 * 十字爆撃の攻撃範囲を取得
 * @param center 中心座標
 * @param field 対象フィールド
 * @param rangeMultiplier 範囲倍率（航空母艦効果用、デフォルト1）
 * @returns 攻撃対象セルの配列
 */
export function getCrossBombingTargets(
  center: Position,
  field: Field,
  rangeMultiplier: number = 1
): Position[] {
  const targets: Position[] = [center] // 中心を含む
  const baseRange = 3 // 基本範囲：上下左右3マス
  const range = baseRange * rangeMultiplier // 航空母艦があれば6マス

  // 上方向
  for (let i = 1; i <= range; i++) {
    const pos = { x: center.x, y: center.y - i }
    if (isPositionInBounds(pos, field.size)) {
      targets.push(pos)
    }
  }

  // 下方向
  for (let i = 1; i <= range; i++) {
    const pos = { x: center.x, y: center.y + i }
    if (isPositionInBounds(pos, field.size)) {
      targets.push(pos)
    }
  }

  // 左方向
  for (let i = 1; i <= range; i++) {
    const pos = { x: center.x - i, y: center.y }
    if (isPositionInBounds(pos, field.size)) {
      targets.push(pos)
    }
  }

  // 右方向
  for (let i = 1; i <= range; i++) {
    const pos = { x: center.x + i, y: center.y }
    if (isPositionInBounds(pos, field.size)) {
      targets.push(pos)
    }
  }

  return targets
}

/**
 * 縦列爆撃の攻撃範囲を取得
 * @param position 攻撃座標
 * @param field 対象フィールド
 * @returns 攻撃対象セルの配列
 */
export function getColumnBombingTargets(
  position: Position,
  field: Field
): Position[] {
  const targets: Position[] = []

  // 同じx座標の全y座標を攻撃
  for (let y = 0; y < field.size.height; y++) {
    targets.push({ x: position.x, y })
  }

  return targets
}

/**
 * 水平爆撃の攻撃範囲を取得
 * @param position 攻撃座標
 * @param field 対象フィールド
 * @returns 攻撃対象セルの配列
 */
export function getRowBombingTargets(
  position: Position,
  field: Field
): Position[] {
  const targets: Position[] = []

  // 同じy座標の全x座標を攻撃
  for (let x = 0; x < field.size.width; x++) {
    targets.push({ x, y: position.y })
  }

  return targets
}

/**
 * 集中砲火の処理
 * 選んだマスに敵艦がない場合（MISS時）のみ3回連続攻撃を実行
 * 敵艦がある場合（HIT時）は通常通り処理してターン終了
 * @param initialPosition 最初の攻撃座標
 * @param state 戦闘状態
 * @returns 各攻撃の結果配列
 */
export function executeBurstFire(
  initialPosition: Position,
  state: BattleState
): { hitCount: number; totalDamage: number } {
  const targetField =
    state.turn === Turn.PLAYER ? state.enemyField : state.playerField

  // 1回目の攻撃判定
  const firstCell = targetField.cells[initialPosition.y][initialPosition.x]
  const firstHit =
    firstCell.unitId !== undefined &&
    firstCell.state === CellState.UNEXPLORED

  if (firstHit) {
    // 敵艦がある場合は通常HIT処理のみ
    const result = executeAttack(initialPosition, state)
    return {
      hitCount: result.isHit ? 1 : 0,
      totalDamage: result.damage || 0,
    }
  }

  // MISS時のみ3回攻撃
  let hitCount = 0
  let totalDamage = 0

  // 1回目
  const firstResult = executeAttack(initialPosition, state)
  if (firstResult.isHit) hitCount++
  if (firstResult.damage) totalDamage += firstResult.damage

  // 2回目
  const secondPos = getRandomUnexploredCell(targetField)
  if (secondPos) {
    const secondResult = executeAttack(secondPos, state)
    if (secondResult.isHit) hitCount++
    if (secondResult.damage) totalDamage += secondResult.damage
  }

  // 3回目
  const thirdPos = getRandomUnexploredCell(targetField)
  if (thirdPos) {
    const thirdResult = executeAttack(thirdPos, state)
    if (thirdResult.isHit) hitCount++
    if (thirdResult.damage) totalDamage += thirdResult.damage
  }

  return { hitCount, totalDamage }
}

/**
 * 無差別攻撃を開始
 * 10秒間連射可能な状態にする
 * @param state 戦闘状態
 */
export function startRapidFire(state: BattleState): void {
  const duration = 10000 // 10秒（ミリ秒）
  const startTime = Date.now()

  state.activeSpecialAttack = {
    type: SpecialAttackType.RAPID,
    startTime,
    endTime: startTime + duration,
  }
}

/**
 * 無差別攻撃が有効かチェック
 * @param state 戦闘状態
 * @returns 有効ならtrue
 */
export function isRapidFireActive(state: BattleState): boolean {
  if (
    !state.activeSpecialAttack ||
    state.activeSpecialAttack.type !== SpecialAttackType.RAPID
  ) {
    return false
  }

  const now = Date.now()
  return now <= (state.activeSpecialAttack.endTime || 0)
}

/**
 * 誘導弾の処理
 * 敵の部隊が配置されているマスを1つ自動で発見
 * @param field 対象フィールド
 * @returns 発見したマスの座標（なければnull）
 */
export function executeAutoDetect(field: Field): Position | null {
  // 未探索かつ部隊が配置されているセルを収集
  const unexploredUnits: Position[] = []

  for (let y = 0; y < field.size.height; y++) {
    for (let x = 0; x < field.size.width; x++) {
      const cell = field.cells[y][x]
      if (cell.state === CellState.UNEXPLORED && cell.unitId) {
        unexploredUnits.push({ x, y })
      }
    }
  }

  // ランダムに1つ選択
  if (unexploredUnits.length === 0) {
    return null
  }

  const randomIndex = Math.floor(Math.random() * unexploredUnits.length)
  const target = unexploredUnits[randomIndex]

  // 自動でHIT処理
  processHit(target, field)

  return target
}

/**
 * 妨害工作の処理
 * 相手のターンを強制的に奪取
 * @param state 戦闘状態
 */
export function executeStealTurn(state: BattleState): void {
  // 特殊攻撃後は通常ターン交代するが、
  // この効果では交代せずに連続でプレイヤーターンにする
  state.turn = Turn.PLAYER
  state.canContinueAttack = true
}

/**
 * 特殊攻撃のSP消費量を計算（ガプリーノ専用の増加系対応）
 * @param unitId 部隊ID
 * @param usageCount 使用回数
 * @param unit 部隊マスターデータ
 * @returns 消費SP
 */
export function getSpecialAttackCost(
  unitId: string,
  usageCount: number,
  unit: Unit
): number {
  if (!unit.specialAttack) {
    throw new Error(`Unit ${unitId} has no special attack`)
  }

  const baseSpCost =
    unit.specialAttack.baseSpCost || unit.specialAttack.spCost
  const spIncrease = unit.specialAttack.spIncrease || 0

  // 使用回数に応じて増加
  return baseSpCost + spIncrease * usageCount
}

/**
 * 特殊攻撃でヒットした地雷の数をカウント
 * @param attackedPositions 攻撃した座標の配列
 * @param field 対象フィールド
 * @returns 踏んだ地雷の数
 */
export function countTriggeredLandmines(
  attackedPositions: Position[],
  field: Field
): number {
  let landmineCount = 0

  for (const pos of attackedPositions) {
    const cell = field.cells[pos.y][pos.x]

    // 地雷を踏んだ場合
    if (cell.unitId === 'mine' && cell.state === CellState.HIT) {
      const unit = field.placedUnits.find(
        (u) =>
          u.unitId === 'mine' &&
          !u.isDestroyed &&
          u.occupiedCells.some((c) => c.x === pos.x && c.y === pos.y)
      )
      if (unit) {
        landmineCount++
      }
    }
  }

  return landmineCount
}

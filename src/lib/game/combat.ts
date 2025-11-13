import type { Position } from '@/lib/types/position'
import type { Field } from '@/lib/types/grid'
import type { BattleState, AttackLog } from '@/lib/types/battle'
import type { PlacedUnit } from '@/lib/types/unit'
import { CellState, Turn } from '@/lib/types/enums'
import {
  calculateDirectDamage,
  calculateDestroyExp,
} from '@/lib/utils/combat'

/**
 * 攻撃結果
 */
export interface AttackResult {
  success: boolean
  isHit: boolean
  damage?: number
  destroyedUnitId?: string
  canContinue: boolean
  isLandmine?: boolean
  landmineCounterDamage?: number
}

/**
 * HIT結果
 */
interface HitResult {
  unitId: string
  isDestroyed: boolean
  isLandmine: boolean
  destroyExp: number
}

/**
 * 指定座標への攻撃がHITかMISSか判定
 * @param position 攻撃座標
 * @param field 対象フィールド
 * @returns HITならtrue、MISSならfalse
 */
export function isHit(position: Position, field: Field): boolean {
  const cell = field.cells[position.y][position.x]

  // 1. そのセルに部隊が配置されているか
  if (!cell.unitId) {
    return false // MISS
  }

  // 2. そのセルが既に攻撃済みか
  if (cell.state !== CellState.UNEXPLORED) {
    return false // 既に攻撃済み
  }

  return true // HIT
}

/**
 * HIT時の処理
 * @param position 攻撃座標
 * @param field 対象フィールド
 * @returns HIT結果情報
 */
export function processHit(position: Position, field: Field): HitResult {
  const cell = field.cells[position.y][position.x]
  const unitId = cell.unitId!

  // 1. セルの状態を更新
  cell.state = CellState.HIT

  // 2. 対応する部隊を探す
  const placedUnit = field.placedUnits.find((u) => u.unitId === unitId)
  if (!placedUnit) {
    throw new Error(`Unit not found: ${unitId}`)
  }

  // 3. hitCellsに追加
  placedUnit.hitCells.push(position)

  // 4. 部隊破壊判定
  const isDestroyed = checkUnitDestroyed(placedUnit)
  if (isDestroyed) {
    placedUnit.isDestroyed = true
    // すべてのセルをDESTROYED状態に
    for (const occupiedCell of placedUnit.occupiedCells) {
      field.cells[occupiedCell.y][occupiedCell.x].state = CellState.DESTROYED
    }
  }

  // 5. 地雷判定
  const isLandmine = unitId === 'mine'

  // 6. 経験値計算
  const destroyExp = isDestroyed ? calculateDestroyExp(placedUnit.occupiedCells.length) : 0

  return {
    unitId,
    isDestroyed,
    isLandmine,
    destroyExp,
  }
}

/**
 * MISS時の処理
 * @param position 攻撃座標
 * @param field 対象フィールド
 */
export function processMiss(position: Position, field: Field): void {
  const cell = field.cells[position.y][position.x]
  cell.state = CellState.MISS
}

/**
 * 部隊が完全に破壊されたか判定
 * @param placedUnit 配置済み部隊
 * @returns 破壊されていればtrue
 */
export function checkUnitDestroyed(placedUnit: PlacedUnit): boolean {
  // 占有セル数とヒットセル数を比較
  return placedUnit.hitCells.length === placedUnit.occupiedCells.length
}

/**
 * 地雷のカウンター攻撃を発動
 * @param attacker 地雷を踏んだ側（'player' or 'enemy'）
 * @param state 戦闘状態
 * @returns カウンターダメージ
 */
export function triggerLandmineCounter(
  attacker: 'player' | 'enemy',
  state: BattleState
): number {
  // 1. 攻撃側のフィールドを取得
  const targetField = attacker === 'player' ? state.playerField : state.enemyField

  // 2. ランダムに1マス選択（未攻撃のマスから）
  const target = getRandomUnexploredCell(targetField)

  let counterDamage = 0

  if (target) {
    // 3. 自動攻撃
    const hit = isHit(target, targetField)

    if (hit) {
      processHit(target, targetField)
      // 部隊にHITしても連続攻撃権なし
    } else {
      processMiss(target, targetField)
      // 固定1ダメージ
      counterDamage = 1
      if (attacker === 'player') {
        state.playerStats.HP = Math.max(0, state.playerStats.HP - 1)
      } else {
        state.enemyStats.HP = Math.max(0, state.enemyStats.HP - 1)
      }
    }
  }

  return counterDamage
}

/**
 * ランダムに未攻撃のセルを取得
 * @param field 対象フィールド
 * @returns 座標（なければnull）
 */
export function getRandomUnexploredCell(field: Field): Position | null {
  const unexplored: Position[] = []

  for (let y = 0; y < field.size.height; y++) {
    for (let x = 0; x < field.size.width; x++) {
      if (field.cells[y][x].state === CellState.UNEXPLORED) {
        unexplored.push({ x, y })
      }
    }
  }

  if (unexplored.length === 0) {
    return null
  }

  const randomIndex = Math.floor(Math.random() * unexplored.length)
  return unexplored[randomIndex]
}

/**
 * ターンを交代
 * @param currentTurn 現在のターン
 * @returns 次のターン
 */
export function switchTurn(currentTurn: Turn): Turn {
  return currentTurn === Turn.PLAYER ? Turn.ENEMY : Turn.PLAYER
}

/**
 * 攻撃処理のメインロジック
 * @param position 攻撃座標
 * @param state 戦闘状態
 * @returns 攻撃結果
 */
export function executeAttack(
  position: Position,
  state: BattleState
): AttackResult {
  // 1. 攻撃対象のフィールドを取得
  const targetField =
    state.turn === Turn.PLAYER ? state.enemyField : state.playerField
  const attacker = state.turn === Turn.PLAYER ? 'player' : 'enemy'
  const defender = state.turn === Turn.PLAYER ? 'enemy' : 'player'

  // 2. HIT/MISS判定
  const hit = isHit(position, targetField)

  // 3. 攻撃ログを作成
  const attackLog: AttackLog = {
    turn: state.turn,
    position,
    result: hit ? 'hit' : 'miss',
    isSpecialAttack: false,
    timestamp: Date.now(),
  }

  if (hit) {
    // 4a. HIT処理
    const hitResult = processHit(position, targetField)

    attackLog.damage = 0 // HIT時はダメージなし（部隊破壊のみ）
    if (hitResult.isDestroyed) {
      attackLog.destroyedUnitId = hitResult.unitId
    }

    // 5a. 地雷判定
    if (hitResult.isLandmine) {
      // 地雷のカウンター攻撃
      const counterDamage = triggerLandmineCounter(attacker, state)

      // 攻撃履歴に追加
      state.attackHistory.push(attackLog)

      // ターン強制交代
      state.turn = switchTurn(state.turn)
      state.canContinueAttack = false
      state.consecutiveHits = 0

      return {
        success: true,
        isHit: true,
        destroyedUnitId: hitResult.unitId,
        canContinue: false, // 地雷は強制ターン交代
        isLandmine: true,
        landmineCounterDamage: counterDamage,
      }
    }

    // 6a. 連続攻撃可能
    state.canContinueAttack = true
    state.consecutiveHits++

    // 攻撃履歴に追加
    state.attackHistory.push(attackLog)

    return {
      success: true,
      isHit: true,
      destroyedUnitId: hitResult.isDestroyed ? hitResult.unitId : undefined,
      canContinue: true,
    }
  } else {
    // 4b. MISS処理
    processMiss(position, targetField)

    // 5b. ダメージ計算
    const damage = calculateDirectDamage(attacker, state)

    attackLog.damage = damage

    // 6b. ダメージ適用
    if (defender === 'player') {
      state.playerStats.HP = Math.max(0, state.playerStats.HP - damage)
    } else {
      state.enemyStats.HP = Math.max(0, state.enemyStats.HP - damage)
    }

    // 攻撃履歴に追加
    state.attackHistory.push(attackLog)

    // 7b. ターン交代
    state.turn = switchTurn(state.turn)
    state.canContinueAttack = false
    state.consecutiveHits = 0

    return {
      success: true,
      isHit: false,
      damage,
      canContinue: false,
    }
  }
}

/**
 * 連続攻撃可能な状態をリセット
 * @param state 戦闘状態
 */
export function resetContinueAttack(state: BattleState): void {
  state.canContinueAttack = false
  state.consecutiveHits = 0
}

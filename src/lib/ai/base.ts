import type { Position } from '@/lib/types/position'
import type { Field } from '@/lib/types/grid'
import type { PlacedUnit } from '@/lib/types/unit'
import type { AttackResult } from '@/lib/game/combat'
import { CellState, AIType } from '@/lib/types/enums'
import { isPositionInBounds } from '@/lib/utils/position'

/**
 * 発見済みセル情報
 */
export interface DiscoveredCell {
  position: Position
  isHit: boolean
  unitId?: string
}

/**
 * AI状態
 */
export interface AIState {
  // フィールド情報
  field: Field

  // 現在の状態
  currentHP: number
  maxHP: number
  currentSP: number
  maxSP: number

  // 敵（プレイヤー）情報
  enemyHP: number
  enemyMaxHP: number

  // 配置部隊
  placedUnits: PlacedUnit[]
  remainingUnits: string[] // まだ発見されていない部隊ID

  // 攻撃履歴
  lastHitPosition?: Position
  discoveredCells: DiscoveredCell[]

  // AI戦略用
  patternIndex: number // パターンサーチの進行状況
  consecutiveMisses: number // 連続MISS回数
}

/**
 * 難易度パラメータ
 */
export interface DifficultyParams {
  thinkingTime: number // 思考時間（ミリ秒）
  mistakeProbability: number // ミスの確率（0.0～1.0）
  specialAttackRate: number // 特殊攻撃使用確率
  placementStrategy: 'random' | 'strategic'
}

/**
 * 難易度設定
 */
export const difficultySettings: Record<AIType, DifficultyParams> = {
  [AIType.BALANCED]: {
    thinkingTime: 800,
    mistakeProbability: 0.3,
    specialAttackRate: 0.1,
    placementStrategy: 'random',
  },
  [AIType.AGGRESSIVE]: {
    thinkingTime: 600,
    mistakeProbability: 0.2,
    specialAttackRate: 0.4,
    placementStrategy: 'random',
  },
  [AIType.STRATEGIC]: {
    thinkingTime: 1000,
    mistakeProbability: 0.1,
    specialAttackRate: 0.25,
    placementStrategy: 'strategic',
  },
  [AIType.EXPERT]: {
    thinkingTime: 1200,
    mistakeProbability: 0.05,
    specialAttackRate: 0.35,
    placementStrategy: 'strategic',
  },
}

/**
 * ランダムな未探索セルを取得
 * @param field フィールド
 * @returns 未探索セルの座標（なければnull）
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

  return unexplored.length > 0 ? randomChoice(unexplored) : null
}

/**
 * 隣接する未探索セルを取得
 * @param position 基準位置
 * @param field フィールド
 * @returns 隣接する未探索セルの配列
 */
export function getAdjacentUnexploredCells(
  position: Position,
  field: Field
): Position[] {
  const adjacent: Position[] = []
  const directions = [
    { x: 0, y: -1 }, // 上
    { x: 0, y: 1 }, // 下
    { x: -1, y: 0 }, // 左
    { x: 1, y: 0 }, // 右
  ]

  for (const dir of directions) {
    const pos = {
      x: position.x + dir.x,
      y: position.y + dir.y,
    }

    if (
      isPositionInBounds(pos, field.size) &&
      field.cells[pos.y][pos.x].state === CellState.UNEXPLORED
    ) {
      adjacent.push(pos)
    }
  }

  return adjacent
}

/**
 * 配列からランダムに選択
 * @param array 配列
 * @returns ランダムに選択された要素
 */
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * 攻撃結果に基づいてAI状態を更新
 * @param state AI状態
 * @param position 攻撃位置
 * @param attackResult 攻撃結果
 */
export function updateAIState(
  state: AIState,
  position: Position,
  attackResult: AttackResult
): void {
  // 発見済みセルに追加
  state.discoveredCells.push({
    position,
    isHit: attackResult.isHit,
    unitId: attackResult.destroyedUnitId,
  })

  // HIT時は最後のHIT位置を更新
  if (attackResult.isHit) {
    state.lastHitPosition = position
    state.consecutiveMisses = 0

    // 部隊が破壊されたら残存部隊から削除
    if (attackResult.destroyedUnitId) {
      const index = state.remainingUnits.indexOf(attackResult.destroyedUnitId)
      if (index !== -1) {
        state.remainingUnits.splice(index, 1)
      }
    }
  } else {
    state.consecutiveMisses++

    // 連続MISSが多い場合は戦略を変更
    if (state.consecutiveMisses > 5) {
      state.lastHitPosition = undefined
    }
  }
}

/**
 * 難易度に応じて意図的にミスをさせる
 * @param optimalPosition 最適位置
 * @param field フィールド
 * @param mistakeProbability ミスの確率
 * @returns 最終的な攻撃位置
 */
export function applyMistakeProbability(
  optimalPosition: Position,
  field: Field,
  mistakeProbability: number
): Position {
  if (Math.random() < mistakeProbability) {
    // ミスをする場合は最適解の近くをランダムに選択
    const nearbyUnexplored = getNearbyUnexploredCells(optimalPosition, field, 2)
    if (nearbyUnexplored.length > 0) {
      return randomChoice(nearbyUnexplored)
    }
  }

  return optimalPosition
}

/**
 * 近くの未探索セルを取得
 * @param center 中心位置
 * @param field フィールド
 * @param radius 半径
 * @returns 近くの未探索セルの配列
 */
export function getNearbyUnexploredCells(
  center: Position,
  field: Field,
  radius: number
): Position[] {
  const nearby: Position[] = []

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx === 0 && dy === 0) continue

      const pos = { x: center.x + dx, y: center.y + dy }
      if (
        isPositionInBounds(pos, field.size) &&
        field.cells[pos.y][pos.x].state === CellState.UNEXPLORED
      ) {
        nearby.push(pos)
      }
    }
  }

  return nearby
}

/**
 * 全ての未探索セルを取得
 * @param field フィールド
 * @returns 未探索セルの配列
 */
export function getAllUnexploredCells(field: Field): Position[] {
  const unexplored: Position[] = []

  for (let y = 0; y < field.size.height; y++) {
    for (let x = 0; x < field.size.width; x++) {
      if (field.cells[y][x].state === CellState.UNEXPLORED) {
        unexplored.push({ x, y })
      }
    }
  }

  return unexplored
}

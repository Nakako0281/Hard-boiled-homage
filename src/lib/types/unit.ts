import type { Position } from './position'
import {
  UnitCategory,
  CharacterType,
  SpecialAttackType,
  EffectType,
  Rotation,
} from './enums'

/**
 * 部隊の形状（2次元配列）
 * 1: 部隊が存在するマス, 0: 空白マス
 * 例: 救急車（2マス横並び） = [[1, 1]]
 * 例: 救急ヘリ（L字型） = [[1, 0], [1, 1]]
 */
export type UnitShape = number[][]

/**
 * 攻撃範囲
 */
export interface AttackRange {
  type: 'cross' | 'column' | 'row' | 'point'
  range?: number // 範囲（十字爆撃なら3マスなど）
}

/**
 * 特殊攻撃パターン
 */
export interface SpecialAttackPattern {
  name: string // 攻撃名（'十字爆撃', '縦列爆撃'等）
  spCost: number // SP消費量
  baseSpCost?: number // 基本SP消費量（増加系の場合）
  spIncrease?: number // SP増加量（ガプリーノ専用の増加系）
  type: SpecialAttackType
  attackRange?: AttackRange // 攻撃範囲
  duration?: number // 持続時間（秒）- 無差別攻撃用
}

/**
 * 部隊効果
 */
export interface UnitEffect {
  type: EffectType
  value: number | string
  target?: 'self' | 'ally' | 'enemy' // 効果対象
}

/**
 * 部隊マスターデータ
 */
export interface Unit {
  id: string // 部隊ID（'ambulance', 'harrier'等）
  name: string // 表示名（'救急車', 'ハリアー'等）
  size: number // マス数
  shape: UnitShape // 形状（2次元配列）
  price: number // 価格
  category: UnitCategory // カテゴリ
  effect?: UnitEffect // 部隊効果
  specialAttack?: SpecialAttackPattern // 特殊攻撃
  maxPlacement: number // 最大配置数（地雷以外は1、地雷のみ所持数まで）
  exclusiveFor?: CharacterType // キャラクター専用（undefinedなら共通）
  description: string // 説明文
}

/**
 * 配置済み部隊
 */
export interface PlacedUnit {
  unitId: string // 部隊ID（Unitを参照）
  position: Position // 配置位置（左上の座標）
  rotation: Rotation // 回転状態
  occupiedCells: Position[] // 占有しているセルの座標リスト
  hitCells: Position[] // 被弾したセルの座標リスト
  isDestroyed: boolean // 破壊されたかどうか
}

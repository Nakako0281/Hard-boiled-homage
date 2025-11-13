/**
 * キャラクタータイプ
 */
export enum CharacterType {
  JACK = 'jack', // ジャック刑事
  GAPRINO = 'gaprino', // ガプリーノ警部
}

/**
 * 戦闘フェーズ
 */
export enum BattlePhase {
  PLACEMENT = 'placement', // 部隊配置フェーズ
  BATTLE = 'battle', // 戦闘フェーズ
  RESULT = 'result', // 結果表示フェーズ
}

/**
 * ターン
 */
export enum Turn {
  PLAYER = 'player', // プレイヤーターン
  ENEMY = 'enemy', // 敵ターン
}

/**
 * セルの状態
 */
export enum CellState {
  UNEXPLORED = 'unexplored', // 未攻撃
  HIT = 'hit', // HIT（部隊に命中）
  MISS = 'miss', // MISS（部隊に外れ）
  DESTROYED = 'destroyed', // 破壊済み
}

/**
 * 部隊カテゴリ
 */
export enum UnitCategory {
  HEAL = 'heal', // 回復系
  ATTACK = 'attack', // 特殊攻撃系
  BUFF = 'buff', // ステータス強化系
  SPECIAL = 'special', // 超強化系
  COUNTER = 'counter', // カウンター系（地雷）
}

/**
 * ステータスタイプ
 */
export enum StatType {
  HP = 'HP', // 体力
  SP = 'SP', // 必殺技ポイント
  AT = 'AT', // 攻撃力
  DF = 'DF', // 防御力
  AR = 'AR', // エリア（フィールドサイズ）
}

/**
 * AIタイプ
 */
export enum AIType {
  BALANCED = 'balanced', // バランス型
  AGGRESSIVE = 'aggressive', // 攻撃型
  STRATEGIC = 'strategic', // 戦略型
  EXPERT = 'expert', // エキスパート
}

/**
 * 敵ID
 */
export enum EnemyId {
  CARRIER_A = 'carrier_a', // 運び屋A
  MADMAN_B = 'madman_b', // 狂人B
  COLONEL_Z = 'colonel_z', // Z大佐
  BOMBER_J = 'bomber_j', // 爆弾魔J
}

/**
 * 特殊攻撃タイプ
 */
export enum SpecialAttackType {
  CROSS = 'cross', // 十字爆撃
  COLUMN = 'column', // 縦列爆撃
  ROW = 'row', // 水平爆撃
  BURST = 'burst', // 集中砲火（3連続攻撃）
  RAPID = 'rapid', // 無差別攻撃（時間制限連射）
  AUTO_DETECT = 'auto_detect', // 誘導弾（自動検知）
  STEAL_TURN = 'steal_turn', // 妨害工作（ターン奪取）
}

/**
 * 効果タイプ
 */
export enum EffectType {
  // 回復系
  HEAL = 'heal', // HP回復（最大HPの30%、1HP=1SP消費）
  HEAL_LARGE = 'heal_large', // HP大回復（救急ヘリ用、HEALと同じ仕様）

  // ステータス強化系
  ATK_BOOST = 'atk_boost', // 攻撃力アップ
  DEF_BOOST = 'def_boost', // 防御力アップ
  EXP_BOOST = 'exp_boost', // 経験値アップ
  FIRST_STRIKE = 'first_strike', // 必ず先制攻撃

  // 超強化系
  DOUBLE_BUFF = 'double_buff', // ステータスUP効果値を2倍に（単体では効果なし）
  DOUBLE_SPECIAL = 'double_special', // 特殊攻撃範囲を2倍に

  // カウンター系
  COUNTER = 'counter', // カウンター攻撃（固定1ダメージ）
}

/**
 * 回転状態
 */
export enum Rotation {
  DEG_0 = 0, // 0度
  DEG_90 = 90, // 90度
  DEG_180 = 180, // 180度
  DEG_270 = 270, // 270度
}

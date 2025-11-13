# UI/UX設計書

**バージョン**: 1.0  
**作成日**: 2025年11月12日  
**対象プロジェクト**: ハードボイルド刑事風ゲーム

---

## 📋 目次

1. [デザインコンセプト](#デザインコンセプト)
2. [カラーパレット](#カラーパレット)
3. [タイポグラフィ](#タイポグラフィ)
4. [画面レイアウト設計](#画面レイアウト設計)
5. [アニメーション設計](#アニメーション設計)
6. [レスポンシブ設計](#レスポンシブ設計)
7. [アクセシビリティ](#アクセシビリティ)
8. [インタラクション設計](#インタラクション設計)

---

## デザインコンセプト

### テーマ

**"ハードボイルド刑事風"**
- ダークで渋い雰囲気
- 映画のようなシネマティックな演出
- シリアスだが遊びやすいUI

### デザインの原則

1. **視認性の確保**
   - 重要な情報は目立つように配置
   - グリッドのセル状態が一目で分かる

2. **直感的な操作**
   - 初めてでも迷わない画面遷移
   - クリック/タップ可能な要素が明確

3. **フィードバックの明示**
   - アクションに対して即座に反応
   - 成功/失敗が視覚的に分かる

4. **没入感の演出**
   - アニメーションで臨場感を演出
   - サウンドエフェクトとの連動

---

## カラーパレット

### メインカラー

```typescript
const colors = {
  // ブランドカラー
  primary: {
    DEFAULT: '#2980B9',  // ブルー（メインアクション）
    dark: '#1A5276',
    light: '#5DADE2'
  },
  
  // セカンダリカラー
  secondary: {
    DEFAULT: '#34495E',  // ダークグレー（背景）
    dark: '#2C3E50',
    light: '#5D6D7E'
  },
  
  // アクセントカラー
  accent: {
    success: '#27AE60',  // 緑（成功・HP）
    danger: '#C0392B',   // 赤（危険・HIT）
    warning: '#F39C12',  // オレンジ（警告・部隊）
    info: '#3498DB'      // ライトブルー（情報・MISS）
  }
}
```

### ステータスカラー

```typescript
const statusColors = {
  // HP/SPゲージ
  hp: {
    high: '#27AE60',     // 70%以上
    medium: '#F39C12',   // 30-70%
    low: '#E74C3C'       // 30%未満
  },
  sp: {
    full: '#3498DB',
    empty: '#95A5A6'
  },
  
  // グリッドセル
  cell: {
    unexplored: '#2C3E50',   // 未攻撃
    playerField: '#34495E',  // 自フィールド
    hit: '#E74C3C',          // HIT
    miss: '#3498DB',         // MISS
    destroyed: '#95A5A6',    // 破壊済み
    hover: '#5D6D7E'         // ホバー時
  },
  
  // ボタン状態
  button: {
    enabled: '#2980B9',
    disabled: '#7F8C8D',
    hover: '#3498DB',
    active: '#1A5276'
  }
}
```

### グラデーション

```typescript
const gradients = {
  background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
  header: 'linear-gradient(90deg, #1A5276 0%, #2980B9 100%)',
  modal: 'linear-gradient(135deg, #34495E 0%, #2C3E50 100%)',
  glow: 'radial-gradient(circle, rgba(46, 204, 113, 0.3) 0%, transparent 70%)'
}
```

---

## タイポグラフィ

### フォント設定

```typescript
const typography = {
  // フォントファミリー
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Roboto Mono', 'monospace'],
    display: ['Rajdhani', 'sans-serif']  // タイトル用
  },
  
  // フォントサイズ
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem'      // 48px
  },
  
  // フォントウェイト
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  
  // 行間
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
}
```

### テキストスタイル定義

```typescript
const textStyles = {
  // 見出し
  h1: {
    fontSize: '3rem',
    fontWeight: 700,
    fontFamily: 'Rajdhani',
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  h2: {
    fontSize: '2.25rem',
    fontWeight: 700,
    fontFamily: 'Rajdhani',
    lineHeight: 1.3
  },
  h3: {
    fontSize: '1.875rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  
  // 本文
  body: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5
  },
  bodyLarge: {
    fontSize: '1.125rem',
    fontWeight: 400,
    lineHeight: 1.6
  },
  
  // UI要素
  button: {
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: '0.025em',
    textTransform: 'uppercase'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase'
  },
  
  // 数値
  stat: {
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: 'Roboto Mono'
  }
}
```

---

## 画面レイアウト設計

### グリッドシステム

```typescript
const layout = {
  // コンテナ最大幅
  maxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // スペーシング
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem'   // 48px
  },
  
  // ボーダー半径
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px'
  }
}
```

### 1. タイトル画面

```
┌─────────────────────────────────────────────┐
│                                              │
│              HARDBOILED DETECTIVE            │
│                                              │
│                [ゲームタイトル]               │
│                                              │
│                                              │
│            ┌─────────────────┐              │
│            │  NEW GAME       │              │
│            └─────────────────┘              │
│                                              │
│            ┌─────────────────┐              │
│            │  CONTINUE       │              │
│            └─────────────────┘              │
│                                              │
│                                              │
│         Ver 1.0      © 2025 Nakako          │
└─────────────────────────────────────────────┘

レイアウト仕様:
- 縦方向中央配置
- タイトルロゴは画面上部1/3の位置
- ボタンは中央揃えで縦配置（gap: 1rem）
- バージョン情報は右下固定
```

### 2. キャラクター選択モーダル

```
┌─────────────────────────────────────────────┐
│  × [閉じる]          キャラクター選択          │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────┐      ┌──────────────┐   │
│  │              │      │              │   │
│  │  ジャック刑事  │      │ ガプリーノ警部 │   │
│  │              │      │              │   │
│  │  [イラスト]   │      │  [イラスト]   │   │
│  │              │      │              │   │
│  ├──────────────┤      ├──────────────┤   │
│  │ バランス型    │      │ テクニカル型  │   │
│  │              │      │              │   │
│  │ 初心者向け    │      │ 上級者向け    │   │
│  │              │      │              │   │
│  │ [詳細]       │      │ [詳細]       │   │
│  └──────────────┘      └──────────────┘   │
│                                              │
│              [決定]        [キャンセル]       │
└─────────────────────────────────────────────┘

レイアウト仕様:
- モーダルは画面中央（max-width: 800px）
- カード2枚を横並び（gap: 2rem）
- カードはホバーで拡大（scale: 1.05）
- 選択中は青い枠線表示
```

### 3. 敵選択画面

```
┌─────────────────────────────────────────────┐
│  [←戻る]           敵選択              [残:3] │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │運び屋│  │狂人B │  │Z大佐 │  │爆弾魔│  │
│  │  A   │  │      │  │      │  │  J   │  │
│  │ ★☆☆ │  │ ★★☆ │  │ ★★★ │  │ ★★★ │  │
│  │      │  │      │  │      │  │ ★★  │  │
│  │ Easy │  │Medium│  │ Hard │  │Night │  │
│  │      │  │      │  │      │  │ mare │  │
│  │[挑戦] │  │[挑戦] │  │[挑戦] │  │[挑戦] │  │
│  └──────┘  └──────┘  └──────┘  └──────┘  │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │ 選択中: 運び屋A                     │    │
│  │                                     │    │
│  │ HP: 150  SP: 80  AT: 12  DF: 8     │    │
│  │                                     │    │
│  │ 獲得賞金: 1,000円                   │    │
│  └────────────────────────────────────┘    │
│                                              │
│                    [次へ →]                  │
└─────────────────────────────────────────────┘

レイアウト仕様:
- カード4枚をグリッド表示（2×2 or 4×1）
- 撃破済みは半透明＋チェックマーク
- 選択中のカードを下部に詳細表示
- 進行状況バーを上部に表示
```

### 4. 戦闘画面

```
┌─────────────────────────────────────────────┐
│ ステータスバー                                │
│ ┌───────────────┐       ┌───────────────┐  │
│ │ジャック刑事    │       │運び屋A        │  │
│ │HP: ████████░░ │       │HP: ██████░░░░ │  │
│ │SP: ████░░░░░░ │       │SP: ████░░░░░░ │  │
│ │部隊: 🚗🚁✈️💣   │       │部隊: ？？？？  │  │
│ └───────────────┘       └───────────────┘  │
├─────────────────────────────────────────────┤
│                                              │
│  ┌─────────┐           ┌─────────┐         │
│  │プレイヤー│           │敵フィールド│         │
│  │フィールド│           │           │         │
│  │         │           │ ？？？    │         │
│  │ 🚗🚁    │           │ ？？？    │         │
│  │ ✈️💣    │           │ ？？？    │         │
│  │         │           │           │         │
│  └─────────┘           └─────────┘         │
│                                              │
├─────────────────────────────────────────────┤
│ アクションバー                                │
│ [通常攻撃] [特殊攻撃▼] [回復] [メニュー]      │
│                                              │
│ 現在のターン: プレイヤー  連続HIT: 2回         │
└─────────────────────────────────────────────┘

レイアウト仕様:
- 3段構成（ステータス / フィールド / アクション）
- フィールドは左右に並べて表示
- グリッドは画面サイズに応じて自動調整
- ターン表示は下部に固定
```

### 5. 部隊配置画面

```
┌─────────────────────────────────────────────┐
│  [←戻る]          部隊配置              AR:1  │
├─────────────────────────────────────────────┤
│                                              │
│  ┌─────────────┐       ┌──────────────┐    │
│  │配置フィールド│       │所持部隊一覧   │    │
│  │             │       │              │    │
│  │             │       │ 🚗 救急車     │    │
│  │    7×7      │       │ ✈️ ハリアー   │    │
│  │             │       │ 🛡️ 消防車    │    │
│  │             │       │ 💣 地雷×6    │    │
│  │             │       │              │    │
│  └─────────────┘       └──────────────┘    │
│                                              │
│  選択中: 🚗救急車 (2マス)                     │
│  [⟲回転]  [✓配置]  [✗キャンセル]            │
│                                              │
│               配置済み: 0 / 4部隊             │
│                 [戦闘開始]                    │
└─────────────────────────────────────────────┘

レイアウト仕様:
- 左右2カラム（フィールド 60% / 一覧 40%）
- フィールドはホバー時にプレビュー表示
- 配置可能な位置は緑のハイライト
- 配置不可能な位置は赤のハイライト
```

---

## アニメーション設計

### トランジション設定

```typescript
const transitions = {
  // 基本トランジション
  fast: '150ms ease-in-out',
  normal: '300ms ease-in-out',
  slow: '500ms ease-in-out',
  
  // イージング
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
}
```

### 1. HITエフェクト

**仕様**:
- 赤い爆発エフェクト
- 0.3秒で拡大→フェードアウト
- 衝撃波の演出

**実装**:
```typescript
// Framer Motion
<motion.div
  className="hit-effect"
  initial={{ scale: 0, opacity: 1 }}
  animate={{ 
    scale: [0, 1.5, 2],
    opacity: [1, 0.8, 0]
  }}
  transition={{ 
    duration: 0.3,
    ease: "easeOut"
  }}
>
  <div className="explosion-core bg-red-500" />
  <div className="shockwave bg-red-300" />
</motion.div>
```

**CSSアニメーション**:
```css
@keyframes hit-explosion {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.hit-effect {
  animation: hit-explosion 0.3s ease-out;
}
```

### 2. MISSエフェクト

**仕様**:
- 青い波紋エフェクト
- 0.3秒で拡散→フェードアウト
- 水の波紋のような動き

**実装**:
```typescript
<motion.div
  className="miss-effect"
  initial={{ scale: 0.5, opacity: 1 }}
  animate={{ 
    scale: 2,
    opacity: 0
  }}
  transition={{ 
    duration: 0.3,
    ease: "easeOut"
  }}
>
  <div className="ripple bg-blue-400" />
</motion.div>
```

### 3. 部隊破壊エフェクト

**仕様**:
- 拡大→縮小→フェードアウト
- 0.5秒のアニメーション
- パーティクルエフェクト（オプション）

**実装**:
```typescript
<motion.div
  className="destroy-effect"
  animate={{ 
    scale: [1, 1.3, 0],
    opacity: [1, 1, 0],
    rotate: [0, 10, 0]
  }}
  transition={{ 
    duration: 0.5,
    times: [0, 0.5, 1]
  }}
  onAnimationComplete={onComplete}
>
  {/* 部隊アイコン */}
</motion.div>
```

### 4. ダメージ数値

**仕様**:
- 数値が浮かび上がる
- 0.4秒で上昇→フェードアウト
- クリティカル時は大きく表示

**実装**:
```typescript
<motion.div
  className="damage-number"
  initial={{ y: 0, opacity: 1, scale: 1 }}
  animate={{ 
    y: -50,
    opacity: 0,
    scale: isCritical ? 1.5 : 1
  }}
  transition={{ duration: 0.4 }}
>
  {damage}
</motion.div>
```

### 5. ターン交代

**仕様**:
- スライドトランジション
- 0.2秒で切り替え
- フェードイン/アウト

**実装**:
```typescript
<motion.div
  key={currentTurn}
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 20 }}
  transition={{ duration: 0.2 }}
>
  現在のターン: {currentTurn}
</motion.div>
```

### 6. ボタンホバー

**仕様**:
- ホバー時に軽く拡大
- ボックスシャドウで浮遊感

**実装**:
```typescript
<motion.button
  whileHover={{ 
    scale: 1.05,
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
  }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.15 }}
>
  攻撃
</motion.button>
```

### 7. モーダル表示

**仕様**:
- フェードイン＋スケールアップ
- 0.3秒のアニメーション
- オーバーレイも同時にフェードイン

**実装**:
```typescript
// オーバーレイ
<motion.div
  className="modal-overlay"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
/>

// モーダル本体
<motion.div
  className="modal-content"
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.9, opacity: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  {children}
</motion.div>
```

### 8. ローディングスピナー

**仕様**:
- 回転アニメーション
- 無限ループ

**実装**:
```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

---

## レスポンシブ設計

### ブレークポイント

```typescript
const breakpoints = {
  sm: '640px',   // スマートフォン（縦）
  md: '768px',   // タブレット（縦）
  lg: '1024px',  // タブレット（横）・小型PC
  xl: '1280px',  // デスクトップ
  '2xl': '1536px' // 大型デスクトップ
}
```

### レイアウト調整

#### スマートフォン（～640px）

```
戦闘画面:
┌───────────────┐
│ ステータス    │
│ ┌───────────┐ │
│ │プレイヤー │ │
│ │HP: ████   │ │
│ └───────────┘ │
│ ┌───────────┐ │
│ │敵         │ │
│ │HP: ███    │ │
│ └───────────┘ │
├───────────────┤
│ ┌───────────┐ │
│ │フィールド │ │
│ │（自分）   │ │
│ └───────────┘ │
│ ┌───────────┐ │
│ │フィールド │ │
│ │（敵）     │ │
│ └───────────┘ │
├───────────────┤
│ [攻撃] [特殊] │
│ [回復] [メニュー]│
└───────────────┘

変更点:
- 縦スクロール可能に
- フィールドを縦に並べる
- グリッドサイズを縮小（セル: 30px）
- ボタンを2列配置
```

#### タブレット（640px～1024px）

```
戦闘画面:
┌─────────────────────────┐
│ ステータスバー          │
│ [プレイヤー] [敵]       │
├─────────────────────────┤
│ ┌─────┐    ┌─────┐     │
│ │自分 │    │敵   │     │
│ │フィールド  フィールド │     │
│ └─────┘    └─────┘     │
├─────────────────────────┤
│ [攻撃][特殊][回復][メニュー]│
└─────────────────────────┘

変更点:
- フィールドは横並び（小さめ）
- セルサイズ: 40px
- ボタンは横一列
```

#### デスクトップ（1024px～）

```
戦闘画面:
┌───────────────────────────────┐
│ ステータスバー（横幅いっぱい）│
├───────────────────────────────┤
│ ┌────────┐   ┌────────┐      │
│ │自分    │   │敵      │      │
│ │フィールド   フィールド      │
│ │        │   │        │      │
│ └────────┘   └────────┘      │
├───────────────────────────────┤
│ [攻撃] [特殊攻撃▼] [回復] [メニュー]│
└───────────────────────────────┘

変更点:
- 最大限のスペース活用
- セルサイズ: 50px
- 余白を広めに確保
```

### タッチ操作対応

```typescript
const touchSettings = {
  // タッチターゲットサイズ（最小44x44px）
  minTouchTarget: '44px',
  
  // ダブルタップ防止
  touchAction: 'manipulation',
  
  // スクロールバウンス防止
  overscrollBehavior: 'none',
  
  // 選択防止
  userSelect: 'none',
  
  // タップハイライト色
  tapHighlightColor: 'transparent'
}
```

---

## アクセシビリティ

### キーボード操作

**対応キー**:
```typescript
const keyBindings = {
  // グリッド操作
  ArrowUp: '上のセルに移動',
  ArrowDown: '下のセルに移動',
  ArrowLeft: '左のセルに移動',
  ArrowRight: '右のセルに移動',
  Enter: '選択中のセルを攻撃',
  Space: '選択中のセルを攻撃',
  
  // 部隊配置
  R: '回転',
  P: '配置',
  Escape: 'キャンセル',
  
  // アクション
  '1': '通常攻撃モード',
  '2': '特殊攻撃メニュー',
  '3': '回復',
  'M': 'メニュー表示'
}
```

### ARIA属性

```typescript
// ボタン
<button
  aria-label="通常攻撃"
  aria-disabled={!canAttack}
  role="button"
>
  攻撃
</button>

// プログレスバー
<div
  role="progressbar"
  aria-valuenow={currentHP}
  aria-valuemin={0}
  aria-valuemax={maxHP}
  aria-label="体力ゲージ"
>
  {/* HPバー */}
</div>

// グリッドセル
<div
  role="button"
  aria-label={`座標 ${x}, ${y}. 状態: ${state}`}
  aria-pressed={isSelected}
  tabIndex={0}
>
  {/* セル内容 */}
</div>

// モーダル
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">キャラクター選択</h2>
  {/* モーダル内容 */}
</div>
```

### フォーカス管理

```typescript
// フォーカストラップ（モーダル内）
const focusTrap = {
  onKeyDown: (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      // Tab順序を制御
    }
    if (e.key === 'Escape') {
      // モーダルを閉じる
    }
  }
}

// フォーカス可視化
const focusStyles = {
  outline: '2px solid #3498DB',
  outlineOffset: '2px'
}
```

### カラーコントラスト

```typescript
// WCAG AA準拠（コントラスト比4.5:1以上）
const accessibleColors = {
  text: {
    primary: '#FFFFFF',    // 背景 #2C3E50 に対して 12.63:1
    secondary: '#BDC3C7',  // 背景 #2C3E50 に対して 7.38:1
    disabled: '#7F8C8D'    // 背景 #2C3E50 に対して 4.52:1
  },
  background: {
    primary: '#2C3E50',
    secondary: '#34495E'
  }
}
```

---

## インタラクション設計

### ホバーエフェクト

```typescript
// ボタン
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

// グリッドセル
.cell:hover {
  background-color: #5D6D7E;
  cursor: pointer;
  border: 2px solid #3498DB;
}

// カード
.card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}
```

### クリックフィードバック

```typescript
// ボタン押下
.button:active {
  transform: scale(0.95);
}

// セル選択
.cell:active {
  background-color: #2980B9;
  animation: pulse 0.3s ease-out;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.7);
  }
  100% {
    box-shadow: 0 0 0 10px rgba(52, 152, 219, 0);
  }
}
```

### ローディング状態

```typescript
// ボタンローディング
<button disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner size="sm" />
      <span>処理中...</span>
    </>
  ) : (
    '攻撃'
  )}
</button>

// 画面全体ローディング
<div className="loading-overlay">
  <Spinner size="lg" />
  <p>戦闘準備中...</p>
</div>
```

### エラー表示

```typescript
// インラインエラー
<div className="error-message">
  <ErrorIcon />
  <span>SPが足りません</span>
</div>

// トースト通知
<Toast type="error" duration={3000}>
  配置できません：重複しています
</Toast>

// モーダルエラー
<Modal isOpen={hasError}>
  <h3>エラーが発生しました</h3>
  <p>{errorMessage}</p>
  <Button onClick={onRetry}>再試行</Button>
</Modal>
```

### 成功フィードバック

```typescript
// トースト通知
<Toast type="success" duration={2000}>
  部隊を配置しました
</Toast>

// アニメーション
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring" }}
>
  ✓ 勝利！
</motion.div>

// サウンド（オプション）
playSound('success')
```

---

## コンポーネント別スタイルガイド

### Button

```typescript
// Primary Button
<button className="
  px-6 py-3
  bg-primary hover:bg-primary-dark
  text-white font-semibold
  rounded-lg
  transition-all duration-200
  hover:shadow-lg hover:-translate-y-0.5
  active:scale-95
  disabled:bg-gray-500 disabled:cursor-not-allowed
">
  攻撃
</button>

// Secondary Button
<button className="
  px-6 py-3
  bg-transparent border-2 border-primary
  text-primary hover:bg-primary hover:text-white
  font-semibold rounded-lg
  transition-all duration-200
">
  キャンセル
</button>

// Danger Button
<button className="
  px-6 py-3
  bg-danger hover:bg-red-700
  text-white font-semibold
  rounded-lg
">
  削除
</button>
```

### Card

```typescript
<div className="
  bg-secondary-dark
  rounded-xl
  p-6
  shadow-lg
  hover:shadow-xl
  transition-shadow duration-300
">
  {/* カード内容 */}
</div>
```

### Progress Bar

```typescript
<div className="progress-bar-container">
  <div className="progress-bar-bg">
    <motion.div
      className="progress-bar-fill"
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  </div>
  <span className="progress-label">
    {current} / {max}
  </span>
</div>
```

### Modal

```typescript
<div className="modal-overlay">
  <div className="modal-content">
    <div className="modal-header">
      <h2>タイトル</h2>
      <button className="close-button">×</button>
    </div>
    <div className="modal-body">
      {children}
    </div>
    <div className="modal-footer">
      <Button variant="secondary">キャンセル</Button>
      <Button variant="primary">決定</Button>
    </div>
  </div>
</div>
```

---

## パフォーマンス最適化

### アニメーションの最適化

```typescript
// GPU アクセラレーション
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
}

// 不要なアニメーションの無効化
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 画像の最適化

```typescript
// 遅延ロード
<img
  src={imageSrc}
  loading="lazy"
  alt="説明"
/>

// レスポンシブ画像
<img
  srcSet="
    image-small.jpg 640w,
    image-medium.jpg 1024w,
    image-large.jpg 1920w
  "
  sizes="(max-width: 640px) 100vw, 50vw"
/>
```

---

**以上、UI/UX設計書（第1版）**

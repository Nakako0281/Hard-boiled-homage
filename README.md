# Hard-Boiled Homage

ハードボイルド探偵テーマの戦略シミュレーションゲーム（戦艦ゲーム風）

## 概要

Hard-Boiled Homageは、ハードボイルド探偵をテーマにした戦略シミュレーションゲームです。戦艦ゲームをベースに、探偵（ジャック刑事またはガプリーノ警部）として敵組織との戦いに挑みます。

### ゲームの特徴

- **キャラクター選択**: 2人の探偵から選択可能
- **戦略的バトル**: 10x10のグリッドでの戦術的な戦闘
- **特殊攻撃**: 各ユニットが持つ固有の特殊攻撃
- **AIエンジン**: 4段階の難易度（Balanced, Aggressive, Strategic, Expert）
- **ハードボイルドテーマ**: ダークでスタイリッシュなUI/UX

## 技術スタック

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6.0
- **State Management**: Zustand 5.0
- **Styling**: Tailwind CSS 3.4
- **Animation**: Framer Motion 11.15
- **Testing**: Vitest 2.1 + React Testing Library + Playwright

## 開発環境のセットアップ

### 必要な環境

- Node.js 18以上
- npm 9以上

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/hard-boiled-homage.git
cd hard-boiled-homage

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

## スクリプト

```bash
# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# プレビュー（ビルド後の確認）
npm run preview

# ユニットテスト実行
npm test

# ユニットテスト（ウォッチモード）
npm run test:watch

# ユニットテストUI
npm run test:ui

# カバレッジ付きテスト
npm run test:coverage

# E2Eテスト実行
npm run test:e2e

# E2Eテスト（UIモード）
npm run test:e2e:ui

# 型チェック
npm run type-check

# リンター実行
npm run lint
```

## テスト

### ユニットテスト

475以上のテストケースで、以下をカバーしています:

- ゲームロジック（配置、戦闘、特殊攻撃、勝敗判定）
- AIエンジン（全4種類のAI）
- 状態管理（Zustand stores）
- ユーティリティ関数
- UIコンポーネント
- カスタムフック

```bash
# 全テスト実行
npm test

# カバレッジレポート表示
npm run test:coverage
```

### E2Eテスト

Playwrightを使用したE2Eテストで、実際のユーザーフローをテストしています。

```bash
# E2Eテスト実行
npm run test:e2e

# E2Eテスト（UIモード）
npm run test:e2e:ui
```

## プロジェクト構造

```
src/
├── components/           # Reactコンポーネント
│   ├── common/          # 共通コンポーネント（Button, Card, Modal等）
│   ├── game/            # ゲームコンポーネント（Cell, GameBoard等）
│   ├── ui/              # UI制御コンポーネント（TurnIndicator, StatusPanel等）
│   └── screens/         # 画面コンポーネント（Title, Battle, Result等）
├── lib/                 # ゲームロジック、ユーティリティ
│   ├── ai/              # AIエンジン（4種類のAI実装）
│   ├── game/            # ゲームロジック（配置、戦闘、特殊攻撃、勝敗判定）
│   ├── utils/           # ユーティリティ関数（位置計算、グリッド操作、戦闘計算）
│   ├── hooks/           # カスタムフック
│   ├── storage/         # ストレージ操作
│   ├── animations/      # アニメーション定義
│   └── types/           # 型定義
├── stores/              # Zustand状態管理
│   ├── playerStore.ts   # プレイヤー情報
│   ├── gameStore.ts     # ゲーム全体の状態
│   └── battleStore.ts   # バトル状態
├── __tests__/           # テストファイル
└── assets/              # 静的アセット
```

## 主な機能

### 実装済み

- ✅ キャラクター選択（ジャック刑事、ガプリーノ警部）
- ✅ 敵選択（4種類の敵）
- ✅ ユニット配置システム
- ✅ ターン制バトルシステム
- ✅ 通常攻撃 & 特殊攻撃
- ✅ AIエンジン（4段階の難易度）
- ✅ 勝敗判定 & リザルト画面
- ✅ ローカルストレージでのセーブ/ロード
- ✅ エラーバウンダリ
- ✅ レスポンシブデザイン
- ✅ アニメーション & エフェクト

### 今後の拡張予定

- [ ] レベルアップシステム
- [ ] ショップ機能
- [ ] マルチプレイヤー対応（P2P）
- [ ] サウンド & BGM
- [ ] チュートリアル

## 開発ルール

詳細な開発ルールは[claude.md](./claude.md)を参照してください。

## ライセンス

MIT License

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

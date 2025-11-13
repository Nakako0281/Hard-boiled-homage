# Hard-Boiled Homage - 実装タスクリスト

## 📋 プロジェクト概要
ハードボイルド探偵テーマの戦略シミュレーションゲーム（戦艦ゲーム風）
- 技術スタック: React + TypeScript + Zustand + Vite + Tailwind CSS + Framer Motion
- 実装期間: 約1ヶ月（4週間）

---

## 🚀 Phase 1: プロジェクトセットアップ & 基盤構築

### 1.1 初期セットアップ
- [ ] Viteプロジェクト作成（React + TypeScript テンプレート）
- [ ] 必要な依存関係のインストール（zustand, tailwindcss, framer-motion）
- [ ] Tailwind CSS設定（tailwind.config.js, postcss.config.js）
- [ ] プロジェクト構造のセットアップ（src/components, src/lib, src/stores等）
- [ ] ESLint & Prettier設定
- [ ] .gitignore設定

### 1.2 テスト環境セットアップ
- [ ] Vitest設定（vitest.config.ts）
- [ ] React Testing Library設定
- [ ] Playwright設定（playwright.config.ts）
- [ ] テスト用のヘルパー関数とモック作成

---

## 📊 Phase 2: データモデル & 型定義

### 2.1 基本型定義
- [ ] Position型の定義（src/lib/types/position.ts）
- [ ] Cell型の定義（src/lib/types/cell.ts）
- [ ] GridState型の定義（src/lib/types/grid.ts）

### 2.2 ユニット & キャラクター型定義
- [ ] UnitStats型の定義（src/lib/types/stats.ts）
- [ ] Unit型の定義（src/lib/types/unit.ts）
- [ ] Character型の定義（キャラクター「Jack」「Gaprino」）
- [ ] Enemy型の定義（4種類の敵キャラクター）
- [ ] SpecialAttack型の定義

### 2.3 ゲーム状態型定義
- [ ] BattleState型の定義（src/lib/types/battle.ts）
- [ ] GamePhase型の定義（SETUP, PLACEMENT, BATTLE, RESULT）
- [ ] TurnState型の定義
- [ ] SaveData型の定義（src/lib/types/storage.ts）

---

## 🎮 Phase 3: 状態管理（Zustand Stores）

### 3.1 playerStore実装
- [ ] playerStore基本構造作成（src/stores/playerStore.ts）
- [ ] キャラクター選択機能（setSelectedCharacter）
- [ ] プレイヤー情報管理（totalBattles, wins, losses）
- [ ] ストアのテストコード作成

### 3.2 gameStore実装
- [ ] gameStore基本構造作成（src/stores/gameStore.ts）
- [ ] ゲームフェーズ管理（currentPhase, setPhase）
- [ ] 敵選択機能（selectedEnemy, setSelectedEnemy）
- [ ] セーブ/ロード機能統合
- [ ] ストアのテストコード作成

### 3.3 battleStore実装
- [ ] battleStore基本構造作成（src/stores/battleStore.ts）
- [ ] グリッド状態管理（playerGrid, enemyGrid）
- [ ] ターン管理（currentTurn, isPlayerTurn）
- [ ] ユニット配置機能（placeUnit, removeUnit）
- [ ] 攻撃処理機能（attack）
- [ ] 特殊攻撃機能（useSpecialAttack）
- [ ] 勝敗判定機能（checkVictory）
- [ ] バトルリセット機能
- [ ] ストアのテストコード作成

---

## 🔧 Phase 4: ユーティリティ関数

### 4.1 位置計算ユーティリティ
- [ ] isValidPosition関数（src/lib/utils/position.ts）
- [ ] getAdjacentPositions関数
- [ ] calculateDistance関数
- [ ] ユニットテスト作成

### 4.2 グリッド操作ユーティリティ
- [ ] initializeGrid関数（src/lib/utils/grid.ts）
- [ ] getCellAt関数
- [ ] updateCell関数
- [ ] getUnitsInArea関数
- [ ] ユニットテスト作成

### 4.3 戦闘計算ユーティリティ
- [ ] calculateDamage関数（src/lib/utils/combat.ts）
- [ ] applyDamage関数
- [ ] checkUnitDestroyed関数
- [ ] ユニットテスト作成

### 4.4 カスタムフック
- [ ] useGamePhase hook（src/hooks/useGamePhase.ts）
- [ ] useBattleState hook（src/hooks/useBattleState.ts）
- [ ] useLocalStorage hook（src/hooks/useLocalStorage.ts）

---

## 🎯 Phase 5: ゲームロジック実装

### 5.1 配置フェーズロジック
- [ ] ユニット配置検証ロジック（src/lib/game/placement.ts）
- [ ] 配置可能エリア判定
- [ ] 配置完了チェック
- [ ] ユニットテスト作成

### 5.2 戦闘フェーズロジック
- [ ] 攻撃処理ロジック（src/lib/game/combat.ts）
- [ ] ダメージ計算ロジック
- [ ] クリティカルヒット判定
- [ ] 回避判定
- [ ] ユニットテスト作成

### 5.3 特殊攻撃ロジック
- [ ] 各ユニットの特殊攻撃実装（src/lib/game/specialAttacks.ts）
- [ ] SP消費処理
- [ ] 特殊攻撃効果範囲計算
- [ ] ユニットテスト作成

### 5.4 勝敗判定ロジック
- [ ] 勝利条件チェック（src/lib/game/victory.ts）
- [ ] 敗北条件チェック
- [ ] 戦闘結果計算
- [ ] ユニットテスト作成

---

## 🤖 Phase 6: AIエンジン実装

### 6.1 AI基盤
- [ ] AI基底クラス作成（src/lib/ai/base.ts）
- [ ] AIレベル型定義（Balanced, Aggressive, Strategic, Expert）
- [ ] AI思考ユーティリティ関数

### 6.2 各AIレベル実装
- [ ] Balanced AI実装（src/lib/ai/balanced.ts）
- [ ] Aggressive AI実装（src/lib/ai/aggressive.ts）
- [ ] Strategic AI実装（src/lib/ai/strategic.ts）
- [ ] Expert AI実装（src/lib/ai/expert.ts）

### 6.3 AI配置ロジック
- [ ] AI自動配置ロジック（各難易度別）
- [ ] 配置パターンバリエーション
- [ ] ユニットテスト作成

### 6.4 AI攻撃ロジック
- [ ] AI攻撃対象選択ロジック（各難易度別）
- [ ] AI特殊攻撃判断ロジック
- [ ] ユニットテスト作成

---

## 🎨 Phase 7: UIコンポーネント実装

### 7.1 共通コンポーネント
- [ ] Button コンポーネント（src/components/common/Button.tsx）
- [ ] Card コンポーネント
- [ ] Modal コンポーネント
- [ ] Loading コンポーネント
- [ ] コンポーネントテスト作成

### 7.2 ゲーム画面コンポーネント
- [ ] GameBoard コンポーネント（src/components/game/GameBoard.tsx）
- [ ] Cell コンポーネント
- [ ] Unit コンポーネント
- [ ] GridOverlay コンポーネント（攻撃範囲表示等）
- [ ] コンポーネントテスト作成

### 7.3 UI制御コンポーネント
- [ ] TurnIndicator コンポーネント（src/components/ui/TurnIndicator.tsx）
- [ ] StatusPanel コンポーネント（HP/SP表示）
- [ ] AttackButton コンポーネント
- [ ] SpecialAttackPanel コンポーネント
- [ ] コンポーネントテスト作成

### 7.4 画面コンポーネント
- [ ] TitleScreen コンポーネント（src/components/screens/TitleScreen.tsx）
- [ ] CharacterSelect コンポーネント
- [ ] EnemySelect コンポーネント
- [ ] PlacementScreen コンポーネント
- [ ] BattleScreen コンポーネント
- [ ] ResultScreen コンポーネント
- [ ] コンポーネントテスト作成

---

## 💾 Phase 8: ストレージ & データ永続化

### 8.1 ストレージユーティリティ
- [ ] localStorage操作関数（src/lib/storage/index.ts）
- [ ] データ検証関数（validateSaveData）
- [ ] エラーハンドリング
- [ ] ユニットテスト作成

### 8.2 セーブ/ロード機能
- [ ] セーブ機能実装（saveBattleState）
- [ ] ロード機能実装（loadBattleState）
- [ ] 自動セーブ機能
- [ ] データマイグレーション機能（バージョン管理）
- [ ] ユニットテスト作成

### 8.3 プレイヤーデータ管理
- [ ] プレイヤー統計保存（totalBattles, wins, losses）
- [ ] キャラクター進捗保存
- [ ] 設定保存（音量、画面設定等）

---

## 🎬 Phase 9: アニメーション & エフェクト

### 9.1 Framer Motion設定
- [ ] アニメーション定義ファイル作成（src/lib/animations/index.ts）
- [ ] トランジション設定
- [ ] イージング関数定義

### 9.2 ゲームアニメーション
- [ ] ユニット配置アニメーション
- [ ] 攻撃エフェクト
- [ ] ダメージ表示アニメーション
- [ ] ユニット破壊アニメーション
- [ ] 特殊攻撃エフェクト

### 9.3 UI/UXアニメーション
- [ ] 画面遷移アニメーション
- [ ] ボタンホバーエフェクト
- [ ] モーダル表示/非表示アニメーション
- [ ] ローディングアニメーション

---

## 🎨 Phase 10: スタイリング & デザイン

### 10.1 デザインシステム構築
- [ ] カラーパレット定義（Tailwind設定）
- [ ] タイポグラフィ設定
- [ ] スペーシングシステム
- [ ] ブレークポイント定義

### 10.2 レスポンシブ対応
- [ ] モバイルレイアウト（375px〜）
- [ ] タブレットレイアウト（768px〜）
- [ ] デスクトップレイアウト（1024px〜）
- [ ] タッチ操作対応

### 10.3 ハードボイルドテーマ適用
- [ ] ダークテーマカラー適用
- [ ] フィルムノワール風エフェクト
- [ ] タイポグラフィ調整（レトロフォント等）
- [ ] 背景デザイン

---

## 🧪 Phase 11: テスト実装

### 11.1 ユニットテスト
- [ ] ユーティリティ関数テスト
- [ ] ゲームロジックテスト
- [ ] AIエンジンテスト
- [ ] ストレージ関数テスト
- [ ] カバレッジ80%以上達成

### 11.2 コンポーネントテスト
- [ ] 共通コンポーネントテスト
- [ ] ゲームボードコンポーネントテスト
- [ ] 画面コンポーネントテスト
- [ ] ユーザーインタラクションテスト

### 11.3 統合テスト
- [ ] ゲームフロー統合テスト
- [ ] Store統合テスト
- [ ] セーブ/ロード統合テスト

### 11.4 E2Eテスト（Playwright）
- [ ] タイトル画面からキャラクター選択フロー
- [ ] ユニット配置フロー
- [ ] 戦闘プレイフロー
- [ ] セーブ/ロード機能テスト
- [ ] 勝敗判定テスト

---

## 🔗 Phase 12: 統合 & 最適化

### 12.1 機能統合
- [ ] 全画面フロー統合
- [ ] Store間の連携確認
- [ ] データフロー検証

### 12.2 パフォーマンス最適化
- [ ] React.memo適用（必要なコンポーネント）
- [ ] useMemo/useCallback最適化
- [ ] 不要な再レンダリング削減
- [ ] バンドルサイズ最適化

### 12.3 エラーハンドリング
- [ ] エラーバウンダリ実装
- [ ] ユーザーフレンドリーなエラーメッセージ
- [ ] ロギング実装

### 12.4 アクセシビリティ
- [ ] キーボードナビゲーション対応
- [ ] ARIAラベル追加
- [ ] カラーコントラスト確認
- [ ] スクリーンリーダー対応

---

## 🚢 Phase 13: デプロイ準備

### 13.1 ビルド設定
- [ ] 本番ビルド設定
- [ ] 環境変数設定
- [ ] アセット最適化

### 13.2 ドキュメント作成
- [ ] README.md作成
- [ ] 開発ドキュメント作成
- [ ] APIドキュメント作成（必要に応じて）

### 13.3 最終チェック
- [ ] 全機能動作確認
- [ ] 全テスト実行・パス確認
- [ ] クロスブラウザテスト
- [ ] パフォーマンス計測

---

## 📝 メモ & ガイドライン

### タスク実施順序
1. Phase 1-2: 基盤とデータモデル（1-2日）
2. Phase 3-4: 状態管理とユーティリティ（2-3日）
3. Phase 5-6: ゲームロジックとAI（3-4日）
4. Phase 7: UIコンポーネント（4-5日）
5. Phase 8-10: ストレージ、アニメーション、スタイリング（3-4日）
6. Phase 11: テスト（3-4日）
7. Phase 12-13: 統合、最適化、デプロイ（2-3日）

### 重要ポイント
- 各フェーズでテストを必ず実施
- コミットはタスク単位で実施
- 設計書との整合性を常に確認
- 不明点があれば設計書を参照

### 進捗管理
- 完了したタスクは `[x]` でマーク
- 作業中のタスクには日付をメモ
- 問題や課題は別途記録

# Hard-Boiled Homage

ハードボイルド探偵テーマの戦略シミュレーションゲーム

## 技術スタック

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Testing**: Vitest + React Testing Library + Playwright

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## テスト

```bash
# ユニットテスト実行
npm test

# ユニットテストUI
npm run test:ui

# E2Eテスト実行
npm run test:e2e
```

## プロジェクト構造

```
src/
├── components/     # Reactコンポーネント
├── lib/           # ゲームロジック、ユーティリティ
├── stores/        # Zustand状態管理
├── hooks/         # カスタムフック
└── assets/        # 静的アセット
```

## 開発ルール

詳細は[claude.md](./claude.md)を参照してください。

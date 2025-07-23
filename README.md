# AIリーンキャンバスジェネレーター

## 概要
DifyのAIワークフローと連携し、ユーザーとの対話を通じてリーンキャンバスを生成するWebアプリケーションです。

## 技術スタック
- **Next.js (App Router)** - フロントエンドフレームワーク
- **TypeScript** - 型安全な開発
- **shadcn/ui** - UIコンポーネントライブラリ
- **Tailwind CSS** - スタイリング
- **Dify** - AI Workflow API

## 機能
- ステップ・バイ・ステップ形式でのリーンキャンバス生成
- AIによるペルソナ自動生成
- ビジネスアイデアの最適化提案
- リアルタイムでのキャンバス生成と可視化

## ディレクトリ構造と役割

```
/
├── /app
│   ├── /api/generate/route.ts      # バックエンドAPI。フロントエンドとDify APIを仲介し、APIキーを安全に保ちます
│   ├── page.tsx                    # アプリケーションのメインUIコンポーネント。全体のレイアウトとステップの切り替えを担当
│   ├── layout.tsx                  # Next.jsレイアウトコンポーネント
│   └── globals.css                 # グローバルスタイル
│
├── /components
│   ├── /ui/                        # shadcn/uiによって自動生成される、汎用的なUI部品
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── textarea.tsx
│   └── /generator/                 # 各生成ステップ専用のUIコンポーネント
│       ├── StepWelcome.tsx         # 初期入力ステップ
│       ├── StepPersona.tsx         # ペルソナ確認ステップ
│       ├── StepIdea.tsx            # ビジネスアイデア詳細入力
│       ├── StepDetails.tsx         # 最適化されたビジネス構想確認
│       ├── StepName.tsx            # ビジネス名設定
│       └── StepCanvas.tsx          # 最終的なリーンキャンバス表示
│
├── /hooks
│   └── useGeneratorState.ts       # useReducerを用いた状態管理の心臓部。アプリの状態遷移ロジック
│
├── /lib
│   ├── dify-client.ts             # Dify APIとの通信処理をまとめたモジュール
│   └── utils.ts                   # shadcn/ui用のヘルパー関数
│
└── /types
    └── index.ts                   # プロジェクト全体で使われるTypeScriptの型定義
```

## データフロー

1. **フロントエンド (`page.tsx`)**: ユーザー操作をトリガーに、Next.jsのAPIルート `/api/generate` を呼び出す
2. **バックエンド (`route.ts`)**: リクエストを受け取り、`/lib/dify-client.ts` を使ってDify APIと通信し、**JSONデータ**を取得する
3. **フロントエンド (`useGeneratorState.ts`)**: バックエンドから受け取ったJSONデータをアプリケーションの状態に反映する
4. **UI (`StepCanvas.tsx`など)**: 状態が更新されると、UIが自動的に再描画され、JSONデータが画面に表示される

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
DIFY_BASE_URL=https://api.dify.ai
DIFY_API_KEY=your-dify-api-key-here
```

### 3. 開発サーバーの起動
```bash
npm run dev
```

アプリケーションは `http://localhost:3000` でアクセスできます。

## 使用方法

1. **初期入力**: ビジネスアイデアや解決したい課題を入力
2. **ペルソナ確認**: AIが生成したペルソナ情報を確認
3. **ビジネスアイデア詳細**: より具体的なアイデアを入力
4. **構想確認**: AIが最適化したビジネス構想を確認
5. **ビジネス名設定**: キャンバスに表示する名前を設定
6. **キャンバス生成**: 完成したリーンキャンバスを確認

## 設計思想

- **明確な関心の分離**: フロントエンド（UI）とバックエンド（API連携）を完全に分離
- **コンポーネントの責務**: 各コンポーネントは単一の責務を持つように設計
- **状態管理の集約**: 複雑な状態遷移ロジックはカスタムフックに集約し、UIコンポーネントから切り離し
- **型安全性**: すべてのデータ構造に厳密な型を定義し、アプリケーションの堅牢性を向上

## 本番デプロイ

```bash
npm run build
npm start
```

または、Vercel, Netlify, その他のNext.js対応プラットフォームにデプロイできます。

## ライセンス

MIT License
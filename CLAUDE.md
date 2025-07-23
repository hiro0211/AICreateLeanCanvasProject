# 命令書
あなたは、Next.jsを用いたWebアプリケーション開発を専門とする、リード級のフルスタックエンジニアです。これから提示する要件に基づき、保守性・可読性・拡張性を最優先したアプリケーションの雛形を構築してください。

# プロジェクト概要
Difyで構築されたAIワークフローAPIと連携し、ユーザーとの対話を通じてリーンキャンバスを生成するWebアプリケーションを構築します。UIはステップ・バイ・ステップ形式（ウィザード形式）を採用します。

# 技術スタック
フレームワーク: Next.js (App Router)

言語: TypeScript

UIコンポーネント: shadcn/ui

スタイリング: Tailwind CSS

アイコン: lucide-react

# 設計思想（最重要）
明確な関心の分離: フロントエンド（UI）とバックエンド（API連携）を完全に分離します。

コンポーネントの責務: 各コンポーネントは単一の責務を持つように設計します。

状態管理の集約: 複雑な状態遷移ロジックはカスタムフックに集約し、UIコンポーネントから切り離します。

型安全性: すべてのデータ構造に厳密な型を定義し、アプリケーションの堅牢性を高めます。

# ディレクトリ構造
以下のディレクトリ構造でプロジェクトを構築してください。

/
|-- /app
|   |-- /api/generate/route.ts      # (バックエンド) Dify APIと通信するBFF
|   |-- page.tsx                      # (フロントエンド) メインページ
|   |-- layout.tsx
|   `-- globals.css
|
|-- /components
|   |-- /ui                           # shadcn/uiによって自動生成されるコンポーネント
|   |   |-- button.tsx
|   |   |-- card.tsx
|   |   |-- input.tsx
|   |   `-- ...
|   `-- /generator                    # このアプリ専用のUIコンポーネント
|       |-- StepWelcome.tsx
|       |-- StepPersona.tsx
|       |-- StepIdea.tsx
|       |-- StepDetails.tsx
|       |-- StepName.tsx
|       `-- StepCanvas.tsx              # ★最終的なリーンキャンバス表示用
|
|-- /hooks
|   `-- useGeneratorState.ts          # 状態管理ロジックを集約するカスタムフック
|
|-- /lib
|   |-- dify-client.ts                # Dify APIとの通信を抽象化するクライアント
|   `-- utils.ts                      # shadcn/ui用のヘルパー関数
|
|-- /types
|   `-- index.ts                      # アプリケーション全体の型定義
|
`-- README.md                         # プロジェクトの説明ファイル

# 各ファイルの役割と実装方針
/app/api/generate/route.ts（バックエンド）

Next.jsのRoute Handlerとして機能するBFFです。

フロントエンドからのリクエストを受け取り、サーバー側で安全にDify APIを呼び出します。これにより、APIキーがブラウザに漏れるのを防ぎます。

/hooks/useGeneratorState.ts（フロントエンド・ロジック）

useReducer を使って、アプリケーションの複雑な状態（現在のステップ、各ステップのデータ、ローディング状態など）を一元管理するカスタムフックです。

/app/page.tsx（フロントエンド・UI）

アプリケーションのメインコンポーネントです。

useGeneratorStateフックを呼び出し、現在の状態とロジックを取得します。

現在のステップに応じて、/components/generator配下の適切なコンポーネントを動的に表示します。

/components/generator/*.tsx（フロントエンド・UI）

各ステップ専用のコンポーネントです。UIにはshadcn/uiのButton, Card, Input, Textareaなどを積極的に使用してください。

状態管理ロジックは持たず、親から渡されたProps（データと関数）のみを利用します。

/types/index.ts

Dify APIから返されるJSONデータの型（Persona, BusinessIdea, CanvasDataなど）をすべてここで定義します。

# 最終ステップの実装要件（JSONデータ → TSXへの適用）
この要件は非常に重要です。
最終ステップでDify APIから返却されるリーンキャンバスのJSONデータを、指定されたTSXコンポーネント構造に当てはめて表示するロジックを実装してください。

対象コンポーネント: /components/generator/StepCanvas.tsx

受け取るデータ: CanvasData型のJSONオブジェクトをPropsとして受け取ります。

// /types/index.ts で定義される型
interface CanvasData {
  problem: string[];
  solution: string[];
  keyMetrics: string[];
  uniqueValueProposition: string[];
  // ... 他の8項目も同様
}

実装内容:

StepCanvas.tsxは、以下の提供されたTSXコードをベースに構築してください。

Propsで受け取ったCanvasDataオブジェクトの各配列（例: data.problem）を.map()でループ処理し、各要素を<li>タグとして動的に描画してください。

データがまだない場合は、ローディングスケルトンを表示するなどの配慮をしてください。

StepCanvas.tsx のベースとなるTSXコード
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // shadcn/uiのCardを使用

// CanvasDataの型をインポートすることを想定
import { CanvasData } from '@/types';

interface StepCanvasProps {
  data: CanvasData | null;
}

const CanvasBox: React.FC<{ title: string; subtitle: string; children: React.ReactNode; className?: string }> = ({ title, subtitle, children, className }) => (
  <Card className={`h-full flex flex-col ${className}`}>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </CardHeader>
    <CardContent className="flex-grow">
      {children}
    </CardContent>
  </Card>
);

export const StepCanvas: React.FC<StepCanvasProps> = ({ data }) => {
  if (!data) {
    // データがない場合（ローディング中など）のスケルトン表示
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold">Lean Canvas</h1>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-5 gap-2" style={{ minHeight: '75vh' }}>
        {/* Problem */}
        <div className="md:row-span-2">
          <CanvasBox title="Problem" subtitle="課題">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {data.problem.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CanvasBox>
        </div>

        {/* Solution & Key Metrics */}
        <div className="md:row-span-2 grid grid-rows-2 gap-2">
          <CanvasBox title="Solution" subtitle="解決策">
             <ul className="list-disc list-inside space-y-1 text-sm">
              {data.solution.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CanvasBox>
          <CanvasBox title="Key Metrics" subtitle="主要指標">
             <ul className="list-disc list-inside space-y-1 text-sm">
              {data.keyMetrics.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </CanvasBox>
        </div>

        {/* Unique Value Proposition */}
        <div className="md:row-span-2">
          <CanvasBox title="Unique Value Proposition" subtitle="独自の価値提案" className="items-center justify-center text-center">
            <p className="font-semibold text-lg text-indigo-600">
              {data.uniqueValueProposition[0]}
            </p>
            <p className="text-sm mt-2">
              {data.uniqueValueProposition.slice(1).join(' ')}
            </p>
          </CanvasBox>
        </div>
        
        {/* 他の項目も同様にdataをマッピングして実装... */}
        
      </main>
    </div>
  );
};

# README.md の生成
以下の内容を含むREADME.mdファイルを生成してください。

# AIリーンキャンバスジェネレーター

## 概要
DifyのAIワークフローと連携し、ユーザーとの対話を通じてリーンキャンバスを生成するWebアプリケーションです。

## 技術スタック
- Next.js (App Router)
- TypeScript
- **shadcn/ui**
- Tailwind CSS
- Dify (AI Workflow)

## ディレクトリ構造と役割
- **/app/api/generate/route.ts**: バックエンドAPI。フロントエンドとDify APIを仲介し、APIキーを安全に保ちます。
- **/app/page.tsx**: アプリケーションのメインUIコンポーネント。全体のレイアウトとステップの切り替えを担当します。
- **/components/ui/**: **shadcn/ui**によって自動生成される、汎用的なUI部品。
- **/components/generator/**: 各生成ステップ専用のUIコンポーネント。
- **/hooks/useGeneratorState.ts**: `useReducer`を用いた状態管理の心臓部。アプリの状態遷移ロジックはすべてここにあります。
- **/lib/dify-client.ts**: Dify APIとの通信処理をまとめたモジュール。
- **/types/index.ts**: プロジェクト全体で使われるTypeScriptの型定義。

## データフロー
1.  **フロントエンド (`page.tsx`)**: ユーザー操作をトリガーに、Next.jsのAPIルート `/api/generate` を呼び出す。
2.  **バックエンド (`route.ts`)**: リクエストを受け取り、`/lib/dify-client.ts` を使ってDify APIと通信し、**JSONデータ**を取得する。
3.  **フロントエンド (`useGeneratorState.ts`)**: バックエンドから受け取ったJSONデータをアプリケーションの状態に反映する。
4.  **UI (`StepCanvas.tsx`など)**: 状態が更新されると、UIが自動的に再描画され、JSONデータが画面に表示される。

# 出力形式
上記で定義した各ファイルのパスをコメントとして明記し、ファイルごとにコードブロックを分けて、プロジェクト全体のコードを生成してください。

最高のアーキテクチャとクリーンなコードを期待しています。よろしくお願いします
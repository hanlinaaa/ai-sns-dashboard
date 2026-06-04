# AI SNS Dashboard

AI SNS Dashboard は、SNS 投稿文の生成、履歴管理、投稿カレンダー、ブランドルール、外部連携設定をまとめたフロントエンド展示用プロジェクトです。

## 主な機能

- X、Instagram、LINE 向けの投稿文生成
- トーン、ターゲット層、キーワードを使ったプレビュー更新
- 生成履歴の保存、検索、フィルタ、編集、削除、お気に入り管理
- CSV / Excel 形式の履歴エクスポート
- 投稿カレンダーの月・週・日表示、ドラッグによる排期変更
- 生成コンテンツから投稿カレンダーへの追加
- ブランド設定、NG ワード、必須ワード、ハッシュタグルール管理
- AI / SNS API / 通知 / ワークフロー設定の管理
- localStorage によるフロントエンド完結の状態保存

## 技術スタック

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
- Recharts
- date-fns
- pnpm

## セットアップ

```bash
pnpm install
pnpm dev
```

ブラウザで `http://localhost:3000` を開きます。

## ビルド

```bash
pnpm build
pnpm exec tsc --noEmit
```

## 補足

このプロジェクトはポートフォリオ用途のフロントエンド実装です。AI 生成や SNS 連携は実 API ではなく、画面上の操作体験と状態管理を確認できる形で実装しています。

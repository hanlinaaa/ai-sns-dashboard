import type { ContentStatus, Platform, Tone } from "./types"

export const platformLabels: Record<Platform, string> = {
  x: "X",
  instagram: "Instagram",
  line: "LINE",
}

export const toneLabels: Record<Tone, string> = {
  business: "ビジネス敬語",
  friendly: "親しみやすい",
  gyaru: "ギャル風",
  promo: "セール・プロモーション",
}

export const statusLabels: Record<ContentStatus, string> = {
  draft: "下書き",
  generated: "生成済み",
  scheduled: "予約済み",
  pendingApproval: "承認待ち",
  published: "公開済み",
  failed: "失敗",
}

export const appLabels = {
  contentGenerationTitle: "コンテンツ生成",
  contentGenerationDescription: "AIを使ってSNS投稿を作成します",
  historyTitle: "生成履歴",
  historyDescription: "過去に生成したコンテンツを管理・再利用できます",
  savedToHistory: "生成履歴に保存しました",
  addedToCalendar: "投稿カレンダーに追加しました",
  generatedContent: "コンテンツを生成しました",
  historyLoadFailed: "保存済み履歴の読み込みに失敗しました",
  csvDownloaded: "CSVをダウンロードしました",
  excelDownloaded: "Excelファイルをダウンロードしました",
} as const

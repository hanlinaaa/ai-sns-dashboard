export type Platform = "x" | "instagram" | "line"
export type Tone = "business" | "friendly" | "gyaru" | "promo"
export type Status = "published" | "unused" | "draft" | "scheduled" | "failed"

export interface HistoryRecord {
  id: string
  platform: Platform
  tone: Tone
  targetAudience: string
  keywords: string
  generatedContent: string
  createdAt: Date
  status: Status
  isFavorite: boolean
}

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

export const statusLabels: Record<Status, string> = {
  published: "発布済み",
  unused: "未使用",
  draft: "下書き",
  scheduled: "排期済み",
  failed: "エラー",
}

export interface BrandSettings {
  // 1. Brand Identity
  brandName: string
  brandBio: string
  targetAudience: string

  // 2. Tone & Voice
  defaultTones: Record<Platform, Tone>
  customInstructions: string
  firstPerson: string
  secondPerson: string

  // 3. Brand Safety
  ngWords: string[]
  mustHaveWords: string[]
  allowHashtags: boolean
  maxHashtags: Record<Platform, number>
  allowEmojis: boolean
  contentLength: "short" | "medium" | "long"

  // 4. Knowledge Base
  websiteUrl: string
  contactInfo: string
  disclaimer: string
}

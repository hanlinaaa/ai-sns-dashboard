import type { VersionedRecord } from "./data-version"

export type Platform = "x" | "instagram" | "line"

export type Tone = "business" | "friendly" | "gyaru" | "promo"

export type ContentStatus =
  | "draft"
  | "generated"
  | "scheduled"
  | "pendingApproval"
  | "published"
  | "failed"

export type Status = ContentStatus

export type PlatformAccountStatus = "connected" | "disconnected" | "expired"

export type PublishJobStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled"

export type ContentLengthPreference = "short" | "medium" | "long"

export interface AnalyticsMetric extends VersionedRecord {
  id: string
  platform: Platform
  contentId?: string
  calendarEventId?: string
  capturedAt: Date
  impressions: number
  likes: number
  comments: number
  shares: number
  saves: number
  clicks: number
  engagementRate: number
}

export interface GeneratedContent extends VersionedRecord {
  id: string
  platform: Platform
  tone: Tone
  targetAudience: string
  keywords: string
  body: string
  status: ContentStatus
  createdAt: Date
  updatedAt: Date
  brandSettingsId?: string
}

export interface HistoryRecord extends VersionedRecord {
  id: string
  platform: Platform
  tone: Tone
  targetAudience: string
  keywords: string
  generatedContent: string
  createdAt: Date
  status: ContentStatus
  isFavorite: boolean
  generatedContentId?: string
}

export interface CalendarEvent extends VersionedRecord {
  id: string
  title: string
  platform: Platform
  tone: Tone
  content: string
  scheduledAt: Date
  status: ContentStatus
  historyId?: string
  publishJobId?: string
}

export interface BrandSettings extends VersionedRecord {
  id: string
  brandName: string
  brandBio: string
  targetAudience: string
  defaultTones: Record<Platform, Tone>
  customInstructions: string
  firstPerson: string
  secondPerson: string
  ngWords: string[]
  mustHaveWords: string[]
  allowHashtags: boolean
  maxHashtags: Record<Platform, number>
  allowEmojis: boolean
  contentLength: ContentLengthPreference
  websiteUrl: string
  contactInfo: string
  disclaimer: string
}

export interface PlatformAccount extends VersionedRecord {
  id: string
  platform: Platform
  displayName: string
  status: PlatformAccountStatus
  connectedAt?: Date
  expiresAt?: Date
  credentialsRef?: string
}

export interface SystemSettings extends VersionedRecord {
  id: string
  ai: {
    model: string
    apiKey: string
  }
  sns: {
    x: {
      apiKey: string
      apiSecret: string
      connected: boolean
    }
    instagram: {
      accessToken: string
      connected: boolean
    }
    line: {
      channelToken: string
      channelSecret: string
      connected: boolean
    }
  }
  analytics: {
    gaId: string
  }
  workflow: {
    requireApproval: boolean
    autoCleanupDays: string
  }
  notifications: {
    emailWeeklyReport: boolean
    emailPublishStatus: boolean
    inAppToast: boolean
  }
}

export interface PublishJob extends VersionedRecord {
  id: string
  platform: Platform
  accountId?: string
  contentId?: string
  calendarEventId?: string
  status: PublishJobStatus
  scheduledAt: Date
  startedAt?: Date
  completedAt?: Date
  retryCount: number
  errorMessage?: string
}

export { platformLabels, statusLabels, toneLabels } from "./labels"

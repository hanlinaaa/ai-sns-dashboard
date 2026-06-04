import type { ContentStatus, Platform, Tone } from "./types"

export const platformLabels: Record<Platform, string> = {
  x: "X",
  instagram: "Instagram",
  line: "LINE",
}

export const toneLabels: Record<Tone, string> = {
  business: "Business",
  friendly: "Friendly",
  gyaru: "Casual pop",
  promo: "Promotion",
}

export const statusLabels: Record<ContentStatus, string> = {
  draft: "Draft",
  generated: "Generated",
  scheduled: "Scheduled",
  pendingApproval: "Pending approval",
  published: "Published",
  failed: "Failed",
}

export const appLabels = {
  contentGenerationTitle: "Content Generation",
  contentGenerationDescription:
    "Create validated SNS content for X, Instagram, and LINE from one campaign brief.",
  historyTitle: "Generation History",
  historyDescription: "Manage, reuse, export, and schedule generated content assets.",
  savedToHistory: "Saved to generation history.",
  addedToCalendar: "Added to the publishing calendar.",
  generatedContent: "Generated content for all platforms.",
  historyLoadFailed: "Failed to load saved history.",
  csvDownloaded: "CSV downloaded.",
  excelDownloaded: "Excel file downloaded.",
} as const

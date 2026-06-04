import { format, subDays } from "date-fns"
import type {
  AnalyticsMetric,
  CalendarEvent,
  HistoryRecord,
  Platform,
  PublishJob,
  Tone,
} from "@/domain/types"
import type { DataRepositories } from "@/services/repositories"

export interface DashboardKpi {
  totalGenerated: number
  publishSuccessRate: number
  totalEngagement: number
  totalClicks: number
  bestPublishTime: string
}

export interface TrendPoint {
  date: string
  count: number
}

export interface PlatformPerformancePoint {
  platform: Platform
  label: string
  impressions: number
  engagementRate: number
}

export interface ToneUsagePoint {
  tone: Tone
  label: string
  count: number
}

export interface KeywordPoint {
  keyword: string
  count: number
}

export interface TopContentPoint {
  id: string
  platform: Platform
  content: string
  engagementRate: number
  impressions: number
}

export interface DashboardAnalytics {
  kpis: DashboardKpi
  trend: TrendPoint[]
  platformPerformance: PlatformPerformancePoint[]
  toneUsage: ToneUsagePoint[]
  topKeywords: KeywordPoint[]
  topContent: TopContentPoint[]
  upcomingEvents: CalendarEvent[]
  recentHistory: HistoryRecord[]
  failedJobs: PublishJob[]
  optimizationHint: string
}

const platformLabels: Record<Platform, string> = {
  x: "X",
  instagram: "Instagram",
  line: "LINE",
}

const toneLabels: Record<Tone, string> = {
  business: "Business",
  friendly: "Friendly",
  gyaru: "Gyaru",
  promo: "Promotion",
}

function engagementTotal(metric: AnalyticsMetric) {
  return metric.likes + metric.comments + metric.shares + metric.saves
}

function keywordTokens(records: HistoryRecord[]) {
  const counts = new Map<string, number>()
  for (const record of records) {
    for (const token of record.keywords.split(/[,\s、，]+/).map((item) => item.trim())) {
      if (!token) continue
      counts.set(token, (counts.get(token) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

function buildTrend(records: HistoryRecord[]) {
  const today = new Date()
  return Array.from({ length: 8 }, (_, index) => {
    const date = subDays(today, (7 - index) * 4)
    const endDate = subDays(today, (7 - index) * 4 - 3)
    const count = records.filter(
      (record) => record.createdAt >= date && record.createdAt <= endDate,
    ).length
    return {
      date: format(date, "M/d"),
      count,
    }
  })
}

function successRate(jobs: PublishJob[], events: CalendarEvent[]) {
  const succeeded = jobs.filter((job) => job.status === "succeeded").length
  const failed = jobs.filter((job) => job.status === "failed").length
  const publishedEvents = events.filter((event) => event.status === "published").length
  const failedEvents = events.filter((event) => event.status === "failed").length
  const totalSucceeded = succeeded + publishedEvents
  const totalCompleted = totalSucceeded + failed + failedEvents
  return totalCompleted === 0 ? 0 : Math.round((totalSucceeded / totalCompleted) * 100)
}

function platformPerformance(metrics: AnalyticsMetric[]) {
  return (Object.keys(platformLabels) as Platform[]).map((platform) => {
    const platformMetrics = metrics.filter((metric) => metric.platform === platform)
    const impressions = platformMetrics.reduce((sum, metric) => sum + metric.impressions, 0)
    const engagementRate =
      platformMetrics.length === 0
        ? 0
        : platformMetrics.reduce((sum, metric) => sum + metric.engagementRate, 0) /
          platformMetrics.length
    return {
      platform,
      label: platformLabels[platform],
      impressions,
      engagementRate: Number(engagementRate.toFixed(2)),
    }
  })
}

function toneUsage(records: HistoryRecord[]) {
  return (Object.keys(toneLabels) as Tone[]).map((tone) => ({
    tone,
    label: toneLabels[tone],
    count: records.filter((record) => record.tone === tone).length,
  }))
}

function topContent(metrics: AnalyticsMetric[], records: HistoryRecord[], events: CalendarEvent[]) {
  return [...metrics]
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 5)
    .map((metric) => {
      const historyRecord = metric.contentId
        ? records.find((record) => record.id === metric.contentId)
        : undefined
      const calendarEvent = metric.calendarEventId
        ? events.find((event) => event.id === metric.calendarEventId)
        : undefined
      return {
        id: historyRecord?.id ?? calendarEvent?.id ?? metric.id,
        platform: metric.platform,
        content: historyRecord?.generatedContent ?? calendarEvent?.content ?? metric.id,
        engagementRate: metric.engagementRate,
        impressions: metric.impressions,
      }
    })
}

function bestPublishTime(events: CalendarEvent[], metrics: AnalyticsMetric[]) {
  const publishedEvents = events.filter((event) => event.status === "published")
  if (publishedEvents.length === 0 || metrics.length === 0) return "12:00"
  const bestMetric = [...metrics].sort((a, b) => b.engagementRate - a.engagementRate)[0]
  const event = bestMetric.calendarEventId
    ? publishedEvents.find((item) => item.id === bestMetric.calendarEventId)
    : publishedEvents[0]
  if (!event) return "12:00"
  return format(event.scheduledAt, "HH:mm")
}

function optimizationHint(data: {
  metrics: AnalyticsMetric[]
  jobs: PublishJob[]
  platformPoints: PlatformPerformancePoint[]
  keywords: KeywordPoint[]
}) {
  const failedJobs = data.jobs.filter((job) => job.status === "failed").length
  if (failedJobs > 0) return "Review failed publish jobs before adding more scheduled content."

  const bestPlatform = [...data.platformPoints].sort(
    (a, b) => b.engagementRate - a.engagementRate,
  )[0]
  if (bestPlatform && bestPlatform.engagementRate > 0) {
    return `Prioritize ${bestPlatform.label} content around proven high-engagement topics.`
  }

  const bestKeyword = data.keywords[0]
  if (bestKeyword) return `Reuse keyword "${bestKeyword.keyword}" in the next AI generation brief.`
  return "Generate and publish more content to build a reliable optimization baseline."
}

export function createAnalyticsService(repositories: DataRepositories) {
  return {
    async getDashboardAnalytics(): Promise<DashboardAnalytics> {
      try {
        const [historyRecords, calendarEvents, publishJobs, analyticsMetrics] = await Promise.all([
          repositories.historyRepository.list(),
          repositories.calendarRepository.list(),
          repositories.publishJobRepository.list(),
          repositories.analyticsRepository.list(),
        ])
        const upcomingEvents = calendarEvents
          .filter((event) => event.status === "scheduled" && event.scheduledAt >= new Date())
          .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
          .slice(0, 4)
        const recentHistory = [...historyRecords]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)
        const platformPoints = platformPerformance(analyticsMetrics)
        const keywords = keywordTokens(historyRecords)
        const totalEngagement = analyticsMetrics.reduce(
          (sum, metric) => sum + engagementTotal(metric),
          0,
        )
        const totalClicks = analyticsMetrics.reduce((sum, metric) => sum + metric.clicks, 0)

        return {
          kpis: {
            totalGenerated: historyRecords.length,
            publishSuccessRate: successRate(publishJobs, calendarEvents),
            totalEngagement,
            totalClicks,
            bestPublishTime: bestPublishTime(calendarEvents, analyticsMetrics),
          },
          trend: buildTrend(historyRecords),
          platformPerformance: platformPoints,
          toneUsage: toneUsage(historyRecords),
          topKeywords: keywords,
          topContent: topContent(analyticsMetrics, historyRecords, calendarEvents),
          upcomingEvents,
          recentHistory,
          failedJobs: publishJobs.filter((job) => job.status === "failed").slice(0, 4),
          optimizationHint: optimizationHint({
            metrics: analyticsMetrics,
            jobs: publishJobs,
            platformPoints,
            keywords,
          }),
        }
      } catch (error) {
        console.error("Failed to build dashboard analytics:", error)
        throw error
      }
    },
  }
}

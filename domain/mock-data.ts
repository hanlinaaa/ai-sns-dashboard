import { addDays, setHours, setMinutes, startOfToday } from "date-fns"
import { CURRENT_DATA_VERSION } from "./data-version"
import type {
  AnalyticsMetric,
  BrandSettings,
  CalendarEvent,
  HistoryRecord,
  PlatformAccount,
  SystemSettings,
} from "./types"

const today = startOfToday()

export const mockCalendarEvents: CalendarEvent[] = [
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "evt-retail-x",
    title: "Retail weekend campaign",
    platform: "x",
    tone: "promo",
    content:
      "Weekend only: selected store essentials are 20% off. Save this post and check the campaign page before the offer closes.",
    scheduledAt: setMinutes(setHours(addDays(today, 1), 10), 0),
    status: "scheduled",
  },
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "evt-cafe-instagram",
    title: "Cafe seasonal drink launch",
    platform: "instagram",
    tone: "friendly",
    content:
      "Our seasonal matcha latte is now available for a limited time. Smooth, lightly sweet, and made for a calm afternoon break.\n\n#CafeLaunch #MatchaLatte #TokyoCafe",
    scheduledAt: setMinutes(setHours(addDays(today, 1), 18), 0),
    status: "scheduled",
  },
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "evt-line-coupon",
    title: "LINE coupon campaign",
    platform: "line",
    tone: "business",
    content:
      "Thank you for following our LINE account. Show this message in store by Sunday to receive one free topping with your order.",
    scheduledAt: setMinutes(setHours(addDays(today, 2), 12), 0),
    status: "draft",
  },
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "evt-seminar-x",
    title: "B2B seminar reminder",
    platform: "x",
    tone: "business",
    content:
      "Seats are still available for this week's SNS operations seminar. We will cover approval flows, content QA, and analytics reporting for lean teams.",
    scheduledAt: setMinutes(setHours(addDays(today, 3), 9), 0),
    status: "published",
  },
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "evt-beauty-instagram",
    title: "Beauty product launch QA hold",
    platform: "instagram",
    tone: "promo",
    content:
      "New serum launch preview failed compliance review because the draft used absolute wording. Please revise before scheduling.",
    scheduledAt: setMinutes(setHours(today, 8), 0),
    status: "failed",
  },
]

export const mockHistoryRecords: HistoryRecord[] = [
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "hist-retail-x",
    platform: "x",
    tone: "promo",
    targetAudience: "Urban shoppers looking for practical weekend deals",
    keywords: "retail campaign, weekend sale, 20% discount",
    generatedContent:
      "Weekend deal alert: selected daily essentials are 20% off through Sunday. Plan your visit and pick up the items you already had on your list.",
    createdAt: new Date("2026-05-18T10:30:00"),
    status: "published",
    isFavorite: true,
  },
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "hist-cafe-instagram",
    platform: "instagram",
    tone: "friendly",
    targetAudience: "Cafe regulars and local office workers",
    keywords: "seasonal drink, matcha latte, limited menu",
    generatedContent:
      "A new seasonal drink has arrived. Our matcha latte brings a soft sweetness and clean finish for your next afternoon break.\n\n#SeasonalDrink #CafeMenu #MatchaLatte",
    createdAt: new Date("2026-05-17T15:20:00"),
    status: "published",
    isFavorite: true,
  },
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "hist-line-coupon",
    platform: "line",
    tone: "business",
    targetAudience: "Existing LINE followers",
    keywords: "LINE coupon campaign, repeat visit, in-store offer",
    generatedContent:
      "Thank you for being part of our LINE community. This week's coupon gives you 10% off your next in-store purchase.",
    createdAt: new Date("2026-05-16T09:00:00"),
    status: "generated",
    isFavorite: false,
  },
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "hist-beauty-instagram",
    platform: "instagram",
    tone: "promo",
    targetAudience: "Beauty product fans and first-time skincare buyers",
    keywords: "beauty product launch, new serum, limited gift",
    generatedContent:
      "Meet our new daily serum, designed for a lighter morning routine. Launch week orders include a limited sample kit while supplies last.\n\n#BeautyLaunch #SkincareRoutine #NewSerum",
    createdAt: new Date("2026-05-15T18:45:00"),
    status: "generated",
    isFavorite: false,
  },
]

export const mockPlatformAccounts: PlatformAccount[] = [
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "acct-x-main",
    platform: "x",
    displayName: "AI SNS Ops X",
    status: "connected",
    connectedAt: addDays(today, -20),
    expiresAt: addDays(today, 40),
    credentialsRef: "mock:x:main",
  },
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "acct-instagram-main",
    platform: "instagram",
    displayName: "AI SNS Ops Instagram",
    status: "connected",
    connectedAt: addDays(today, -18),
    expiresAt: addDays(today, 22),
    credentialsRef: "mock:instagram:main",
  },
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "acct-line-main",
    platform: "line",
    displayName: "AI SNS Ops LINE",
    status: "connected",
    connectedAt: addDays(today, -30),
    expiresAt: addDays(today, 60),
    credentialsRef: "mock:line:main",
  },
]

export const mockAnalyticsMetrics: AnalyticsMetric[] = [
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "metric-hist-retail-x",
    platform: "x",
    contentId: "hist-retail-x",
    capturedAt: addDays(today, -6),
    impressions: 18400,
    likes: 820,
    comments: 96,
    shares: 145,
    saves: 210,
    clicks: 364,
    engagementRate: 6.91,
  },
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "metric-hist-cafe-instagram",
    platform: "instagram",
    contentId: "hist-cafe-instagram",
    capturedAt: addDays(today, -5),
    impressions: 24200,
    likes: 1280,
    comments: 142,
    shares: 260,
    saves: 510,
    clicks: 430,
    engagementRate: 9.05,
  },
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "metric-hist-line-coupon",
    platform: "line",
    contentId: "hist-line-coupon",
    capturedAt: addDays(today, -4),
    impressions: 9200,
    likes: 220,
    comments: 34,
    shares: 76,
    saves: 40,
    clicks: 310,
    engagementRate: 4.04,
  },
  {
    dataVersion: CURRENT_DATA_VERSION,
    id: "metric-evt-seminar-x",
    platform: "x",
    calendarEventId: "evt-seminar-x",
    capturedAt: addDays(today, -2),
    impressions: 13800,
    likes: 640,
    comments: 58,
    shares: 112,
    saves: 95,
    clicks: 245,
    engagementRate: 6.56,
  },
]

export const mockBrandSettings: BrandSettings = {
  dataVersion: CURRENT_DATA_VERSION,
  id: "default",
  brandName: "AI SNS Ops",
  brandBio:
    "SNS content operations workspace for marketing teams that need consistent campaign copy, approval workflows, and reporting.",
  targetAudience: "SNS marketers, small business owners, agency operators, and promotion managers.",
  defaultTones: {
    x: "friendly",
    instagram: "promo",
    line: "business",
  },
  customInstructions:
    "Use concise wording, avoid exaggerated claims, and keep every post aligned with the campaign brief and brand safety rules.",
  firstPerson: "our team",
  secondPerson: "customers",
  ngWords: ["competitor", "absolute", "100%", "guaranteed"],
  mustHaveWords: ["AI SNS Ops", "time saving"],
  allowHashtags: true,
  maxHashtags: {
    x: 3,
    instagram: 10,
    line: 0,
  },
  allowEmojis: true,
  contentLength: "medium",
  websiteUrl: "https://example.com/ai-sns-ops",
  contactInfo: "support@example.com (weekdays 10:00-18:00 JST)",
  disclaimer: "Campaign details may change without prior notice.",
}

export const mockSystemSettings: SystemSettings = {
  dataVersion: CURRENT_DATA_VERSION,
  id: "default",
  ai: {
    model: "gpt-4o-mini",
    apiKey: "",
  },
  sns: {
    x: { apiKey: "mock-x-api-key", apiSecret: "mock-x-api-secret", connected: true },
    instagram: { accessToken: "", connected: false },
    line: { channelToken: "", channelSecret: "", connected: false },
  },
  analytics: {
    gaId: "G-DEMO123456",
  },
  workflow: {
    requireApproval: true,
    autoCleanupDays: "90",
  },
  notifications: {
    emailWeeklyReport: true,
    emailPublishStatus: true,
    inAppToast: true,
  },
}

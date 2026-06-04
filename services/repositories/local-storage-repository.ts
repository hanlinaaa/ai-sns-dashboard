"use client"

import { CURRENT_DATA_VERSION } from "@/domain/data-version"
import {
  mockAnalyticsMetrics,
  mockBrandSettings,
  mockCalendarEvents,
  mockHistoryRecords,
  mockPlatformAccounts,
  mockSystemSettings,
} from "@/domain/mock-data"
import type {
  AnalyticsMetric,
  BrandSettings,
  CalendarEvent,
  GeneratedContent,
  HistoryRecord,
  PlatformAccount,
  PublishJob,
  SystemSettings,
} from "@/domain/types"
import type { CrudRepository, DataRepositories } from "@/services/repositories/contracts"
import { RepositoryError } from "@/services/repositories/errors"

interface StorageEnvelope<TRecord> {
  dataVersion: number
  records: TRecord
}

const STORAGE_KEYS = {
  history: "sns-dashboard-history",
  calendar: "sns-dashboard-calendar-events",
  brandSettings: "ai-sns-dashboard:brand-settings",
  systemSettings: "ai-sns-dashboard:system-settings",
  generatedContent: "ai-sns-dashboard:generated-content",
  publishJobs: "ai-sns-dashboard:publish-jobs",
  platformAccounts: "ai-sns-dashboard:platform-accounts",
  analyticsMetrics: "ai-sns-dashboard:analytics-metrics",
} as const

type HistoryStorageRecord = Omit<HistoryRecord, "createdAt"> & { createdAt: string }
type CalendarStorageRecord = Omit<CalendarEvent, "scheduledAt"> & { scheduledAt: string }
type GeneratedContentStorageRecord = Omit<GeneratedContent, "createdAt" | "updatedAt"> & {
  createdAt: string
  updatedAt: string
}
type PublishJobStorageRecord = Omit<PublishJob, "scheduledAt" | "startedAt" | "completedAt"> & {
  scheduledAt: string
  startedAt?: string
  completedAt?: string
}
type PlatformAccountStorageRecord = Omit<PlatformAccount, "connectedAt" | "expiresAt"> & {
  connectedAt?: string
  expiresAt?: string
}
type AnalyticsMetricStorageRecord = Omit<AnalyticsMetric, "capturedAt"> & {
  capturedAt: string
}

function ensureBrowserStorage() {
  if (typeof window === "undefined") {
    throw new RepositoryError("storage_unavailable", "Browser storage is not available.")
  }

  return window.localStorage
}

function withVersion<TRecord extends { dataVersion?: number }>(record: TRecord): TRecord {
  return {
    ...record,
    dataVersion: record.dataVersion ?? CURRENT_DATA_VERSION,
  }
}

function uniqueById<TRecord extends { id: string }>(items: TRecord[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values())
}

function readEnvelope<TRecord>(key: string): TRecord | null {
  try {
    const raw = ensureBrowserStorage().getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw) as StorageEnvelope<TRecord> | TRecord
    if (typeof parsed === "object" && parsed !== null && "records" in parsed) {
      return parsed.records
    }

    return parsed
  } catch (error) {
    throw new RepositoryError("storage_unavailable", "Failed to read local data.", error)
  }
}

function writeEnvelope<TRecord>(key: string, records: TRecord) {
  try {
    const envelope: StorageEnvelope<TRecord> = {
      dataVersion: CURRENT_DATA_VERSION,
      records,
    }
    ensureBrowserStorage().setItem(key, JSON.stringify(envelope))
  } catch (error) {
    throw new RepositoryError("storage_unavailable", "Failed to write local data.", error)
  }
}

function toHistoryRecord(record: HistoryStorageRecord | HistoryRecord): HistoryRecord {
  return withVersion({
    ...record,
    createdAt: record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt),
  })
}

function fromHistoryRecord(record: HistoryRecord): HistoryStorageRecord {
  return {
    ...withVersion(record),
    createdAt: record.createdAt.toISOString(),
  }
}

function toCalendarEvent(record: CalendarStorageRecord | CalendarEvent): CalendarEvent {
  return withVersion({
    ...record,
    scheduledAt:
      record.scheduledAt instanceof Date ? record.scheduledAt : new Date(record.scheduledAt),
  })
}

function fromCalendarEvent(record: CalendarEvent): CalendarStorageRecord {
  return {
    ...withVersion(record),
    scheduledAt: record.scheduledAt.toISOString(),
  }
}

function toGeneratedContent(
  record: GeneratedContentStorageRecord | GeneratedContent,
): GeneratedContent {
  return withVersion({
    ...record,
    createdAt: record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt),
    updatedAt: record.updatedAt instanceof Date ? record.updatedAt : new Date(record.updatedAt),
  })
}

function fromGeneratedContent(record: GeneratedContent): GeneratedContentStorageRecord {
  return {
    ...withVersion(record),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}

function toPublishJob(record: PublishJobStorageRecord | PublishJob): PublishJob {
  return withVersion({
    ...record,
    scheduledAt:
      record.scheduledAt instanceof Date ? record.scheduledAt : new Date(record.scheduledAt),
    startedAt:
      record.startedAt === undefined
        ? undefined
        : record.startedAt instanceof Date
          ? record.startedAt
          : new Date(record.startedAt),
    completedAt:
      record.completedAt === undefined
        ? undefined
        : record.completedAt instanceof Date
          ? record.completedAt
          : new Date(record.completedAt),
  })
}

function fromPublishJob(record: PublishJob): PublishJobStorageRecord {
  return {
    ...withVersion(record),
    scheduledAt: record.scheduledAt.toISOString(),
    startedAt: record.startedAt?.toISOString(),
    completedAt: record.completedAt?.toISOString(),
  }
}

function toPlatformAccount(
  record: PlatformAccountStorageRecord | PlatformAccount,
): PlatformAccount {
  return withVersion({
    ...record,
    connectedAt:
      record.connectedAt === undefined
        ? undefined
        : record.connectedAt instanceof Date
          ? record.connectedAt
          : new Date(record.connectedAt),
    expiresAt:
      record.expiresAt === undefined
        ? undefined
        : record.expiresAt instanceof Date
          ? record.expiresAt
          : new Date(record.expiresAt),
  })
}

function fromPlatformAccount(record: PlatformAccount): PlatformAccountStorageRecord {
  return {
    ...withVersion(record),
    connectedAt: record.connectedAt?.toISOString(),
    expiresAt: record.expiresAt?.toISOString(),
  }
}

function toAnalyticsMetric(
  record: AnalyticsMetricStorageRecord | AnalyticsMetric,
): AnalyticsMetric {
  return withVersion({
    ...record,
    capturedAt: record.capturedAt instanceof Date ? record.capturedAt : new Date(record.capturedAt),
  })
}

function fromAnalyticsMetric(record: AnalyticsMetric): AnalyticsMetricStorageRecord {
  return {
    ...withVersion(record),
    capturedAt: record.capturedAt.toISOString(),
  }
}

function createCollectionRepository<TRecord extends { id: string; dataVersion: number }, TStored>({
  key,
  fallback,
  toRecord,
  fromRecord,
}: {
  key: string
  fallback: TRecord[]
  toRecord: (record: TStored | TRecord) => TRecord
  fromRecord: (record: TRecord) => TStored
}): CrudRepository<TRecord> {
  const readAll = () => {
    const stored = readEnvelope<Array<TStored | TRecord>>(key)
    if (!stored) return fallback.map(toRecord)
    return uniqueById([...stored.map(toRecord), ...fallback.map(toRecord)])
  }

  const writeAll = (records: TRecord[]) => {
    writeEnvelope(
      key,
      records.map((record) => fromRecord(withVersion(record))),
    )
  }

  return {
    async list() {
      return readAll()
    },
    async get(id) {
      return readAll().find((record) => record.id === id) ?? null
    },
    async create(record) {
      const nextRecord = withVersion(record)
      const records = uniqueById([nextRecord, ...readAll()])
      writeAll(records)
      return nextRecord
    },
    async update(id, patch) {
      const records = readAll()
      const existing = records.find((record) => record.id === id)
      if (!existing) {
        throw new RepositoryError("not_found", "The requested record was not found.")
      }

      const nextRecord = withVersion({ ...existing, ...patch, id })
      writeAll(records.map((record) => (record.id === id ? nextRecord : record)))
      return nextRecord
    },
    async delete(id) {
      writeAll(readAll().filter((record) => record.id !== id))
    },
    async replaceAll(records) {
      const nextRecords = uniqueById(records.map(withVersion))
      writeAll(nextRecords)
      return nextRecords
    },
  }
}

function createSettingsRepository<TRecord extends { id?: string; dataVersion: number }>({
  key,
  fallback,
}: {
  key: string
  fallback: TRecord
}): CrudRepository<TRecord & { id: string }> {
  const withDefaultId = (record: TRecord): TRecord & { id: string } =>
    withVersion({ ...record, id: record.id ?? "default" }) as TRecord & { id: string }

  const readAll = () => {
    const stored = readEnvelope<Array<TRecord> | TRecord>(key)
    if (!stored) return [withDefaultId(fallback)]
    return Array.isArray(stored) ? stored.map(withDefaultId) : [withDefaultId(stored)]
  }

  const writeAll = (records: Array<TRecord & { id: string }>) => {
    writeEnvelope(key, records.map(withDefaultId))
  }

  return {
    async list() {
      return readAll()
    },
    async get(id) {
      return readAll().find((record) => record.id === id) ?? null
    },
    async create(record) {
      const nextRecord = withDefaultId(record)
      writeAll(uniqueById([nextRecord, ...readAll()]))
      return nextRecord
    },
    async update(id, patch) {
      const records = readAll()
      const existing = records.find((record) => record.id === id)
      if (!existing) {
        throw new RepositoryError("not_found", "The requested settings record was not found.")
      }

      const nextRecord = withDefaultId({ ...existing, ...patch, id })
      writeAll(records.map((record) => (record.id === id ? nextRecord : record)))
      return nextRecord
    },
    async delete(id) {
      writeAll(readAll().filter((record) => record.id !== id))
    },
    async replaceAll(records) {
      const nextRecords = uniqueById(records.map(withDefaultId))
      writeAll(nextRecords)
      return nextRecords
    },
  }
}

export function createLocalStorageRepositories(): DataRepositories {
  return {
    historyRepository: createCollectionRepository<HistoryRecord, HistoryStorageRecord>({
      key: STORAGE_KEYS.history,
      fallback: mockHistoryRecords,
      toRecord: toHistoryRecord,
      fromRecord: fromHistoryRecord,
    }),
    calendarRepository: createCollectionRepository<CalendarEvent, CalendarStorageRecord>({
      key: STORAGE_KEYS.calendar,
      fallback: mockCalendarEvents,
      toRecord: toCalendarEvent,
      fromRecord: fromCalendarEvent,
    }),
    settingsRepository: {
      brandSettings: createSettingsRepository<BrandSettings>({
        key: STORAGE_KEYS.brandSettings,
        fallback: mockBrandSettings,
      }),
      systemSettings: createSettingsRepository<SystemSettings>({
        key: STORAGE_KEYS.systemSettings,
        fallback: mockSystemSettings,
      }),
    },
    generatedContentRepository: createCollectionRepository<
      GeneratedContent,
      GeneratedContentStorageRecord
    >({
      key: STORAGE_KEYS.generatedContent,
      fallback: [],
      toRecord: toGeneratedContent,
      fromRecord: fromGeneratedContent,
    }),
    publishJobRepository: createCollectionRepository<PublishJob, PublishJobStorageRecord>({
      key: STORAGE_KEYS.publishJobs,
      fallback: [],
      toRecord: toPublishJob,
      fromRecord: fromPublishJob,
    }),
    platformAccountRepository: createCollectionRepository<
      PlatformAccount,
      PlatformAccountStorageRecord
    >({
      key: STORAGE_KEYS.platformAccounts,
      fallback: mockPlatformAccounts,
      toRecord: toPlatformAccount,
      fromRecord: fromPlatformAccount,
    }),
    analyticsRepository: createCollectionRepository<AnalyticsMetric, AnalyticsMetricStorageRecord>({
      key: STORAGE_KEYS.analyticsMetrics,
      fallback: mockAnalyticsMetrics,
      toRecord: toAnalyticsMetric,
      fromRecord: fromAnalyticsMetric,
    }),
  }
}

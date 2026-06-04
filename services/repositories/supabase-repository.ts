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

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
type JsonObject = { [key: string]: JsonValue }

interface SupabaseRow {
  id: string
  data: JsonObject
  data_version: number
}

interface SupabaseConfig {
  url: string
  key: string
}

interface SupabaseRepositoryOptions<TRecord extends { id: string; dataVersion: number }> {
  table: string
  fallback: TRecord[]
  toJson: (record: TRecord) => JsonObject
  fromJson: (data: JsonObject) => TRecord
}

function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new RepositoryError(
      "backend_unavailable",
      "Supabase is selected but NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are not configured.",
    )
  }

  return { url: url.replace(/\/$/, ""), key }
}

function withVersion<TRecord extends { dataVersion?: number }>(record: TRecord): TRecord {
  return {
    ...record,
    dataVersion: record.dataVersion ?? CURRENT_DATA_VERSION,
  }
}

function encodeFilterValue(value: string) {
  return encodeURIComponent(value)
}

function isMissingSupabaseTableError(error: unknown) {
  if (typeof error !== "object" || error === null) return false
  const errorLike = error as { code?: unknown; message?: unknown }
  const code = typeof errorLike.code === "string" ? errorLike.code : ""
  const message = typeof errorLike.message === "string" ? errorLike.message : ""
  return (
    (code === "network_error" || code === "not_found") &&
    (message.includes("PGRST205") || message.includes("Could not find the table"))
  )
}

async function requestSupabase<TResponse>({
  table,
  method,
  query = "",
  body,
}: {
  table: string
  method: "GET" | "POST" | "PATCH" | "DELETE"
  query?: string
  body?: unknown
}): Promise<TResponse> {
  const config = getSupabaseConfig()
  const response = await fetch(`${config.url}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new RepositoryError(
      response.status === 404 ? "not_found" : "network_error",
      message || `Supabase request failed with status ${response.status}.`,
    )
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}

function rowFromRecord<TRecord extends { id: string; dataVersion: number }>(
  record: TRecord,
  toJson: (record: TRecord) => JsonObject,
): SupabaseRow {
  return {
    id: record.id,
    data: toJson(withVersion(record)),
    data_version: record.dataVersion ?? CURRENT_DATA_VERSION,
  }
}

function createSupabaseCollectionRepository<TRecord extends { id: string; dataVersion: number }>({
  table,
  fallback,
  toJson,
  fromJson,
}: SupabaseRepositoryOptions<TRecord>): CrudRepository<TRecord> {
  return {
    async list() {
      let rows: SupabaseRow[]
      try {
        rows = await requestSupabase<SupabaseRow[]>({
          table,
          method: "GET",
          query: "?select=id,data,data_version&order=updated_at.desc",
        })
      } catch (error) {
        if (isMissingSupabaseTableError(error)) return fallback
        throw error
      }

      if (rows.length === 0) return fallback
      return rows.map((row) => fromJson({ ...row.data, dataVersion: row.data_version }))
    },
    async get(id) {
      let rows: SupabaseRow[]
      try {
        rows = await requestSupabase<SupabaseRow[]>({
          table,
          method: "GET",
          query: `?id=eq.${encodeFilterValue(id)}&select=id,data,data_version&limit=1`,
        })
      } catch (error) {
        if (isMissingSupabaseTableError(error)) {
          return fallback.find((record) => record.id === id) ?? null
        }
        throw error
      }

      const row = rows[0]
      return row ? fromJson({ ...row.data, dataVersion: row.data_version }) : null
    },
    async create(record) {
      const nextRecord = withVersion(record)
      const rows = await requestSupabase<SupabaseRow[]>({
        table,
        method: "POST",
        query: "?on_conflict=id",
        body: rowFromRecord(nextRecord, toJson),
      })

      const row = rows[0]
      return row ? fromJson({ ...row.data, dataVersion: row.data_version }) : nextRecord
    },
    async update(id, patch) {
      const existing = await this.get(id)
      if (!existing) {
        throw new RepositoryError("not_found", "The requested record was not found.")
      }

      return this.create(withVersion({ ...existing, ...patch, id }))
    },
    async delete(id) {
      await requestSupabase<void>({
        table,
        method: "DELETE",
        query: `?id=eq.${encodeFilterValue(id)}`,
      })
    },
    async replaceAll(records) {
      const nextRecords = records.map(withVersion)
      await requestSupabase<void>({
        table,
        method: "DELETE",
        query: "?id=not.is.null",
      })

      if (nextRecords.length === 0) return []

      const rows = await requestSupabase<SupabaseRow[]>({
        table,
        method: "POST",
        query: "?on_conflict=id",
        body: nextRecords.map((record) => rowFromRecord(record, toJson)),
      })

      return rows.map((row) => fromJson({ ...row.data, dataVersion: row.data_version }))
    },
  }
}

function createFallbackCollectionRepository<TRecord extends { id: string; dataVersion: number }>(
  fallback: TRecord[],
): CrudRepository<TRecord> {
  let records = [...fallback]

  return {
    async list() {
      return records
    },
    async get(id) {
      return records.find((record) => record.id === id) ?? null
    },
    async create(record) {
      records = [withVersion(record), ...records.filter((item) => item.id !== record.id)]
      return withVersion(record)
    },
    async update(id, patch) {
      const existing = records.find((record) => record.id === id)
      if (!existing) {
        throw new RepositoryError("not_found", "The requested record was not found.")
      }
      const nextRecord = withVersion({ ...existing, ...patch, id })
      records = records.map((record) => (record.id === id ? nextRecord : record))
      return nextRecord
    },
    async delete(id) {
      records = records.filter((record) => record.id !== id)
    },
    async replaceAll(nextRecords) {
      records = nextRecords.map(withVersion)
      return records
    },
  }
}

function dateFromJson(value: JsonValue | undefined, fallback = new Date()) {
  return typeof value === "string" ? new Date(value) : fallback
}

function stringFromJson(value: JsonValue | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function numberFromJson(value: JsonValue | undefined, fallback = CURRENT_DATA_VERSION) {
  return typeof value === "number" ? value : fallback
}

function toJsonObject<TRecord extends object>(record: TRecord): JsonObject {
  return JSON.parse(JSON.stringify(record)) as JsonObject
}

function historyFromJson(data: JsonObject): HistoryRecord {
  return {
    ...(data as unknown as Omit<HistoryRecord, "createdAt">),
    dataVersion: numberFromJson(data.dataVersion),
    createdAt: dateFromJson(data.createdAt),
  }
}

function calendarFromJson(data: JsonObject): CalendarEvent {
  return {
    ...(data as unknown as Omit<CalendarEvent, "scheduledAt">),
    dataVersion: numberFromJson(data.dataVersion),
    scheduledAt: dateFromJson(data.scheduledAt),
  }
}

function generatedContentFromJson(data: JsonObject): GeneratedContent {
  return {
    ...(data as unknown as Omit<GeneratedContent, "createdAt" | "updatedAt">),
    dataVersion: numberFromJson(data.dataVersion),
    createdAt: dateFromJson(data.createdAt),
    updatedAt: dateFromJson(data.updatedAt),
  }
}

function publishJobFromJson(data: JsonObject): PublishJob {
  return {
    ...(data as unknown as Omit<PublishJob, "scheduledAt" | "startedAt" | "completedAt">),
    dataVersion: numberFromJson(data.dataVersion),
    scheduledAt: dateFromJson(data.scheduledAt),
    startedAt: typeof data.startedAt === "string" ? new Date(data.startedAt) : undefined,
    completedAt: typeof data.completedAt === "string" ? new Date(data.completedAt) : undefined,
  }
}

function platformAccountFromJson(data: JsonObject): PlatformAccount {
  return {
    ...(data as unknown as Omit<PlatformAccount, "connectedAt" | "expiresAt">),
    id: stringFromJson(data.id),
    dataVersion: numberFromJson(data.dataVersion),
    connectedAt: typeof data.connectedAt === "string" ? new Date(data.connectedAt) : undefined,
    expiresAt: typeof data.expiresAt === "string" ? new Date(data.expiresAt) : undefined,
  }
}

export function createSupabaseRepositories(): DataRepositories {
  return {
    historyRepository: createSupabaseCollectionRepository<HistoryRecord>({
      table: "history_records",
      fallback: mockHistoryRecords,
      toJson: toJsonObject,
      fromJson: historyFromJson,
    }),
    calendarRepository: createSupabaseCollectionRepository<CalendarEvent>({
      table: "calendar_events",
      fallback: mockCalendarEvents,
      toJson: toJsonObject,
      fromJson: calendarFromJson,
    }),
    settingsRepository: {
      brandSettings: createSupabaseCollectionRepository<BrandSettings & { id: string }>({
        table: "brand_settings",
        fallback: [{ ...mockBrandSettings, id: mockBrandSettings.id ?? "default" }],
        toJson: toJsonObject,
        fromJson: (data) => ({
          ...(data as unknown as BrandSettings),
          id: stringFromJson(data.id, "default"),
          dataVersion: numberFromJson(data.dataVersion),
        }),
      }),
      systemSettings: createSupabaseCollectionRepository<SystemSettings & { id: string }>({
        table: "system_settings",
        fallback: [{ ...mockSystemSettings, id: mockSystemSettings.id ?? "default" }],
        toJson: toJsonObject,
        fromJson: (data) => ({
          ...(data as unknown as SystemSettings),
          id: stringFromJson(data.id, "default"),
          dataVersion: numberFromJson(data.dataVersion),
        }),
      }),
    },
    generatedContentRepository: createSupabaseCollectionRepository<GeneratedContent>({
      table: "generated_contents",
      fallback: [],
      toJson: toJsonObject,
      fromJson: generatedContentFromJson,
    }),
    publishJobRepository: createSupabaseCollectionRepository<PublishJob>({
      table: "publish_jobs",
      fallback: [],
      toJson: toJsonObject,
      fromJson: publishJobFromJson,
    }),
    platformAccountRepository: createSupabaseCollectionRepository<PlatformAccount>({
      table: "platform_accounts",
      fallback: mockPlatformAccounts,
      toJson: toJsonObject,
      fromJson: platformAccountFromJson,
    }),
    analyticsRepository: createFallbackCollectionRepository<AnalyticsMetric>(mockAnalyticsMetrics),
  }
}

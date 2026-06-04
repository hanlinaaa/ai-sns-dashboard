import type {
  BrandSettings,
  CalendarEvent,
  GeneratedContent,
  HistoryRecord,
  AnalyticsMetric,
  PlatformAccount,
  PublishJob,
  SystemSettings,
} from "@/domain/types"

export interface CrudRepository<TRecord extends { id: string }> {
  list(): Promise<TRecord[]>
  get(id: string): Promise<TRecord | null>
  create(record: TRecord): Promise<TRecord>
  update(id: string, patch: Partial<TRecord>): Promise<TRecord>
  delete(id: string): Promise<void>
  replaceAll(records: TRecord[]): Promise<TRecord[]>
}

export type HistoryRepository = CrudRepository<HistoryRecord>
export type CalendarRepository = CrudRepository<CalendarEvent>
export type GeneratedContentRepository = CrudRepository<GeneratedContent>
export type PublishJobRepository = CrudRepository<PublishJob>
export type PlatformAccountRepository = CrudRepository<PlatformAccount>
export type AnalyticsRepository = CrudRepository<AnalyticsMetric>
export type BrandSettingsRepository = CrudRepository<BrandSettings>
export type SystemSettingsRepository = CrudRepository<SystemSettings>

export interface SettingsRepository {
  brandSettings: BrandSettingsRepository
  systemSettings: SystemSettingsRepository
}

export interface DataRepositories {
  historyRepository: HistoryRepository
  calendarRepository: CalendarRepository
  settingsRepository: SettingsRepository
  generatedContentRepository: GeneratedContentRepository
  publishJobRepository: PublishJobRepository
  platformAccountRepository: PlatformAccountRepository
  analyticsRepository: AnalyticsRepository
}

export type RepositoryBackend = "localStorage" | "supabase"

"use client"

import type { DataRepositories, RepositoryBackend } from "@/services/repositories/contracts"
import { createLocalStorageRepositories } from "@/services/repositories/local-storage-repository"
import { createSupabaseRepositories } from "@/services/repositories/supabase-repository"

let cachedRepositories: DataRepositories | null = null

function getConfiguredBackend(): RepositoryBackend {
  return process.env.NEXT_PUBLIC_DATA_BACKEND === "supabase" ? "supabase" : "localStorage"
}

export function getRepositories(): DataRepositories {
  if (cachedRepositories) return cachedRepositories

  cachedRepositories =
    getConfiguredBackend() === "supabase"
      ? createSupabaseRepositories()
      : createLocalStorageRepositories()

  return cachedRepositories
}

export type {
  CalendarRepository,
  AnalyticsRepository,
  DataRepositories,
  GeneratedContentRepository,
  HistoryRepository,
  PlatformAccountRepository,
  PublishJobRepository,
  RepositoryBackend,
  SettingsRepository,
} from "@/services/repositories/contracts"

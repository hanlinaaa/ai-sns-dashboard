"use client"

import { useEffect, useMemo, useState } from "react"
import { History } from "lucide-react"
import { toast } from "sonner"
import { withCurrentDataVersion } from "@/domain/data-version"
import type { AsyncDataState } from "@/domain/data-state"
import { appLabels } from "@/domain/labels"
import type { BrandSettings, HistoryRecord, Platform, Status, Tone } from "@/domain/types"
import { canTransitionStatus } from "@/domain/workflow"
import { validateContent } from "@/domain/validation"
import { DataEmptyState, DataErrorState, DataLoadingState } from "@/components/ui/data-state"
import { HistoryFilters } from "@/features/history/components/history-filters"
import { HistoryTable } from "@/features/history/components/history-table"
import { Sidebar } from "@/features/navigation/sidebar"
import { getRepositories } from "@/services/repositories"
import { toDataAccessErrorInfo } from "@/services/repositories/errors"

const BRAND_SETTINGS_ID = "default"

function hasBlockingValidationIssues(input: {
  platform: Platform
  content: string
  brandSettings?: BrandSettings
}) {
  return validateContent(input).some((issue) => issue.severity === "error")
}

export default function HistoryPage() {
  const repositories = useMemo(() => getRepositories(), [])
  const [recordsState, setRecordsState] = useState<AsyncDataState<HistoryRecord[]>>({
    status: "loading",
    data: [],
    error: null,
  })
  const [brandSettings, setBrandSettings] = useState<BrandSettings | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all")
  const [toneFilter, setToneFilter] = useState<Tone | "all">("all")
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isMutating, setIsMutating] = useState(false)
  const records = recordsState.data

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setRecordsState((prev) => ({ ...prev, status: "loading", error: null }))
        const [nextRecords, nextBrandSettings] = await Promise.all([
          repositories.historyRepository.list(),
          repositories.settingsRepository.brandSettings.get(BRAND_SETTINGS_ID),
        ])
        setBrandSettings(nextBrandSettings ?? undefined)
        setRecordsState({ status: "success", data: nextRecords, error: null })
      } catch (error) {
        const errorInfo = toDataAccessErrorInfo(error, appLabels.historyLoadFailed)
        setRecordsState({ status: "error", data: [], error: errorInfo })
        toast.error(errorInfo.message)
      }
    }

    void loadPageData()
  }, [repositories])

  const persistRecords = async (nextRecords: HistoryRecord[], successMessage?: string) => {
    setIsMutating(true)
    try {
      const savedRecords = await repositories.historyRepository.replaceAll(nextRecords)
      setRecordsState({ status: "success", data: savedRecords, error: null })
      if (successMessage) toast.success(successMessage)
      return savedRecords
    } catch (error) {
      const errorInfo = toDataAccessErrorInfo(error, "Failed to save history records.")
      setRecordsState((prev) => ({ ...prev, status: "error", error: errorInfo }))
      toast.error(errorInfo.message)
      throw error
    } finally {
      setIsMutating(false)
    }
  }

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesContent = record.generatedContent.toLowerCase().includes(query)
        const matchesKeywords = record.keywords.toLowerCase().includes(query)
        const matchesAudience = record.targetAudience.toLowerCase().includes(query)
        if (!matchesContent && !matchesKeywords && !matchesAudience) return false
      }

      if (platformFilter !== "all" && record.platform !== platformFilter) return false
      if (toneFilter !== "all" && record.tone !== toneFilter) return false
      if (statusFilter !== "all" && record.status !== statusFilter) return false
      if (showFavoritesOnly && !record.isFavorite) return false
      if (dateRange.from && record.createdAt < dateRange.from) return false

      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to)
        endOfDay.setHours(23, 59, 59, 999)
        if (record.createdAt > endOfDay) return false
      }

      return true
    })
  }, [records, searchQuery, platformFilter, toneFilter, statusFilter, showFavoritesOnly, dateRange])

  const handleToggleFavorite = async (id: string) => {
    const nextRecords = records.map((record) =>
      record.id === id ? { ...record, isFavorite: !record.isFavorite } : record,
    )
    setRecordsState((prev) => ({ ...prev, data: nextRecords }))
    await persistRecords(nextRecords)
  }

  const handleUpdateStatus = async (id: string, status: Status) => {
    const existingRecord = records.find((record) => record.id === id)
    if (!existingRecord) {
      toast.error("The selected history record was not found.")
      return
    }

    if (!canTransitionStatus(existingRecord.status, status)) {
      toast.error(`Invalid status transition: ${existingRecord.status} -> ${status}`)
      return
    }

    if (
      (status === "scheduled" || status === "pendingApproval" || status === "published") &&
      hasBlockingValidationIssues({
        platform: existingRecord.platform,
        content: existingRecord.generatedContent,
        brandSettings,
      })
    ) {
      toast.error("Fix validation errors before moving this content forward.")
      return
    }

    const nextRecords = records.map((record) => (record.id === id ? { ...record, status } : record))
    setRecordsState((prev) => ({ ...prev, data: nextRecords }))
    await persistRecords(nextRecords, "Status updated.")
  }

  const handleUpdateContent = async (id: string, content: string) => {
    const existingRecord = records.find((record) => record.id === id)
    if (!existingRecord) {
      toast.error("The selected history record was not found.")
      return
    }

    if (
      hasBlockingValidationIssues({
        platform: existingRecord.platform,
        content,
        brandSettings,
      })
    ) {
      toast.error("Content has blocking validation errors.")
      return
    }

    const nextStatus: Status =
      existingRecord.status === "published" || existingRecord.status === "scheduled"
        ? "generated"
        : existingRecord.status
    const nextRecords = records.map((record) =>
      record.id === id ? { ...record, generatedContent: content, status: nextStatus } : record,
    )
    setRecordsState((prev) => ({ ...prev, data: nextRecords }))
    await persistRecords(nextRecords)
  }

  const handleDeleteRecords = async (ids: string[]) => {
    const nextRecords = records.filter((record) => !ids.includes(record.id))
    setRecordsState((prev) => ({ ...prev, data: nextRecords }))
    setSelectedIds(new Set())
    await persistRecords(nextRecords)
  }

  const handleFavoriteSelected = async (favorite: boolean) => {
    const nextRecords = records.map((record) =>
      selectedIds.has(record.id) ? { ...record, isFavorite: favorite } : record,
    )
    setRecordsState((prev) => ({ ...prev, data: nextRecords }))
    await persistRecords(nextRecords, favorite ? "Marked as favorite." : "Removed from favorites.")
  }

  const handleUpdateSelectedStatus = async (status: Status) => {
    const selectedRecords = records.filter((record) => selectedIds.has(record.id))
    const invalidTransition = selectedRecords.find(
      (record) => !canTransitionStatus(record.status, status),
    )

    if (invalidTransition) {
      toast.error(`Invalid status transition: ${invalidTransition.status} -> ${status}`)
      return
    }

    const requiresValidContent =
      status === "scheduled" || status === "pendingApproval" || status === "published"
    const invalidContent = selectedRecords.find((record) =>
      requiresValidContent
        ? hasBlockingValidationIssues({
            platform: record.platform,
            content: record.generatedContent,
            brandSettings,
          })
        : false,
    )

    if (invalidContent) {
      toast.error("Fix validation errors before moving selected content forward.")
      return
    }

    const nextRecords = records.map((record) =>
      selectedIds.has(record.id) ? { ...record, status } : record,
    )
    setRecordsState((prev) => ({ ...prev, data: nextRecords }))
    await persistRecords(nextRecords, "Selected statuses updated.")
  }

  const handleAddToCalendar = async (id: string) => {
    const record = records.find((item) => item.id === id)
    if (!record) {
      toast.error("The selected history record was not found.")
      return
    }

    if (!canTransitionStatus(record.status, "scheduled")) {
      toast.error(`Cannot schedule content from ${record.status}.`)
      return
    }

    if (
      hasBlockingValidationIssues({
        platform: record.platform,
        content: record.generatedContent,
        brandSettings,
      })
    ) {
      toast.error("Fix validation errors before adding this content to the calendar.")
      return
    }

    const scheduledAt = new Date()
    scheduledAt.setDate(scheduledAt.getDate() + 1)
    scheduledAt.setHours(12, 0, 0, 0)

    setIsMutating(true)
    try {
      await repositories.calendarRepository.create(
        withCurrentDataVersion({
          id: `evt-${Date.now()}-${record.id}`,
          title: record.keywords || "Scheduled history content",
          platform: record.platform,
          tone: record.tone,
          content: record.generatedContent,
          scheduledAt,
          status: "scheduled",
          historyId: record.id,
        }),
      )

      const nextRecords = records.map((item) =>
        item.id === id ? { ...item, status: "scheduled" as const } : item,
      )
      const savedRecords = await repositories.historyRepository.replaceAll(nextRecords)
      setRecordsState({ status: "success", data: savedRecords, error: null })
      toast.success("Added to calendar.")
    } catch (error) {
      const errorInfo = toDataAccessErrorInfo(error, "Failed to add content to calendar.")
      toast.error(errorInfo.message)
      throw error
    } finally {
      setIsMutating(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(filteredRecords.map((record) => record.id)) : new Set())
  }

  const handleSelectRecord = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const handleExport = (format: "csv" | "excel") => {
    try {
      const dataToExport =
        selectedIds.size > 0
          ? filteredRecords.filter((record) => selectedIds.has(record.id))
          : filteredRecords

      const headers = [
        "ID",
        "Platform",
        "Tone",
        "Target audience",
        "Keywords",
        "Content",
        "Created at",
        "Status",
        "Favorite",
      ]
      const rows = dataToExport.map((record) => [
        record.id,
        record.platform,
        record.tone,
        record.targetAudience,
        record.keywords,
        record.generatedContent,
        record.createdAt.toISOString(),
        record.status,
        record.isFavorite ? "Yes" : "No",
      ])

      if (format === "csv") {
        const escapeCsv = (value: string) => `"${value.replace(/"/g, '""').replace(/\n/g, "\\n")}"`
        const csvContent = [
          headers.join(","),
          ...rows.map((row) => row.map((value) => escapeCsv(String(value))).join(",")),
        ].join("\n")

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `history_export_${new Date().toISOString().split("T")[0]}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
        toast.success(appLabels.csvDownloaded)
        return
      }

      const htmlRows = [headers, ...rows]
        .map(
          (row) =>
            `<tr>${row
              .map(
                (value) =>
                  `<td>${String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>`,
              )
              .join("")}</tr>`,
        )
        .join("")
      const workbook = `<html><head><meta charset="utf-8" /></head><body><table>${htmlRows}</table></body></html>`
      const blob = new Blob(["\uFEFF" + workbook], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `history_export_${new Date().toISOString().split("T")[0]}.xls`
      link.click()
      URL.revokeObjectURL(link.href)
      toast.success(appLabels.excelDownloaded)
    } catch (error) {
      console.error("Failed to export history:", error)
      toast.error("Failed to export history records.")
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setPlatformFilter("all")
    setToneFilter("all")
    setStatusFilter("all")
    setShowFavoritesOnly(false)
    setDateRange({ from: undefined, to: undefined })
  }

  const hasActiveFilters =
    searchQuery ||
    platformFilter !== "all" ||
    toneFilter !== "all" ||
    statusFilter !== "all" ||
    showFavoritesOnly ||
    dateRange.from ||
    dateRange.to

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPath="/history" />
      <main className="ml-0 flex-1 p-6 lg:ml-64 lg:p-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Content History</h1>
              <p className="text-sm text-muted-foreground">
                Manage generated content as reusable assets across editing, approval, scheduling,
                and publishing.
              </p>
            </div>
          </div>
        </div>

        <HistoryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          platformFilter={platformFilter}
          onPlatformChange={setPlatformFilter}
          toneFilter={toneFilter}
          onToneChange={setToneFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          showFavoritesOnly={showFavoritesOnly}
          onFavoritesChange={setShowFavoritesOnly}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedCount={selectedIds.size}
          totalCount={filteredRecords.length}
          onExport={handleExport}
          onDeleteSelected={() => void handleDeleteRecords(Array.from(selectedIds))}
          onFavoriteSelected={(favorite) => void handleFavoriteSelected(favorite)}
          onUpdateSelectedStatus={(status) => void handleUpdateSelectedStatus(status)}
          hasActiveFilters={!!hasActiveFilters}
          onClearFilters={clearFilters}
        />

        {recordsState.status === "loading" ? (
          <DataLoadingState title="Loading history" description="Fetching saved content records." />
        ) : null}

        {recordsState.status === "error" ? (
          <DataErrorState
            title="History is unavailable"
            description="Failed to load saved history."
            error={recordsState.error}
          />
        ) : null}

        {recordsState.status === "success" && filteredRecords.length === 0 ? (
          <DataEmptyState
            title="No history records"
            description="Saved generated content appears here."
          />
        ) : null}

        {recordsState.status === "success" && filteredRecords.length > 0 ? (
          <HistoryTable
            records={filteredRecords}
            selectedIds={selectedIds}
            brandSettings={brandSettings}
            isMutating={isMutating}
            onSelectAll={handleSelectAll}
            onSelectRecord={handleSelectRecord}
            onToggleFavorite={handleToggleFavorite}
            onUpdateStatus={handleUpdateStatus}
            onUpdateContent={handleUpdateContent}
            onDelete={(id) => handleDeleteRecords([id])}
            onAddToCalendar={handleAddToCalendar}
          />
        ) : null}
      </main>
    </div>
  )
}

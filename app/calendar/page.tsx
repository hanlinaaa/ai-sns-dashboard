"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { addDays, addMonths, addWeeks, subDays, subMonths, subWeeks } from "date-fns"
import type { AsyncDataState } from "@/domain/data-state"
import type {
  BrandSettings,
  CalendarEvent,
  HistoryRecord,
  Platform,
  PublishJob,
  Status,
  SystemSettings,
} from "@/domain/types"
import { DataEmptyState, DataErrorState, DataLoadingState } from "@/components/ui/data-state"
import { CalendarHeader } from "@/features/calendar/components/calendar-header"
import { DayView } from "@/features/calendar/components/day-view"
import { EventDialog } from "@/features/calendar/components/event-dialog"
import { ListView } from "@/features/calendar/components/list-view"
import { MonthView } from "@/features/calendar/components/month-view"
import { WeekView } from "@/features/calendar/components/week-view"
import { Sidebar } from "@/features/navigation/sidebar"
import { getRepositories } from "@/services/repositories"
import { toDataAccessErrorInfo } from "@/services/repositories/errors"
import { createPublishingService } from "@/services/publishing"
import { createCopiedCalendarEvent, validateScheduleSave } from "@/services/schedule-service"

export type ViewType = "month" | "week" | "day" | "list"

const BRAND_SETTINGS_ID = "default"
const SYSTEM_SETTINGS_ID = "default"

function issueSummary(prefix: string, count: number) {
  return count === 1 ? `${prefix}: 1 issue.` : `${prefix}: ${count} issues.`
}

export default function CalendarPage() {
  const repositories = useMemo(() => getRepositories(), [])
  const publishingService = useMemo(() => createPublishingService(repositories), [repositories])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>("month")
  const [eventsState, setEventsState] = useState<AsyncDataState<CalendarEvent[]>>({
    status: "loading",
    data: [],
    error: null,
  })
  const [brandSettings, setBrandSettings] = useState<BrandSettings | undefined>()
  const [systemSettings, setSystemSettings] = useState<SystemSettings | undefined>()
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([])
  const [publishJobs, setPublishJobs] = useState<PublishJob[]>([])
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all")
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isMutating, setIsMutating] = useState(false)

  const events = eventsState.data

  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        setEventsState((prev) => ({ ...prev, status: "loading", error: null }))
        const [
          nextEvents,
          nextBrandSettings,
          nextSystemSettings,
          nextHistoryRecords,
          nextPublishJobs,
        ] = await Promise.all([
          repositories.calendarRepository.list(),
          repositories.settingsRepository.brandSettings.get(BRAND_SETTINGS_ID),
          repositories.settingsRepository.systemSettings.get(SYSTEM_SETTINGS_ID),
          repositories.historyRepository.list(),
          repositories.publishJobRepository.list(),
        ])
        setBrandSettings(nextBrandSettings ?? undefined)
        setSystemSettings(nextSystemSettings ?? undefined)
        setHistoryRecords(nextHistoryRecords)
        setPublishJobs(nextPublishJobs)
        setEventsState({ status: "success", data: nextEvents, error: null })

        const eventsMissingPublishJobs = nextEvents.filter(
          (event) => event.status === "scheduled" && !event.publishJobId,
        )
        if (eventsMissingPublishJobs.length > 0) {
          try {
            await Promise.all(
              eventsMissingPublishJobs.map((event) =>
                publishingService.createJobFromCalendarEvent({
                  event,
                  brandSettings: nextBrandSettings ?? undefined,
                  runImmediately: event.scheduledAt.getTime() <= Date.now(),
                }),
              ),
            )
            const [reconciledEvents, reconciledHistoryRecords, reconciledPublishJobs] =
              await Promise.all([
                repositories.calendarRepository.list(),
                repositories.historyRepository.list(),
                repositories.publishJobRepository.list(),
              ])
            setEventsState({ status: "success", data: reconciledEvents, error: null })
            setHistoryRecords(reconciledHistoryRecords)
            setPublishJobs(reconciledPublishJobs)
          } catch (error) {
            const errorInfo = toDataAccessErrorInfo(error, "Failed to reconcile publish jobs.")
            toast.error(errorInfo.message)
          }
        }
      } catch (error) {
        const errorInfo = toDataAccessErrorInfo(error, "Failed to load calendar events.")
        setEventsState({ status: "error", data: [], error: errorInfo })
        toast.error(errorInfo.message)
      }
    }

    void loadCalendarData()
  }, [publishingService, repositories])

  const persistEvents = async (nextEvents: CalendarEvent[], successMessage?: string) => {
    setIsMutating(true)
    try {
      const savedEvents = await repositories.calendarRepository.replaceAll(nextEvents)
      setEventsState({ status: "success", data: savedEvents, error: null })
      if (successMessage) toast.success(successMessage)
      return savedEvents
    } catch (error) {
      const errorInfo = toDataAccessErrorInfo(error, "Failed to save calendar events.")
      setEventsState((prev) => ({ ...prev, status: "error", error: errorInfo }))
      toast.error(errorInfo.message)
      throw error
    } finally {
      setIsMutating(false)
    }
  }

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (platformFilter !== "all" && event.platform !== platformFilter) return false
      if (statusFilter !== "all" && event.status !== statusFilter) return false
      return true
    })
  }, [events, platformFilter, statusFilter])

  const handlePrevious = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1))
    if (view === "week") setCurrentDate(subWeeks(currentDate, 1))
    if (view === "day" || view === "list") setCurrentDate(subDays(currentDate, 1))
  }

  const handleNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1))
    if (view === "week") setCurrentDate(addWeeks(currentDate, 1))
    if (view === "day" || view === "list") setCurrentDate(addDays(currentDate, 1))
  }

  const handleToday = () => setCurrentDate(new Date())

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setSelectedDate(null)
    setIsDialogOpen(true)
  }

  const handleDateClick = (date: Date) => {
    setSelectedEvent(null)
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  const refreshCalendarDependencies = async () => {
    try {
      const [nextEvents, nextHistoryRecords, nextPublishJobs] = await Promise.all([
        repositories.calendarRepository.list(),
        repositories.historyRepository.list(),
        repositories.publishJobRepository.list(),
      ])
      setEventsState({ status: "success", data: nextEvents, error: null })
      setHistoryRecords(nextHistoryRecords)
      setPublishJobs(nextPublishJobs)
      return nextEvents
    } catch (error) {
      const errorInfo = toDataAccessErrorInfo(error, "Failed to refresh publishing data.")
      toast.error(errorInfo.message)
      throw error
    }
  }

  const queuePublishJobForEvent = async (event: CalendarEvent) => {
    if (event.status !== "scheduled") return

    const result = await publishingService.createJobFromCalendarEvent({
      event,
      brandSettings,
      runImmediately: event.scheduledAt.getTime() <= Date.now(),
    })

    if (result.ok) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }

    await refreshCalendarDependencies()
  }

  const saveEventThroughService = async (event: CalendarEvent) => {
    const previousEvent = events.find((item) => item.id === event.id) ?? null
    const result = validateScheduleSave({
      event,
      existingEvents: events,
      previousEvent,
      brandSettings,
      systemSettings,
    })

    if (result.blockingIssues.length > 0) {
      toast.error(issueSummary("Schedule blocked", result.blockingIssues.length), {
        description: result.blockingIssues[0].message,
      })
      return false
    }

    const nextEvents = previousEvent
      ? events.map((item) => (item.id === result.event.id ? result.event : item))
      : [...events, result.event]

    setEventsState((prev) => ({ ...prev, data: nextEvents }))
    const savedEvents = await persistEvents(nextEvents, "Schedule saved.")
    const savedEvent = savedEvents.find((item) => item.id === result.event.id) ?? result.event

    if (result.warningIssues.length > 0) {
      toast.warning(issueSummary("Schedule saved with warnings", result.warningIssues.length), {
        description: result.warningIssues[0].message,
      })
    }

    await queuePublishJobForEvent(savedEvent)

    return true
  }

  const handleEventDrop = (eventId: string, newDate: Date) => {
    const event = events.find((item) => item.id === eventId)
    if (!event) return

    const updatedDate = new Date(newDate)
    updatedDate.setHours(event.scheduledAt.getHours(), event.scheduledAt.getMinutes(), 0, 0)

    void saveEventThroughService({
      ...event,
      scheduledAt: updatedDate,
    })
  }

  const handleSaveEvent = async (savedEvent: CalendarEvent) => {
    const saved = await saveEventThroughService(savedEvent)
    if (saved) setIsDialogOpen(false)
  }

  const handleDeleteEvent = async (eventId: string) => {
    const nextEvents = events.filter((event) => event.id !== eventId)
    setEventsState((prev) => ({ ...prev, data: nextEvents }))
    await persistEvents(nextEvents, "Schedule deleted.")
    setIsDialogOpen(false)
  }

  const handleCopyEvent = async (event: CalendarEvent) => {
    const copiedEvent = createCopiedCalendarEvent(event)
    await saveEventThroughService(copiedEvent)
  }

  const handleRetryPublishJob = async (jobId: string) => {
    setIsMutating(true)
    try {
      const result = await publishingService.retryJob(jobId, brandSettings)
      if (result.ok) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
      await refreshCalendarDependencies()
    } catch (error) {
      const errorInfo = toDataAccessErrorInfo(error, "Failed to retry publish job.")
      toast.error(errorInfo.message)
    } finally {
      setIsMutating(false)
    }
  }

  const handleCancelPublishJob = async (jobId: string) => {
    setIsMutating(true)
    try {
      const result = await publishingService.cancelJob(jobId)
      if (result.ok) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
      const nextJobs = await repositories.publishJobRepository.list()
      setPublishJobs(nextJobs)
    } catch (error) {
      const errorInfo = toDataAccessErrorInfo(error, "Failed to cancel publish job.")
      toast.error(errorInfo.message)
    } finally {
      setIsMutating(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar currentPath="/calendar" />
      <main className="ml-0 flex h-screen flex-1 flex-col overflow-hidden px-4 py-5 sm:px-6 lg:ml-64 lg:px-8">
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
          platformFilter={platformFilter}
          onPlatformFilterChange={setPlatformFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onNewEvent={() => handleDateClick(new Date())}
          events={filteredEvents}
        />

        <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
          {eventsState.status === "loading" ? (
            <DataLoadingState title="Loading calendar" description="Fetching scheduled posts." />
          ) : null}

          {eventsState.status === "error" ? (
            <DataErrorState
              title="Calendar is unavailable"
              description="Failed to load calendar events."
              error={eventsState.error}
            />
          ) : null}

          {eventsState.status === "success" && filteredEvents.length === 0 ? (
            <DataEmptyState
              title="No calendar events"
              description="Scheduled content appears on the calendar."
            />
          ) : null}

          {eventsState.status === "success" && view === "month" && filteredEvents.length > 0 ? (
            <MonthView
              currentDate={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onEventDrop={handleEventDrop}
            />
          ) : null}

          {eventsState.status === "success" && view === "week" && filteredEvents.length > 0 ? (
            <WeekView
              currentDate={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onEventDrop={handleEventDrop}
            />
          ) : null}

          {eventsState.status === "success" && view === "day" && filteredEvents.length > 0 ? (
            <DayView
              currentDate={currentDate}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onEventDrop={handleEventDrop}
            />
          ) : null}

          {eventsState.status === "success" && view === "list" && filteredEvents.length > 0 ? (
            <ListView
              events={filteredEvents}
              publishJobs={publishJobs}
              onEventClick={handleEventClick}
              onCopyEvent={handleCopyEvent}
              onRetryPublishJob={(jobId) => void handleRetryPublishJob(jobId)}
              onCancelPublishJob={(jobId) => void handleCancelPublishJob(jobId)}
              isMutating={isMutating}
            />
          ) : null}
        </div>
      </main>

      <EventDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        event={selectedEvent}
        initialDate={selectedDate}
        historyRecords={historyRecords}
        brandSettings={brandSettings}
        systemSettings={systemSettings}
        onSave={(event) => void handleSaveEvent(event)}
        onDelete={(eventId) => void handleDeleteEvent(eventId)}
        onCopy={selectedEvent ? () => void handleCopyEvent(selectedEvent) : undefined}
        isSaving={isMutating}
      />
    </div>
  )
}

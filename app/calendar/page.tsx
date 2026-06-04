"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { CalendarHeader } from "@/components/calendar/calendar-header"
import { MonthView } from "@/components/calendar/month-view"
import { WeekView } from "@/components/calendar/week-view"
import { DayView } from "@/components/calendar/day-view"
import { EventDialog } from "@/components/calendar/event-dialog"
import { mockCalendarEvents, CalendarEvent } from "@/lib/calendar-mock"
import { Platform, Status } from "@/lib/types"
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, isSameDay } from "date-fns"
import { toast } from "sonner"

export type ViewType = "month" | "week" | "day"

const calendarStorageKey = "sns-dashboard-calendar-events"

type StoredCalendarEvent = Omit<CalendarEvent, "scheduledAt"> & {
  scheduledAt: string
}

function serializeEvents(events: CalendarEvent[]): StoredCalendarEvent[] {
  return events.map((event) => ({
    ...event,
    scheduledAt: event.scheduledAt.toISOString(),
  }))
}

function hydrateEvents(events: StoredCalendarEvent[]): CalendarEvent[] {
  return events.map((event) => ({
    ...event,
    scheduledAt: new Date(event.scheduledAt),
  }))
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewType>("month")
  const [events, setEvents] = useState<CalendarEvent[]>(mockCalendarEvents)
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Filters
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all")
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all")

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(calendarStorageKey)
      if (raw) {
        setEvents(hydrateEvents(JSON.parse(raw) as StoredCalendarEvent[]))
      }
    } catch {
      toast.error("保存済み排期の読み込みに失敗しました")
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    window.localStorage.setItem(calendarStorageKey, JSON.stringify(serializeEvents(events)))
  }, [events, isHydrated])

  // Filtering
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (platformFilter !== "all" && event.platform !== platformFilter) return false
      if (statusFilter !== "all" && event.status !== statusFilter) return false
      return true
    })
  }, [events, platformFilter, statusFilter])

  // Navigation
  const handlePrevious = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1))
    if (view === "week") setCurrentDate(subWeeks(currentDate, 1))
    if (view === "day") setCurrentDate(subDays(currentDate, 1))
  }

  const handleNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1))
    if (view === "week") setCurrentDate(addWeeks(currentDate, 1))
    if (view === "day") setCurrentDate(addDays(currentDate, 1))
  }

  const handleToday = () => setCurrentDate(new Date())

  // Event handlers
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

  const handleEventDrop = (eventId: string, newDate: Date) => {
    setEvents(prev => {
      const eventIndex = prev.findIndex(e => e.id === eventId)
      if (eventIndex === -1) return prev

      const event = prev[eventIndex]
      // Keep original hours/minutes, just change the date
      const updatedDate = new Date(newDate)
      updatedDate.setHours(event.scheduledAt.getHours())
      updatedDate.setMinutes(event.scheduledAt.getMinutes())

      // Conflict detection
      const conflicts = prev.filter(e => 
        e.id !== eventId && 
        e.platform === event.platform && 
        isSameDay(e.scheduledAt, updatedDate) &&
        Math.abs(e.scheduledAt.getTime() - updatedDate.getTime()) < 10 * 60 * 1000 // 10 mins
      )

      if (conflicts.length > 0) {
        toast.warning(`注意: ${conflicts.length}件の同プラットフォームの投稿と時間が近接しています（10分以内）`)
      } else {
        toast.success("排期を更新しました")
      }

      const newEvents = [...prev]
      newEvents[eventIndex] = { ...event, scheduledAt: updatedDate }
      return newEvents
    })
  }

  const handleSaveEvent = (savedEvent: CalendarEvent) => {
    setEvents(prev => {
      const existing = prev.findIndex(e => e.id === savedEvent.id)
      if (existing >= 0) {
        const newEvents = [...prev]
        newEvents[existing] = savedEvent
        return newEvents
      }
      return [...prev, savedEvent]
    })
    setIsDialogOpen(false)
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId))
    setIsDialogOpen(false)
    toast.success("排期を削除しました")
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar currentPath="/calendar" />
      <main className="flex-1 ml-0 lg:ml-64 flex h-screen flex-col overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
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
          {view === "month" && (
            <MonthView 
              currentDate={currentDate} 
              events={filteredEvents} 
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onEventDrop={handleEventDrop}
            />
          )}
          {view === "week" && (
            <WeekView 
              currentDate={currentDate} 
              events={filteredEvents} 
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onEventDrop={handleEventDrop}
            />
          )}
          {view === "day" && (
            <DayView 
              currentDate={currentDate} 
              events={filteredEvents} 
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              onEventDrop={handleEventDrop}
            />
          )}
        </div>
      </main>

      <EventDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        event={selectedEvent}
        initialDate={selectedDate}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  )
}

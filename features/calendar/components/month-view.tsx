"use client"

import { useMemo } from "react"
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { cn } from "@/components/ui/utils"
import type { CalendarEvent } from "@/domain/types"
import { InstagramIcon, LineIcon, XIcon } from "@/features/platform/platform-icons"

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDateClick: (date: Date) => void
  onEventDrop: (eventId: string, date: Date) => void
}

const platformColors = {
  x: "bg-slate-900 text-white border-slate-900",
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-pink-500",
  line: "bg-[#06C755] text-white border-[#06C755]",
}

const platformIcons = {
  x: XIcon,
  instagram: InstagramIcon,
  line: LineIcon,
}

export function MonthView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  onEventDrop,
}: MonthViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const handleDragStart = (event: React.DragEvent, eventId: string) => {
    event.dataTransfer.setData("eventId", eventId)
    event.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (event: React.DragEvent, date: Date) => {
    event.preventDefault()
    const eventId = event.dataTransfer.getData("eventId")
    if (eventId) {
      onEventDrop(eventId, date)
    }
  }

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="grid grid-cols-7 border-b bg-muted/35">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2.5 text-center text-xs font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-5 auto-rows-[minmax(108px,1fr)]">
        {days.map((day, index) => {
          const dayEvents = events
            .filter((event) => isSameDay(event.scheduledAt, day))
            .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
          const isCurrentMonth = isSameMonth(day, currentDate)

          return (
            <div
              key={day.toString()}
              className={cn(
                "flex min-h-[108px] flex-col gap-1 border-b border-r p-2 transition-colors hover:bg-muted/30",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                index % 7 === 0 && "border-l-0",
              )}
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(event, day)}
              onClick={() => onDateClick(day)}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    isToday(day) ? "bg-primary text-primary-foreground" : "",
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto pr-1">
                {dayEvents.map((calendarEvent) => {
                  const Icon = platformIcons[calendarEvent.platform]

                  return (
                    <div
                      key={calendarEvent.id}
                      draggable
                      onDragStart={(event) => {
                        event.stopPropagation()
                        handleDragStart(event, calendarEvent.id)
                      }}
                      onClick={(event) => {
                        event.stopPropagation()
                        onEventClick(calendarEvent)
                      }}
                      className={cn(
                        "cursor-grab truncate rounded-md border px-2 py-1.5 text-xs shadow-xs transition-all active:cursor-grabbing",
                        calendarEvent.status === "draft" &&
                          "border-dashed bg-muted/50 text-muted-foreground",
                        calendarEvent.status === "failed" &&
                          "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
                        (calendarEvent.status === "scheduled" ||
                          calendarEvent.status === "published") &&
                          platformColors[calendarEvent.platform],
                        calendarEvent.status === "published" && "opacity-60",
                        "hover:-translate-y-px hover:opacity-90",
                      )}
                    >
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <Icon className="h-3 w-3 shrink-0" />
                        <span className="truncate font-semibold">
                          {format(calendarEvent.scheduledAt, "HH:mm")}
                        </span>
                        {calendarEvent.status === "published" ? (
                          <span className="ml-auto text-[10px]">Done</span>
                        ) : null}
                      </div>
                      <div className="truncate">{calendarEvent.title}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

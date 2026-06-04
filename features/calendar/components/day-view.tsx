"use client"

import { useMemo } from "react"
import { format, isSameDay } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/components/ui/utils"
import type { CalendarEvent } from "@/domain/types"
import { InstagramIcon, LineIcon, XIcon } from "@/features/platform/platform-icons"

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDateClick: (date: Date) => void
  onEventDrop: (eventId: string, date: Date) => void
}

const platformIcons = {
  x: XIcon,
  instagram: InstagramIcon,
  line: LineIcon,
}

export function DayView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  onEventDrop,
}: DayViewProps) {
  const dayEvents = useMemo(() => {
    return events
      .filter((event) => isSameDay(event.scheduledAt, currentDate))
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
  }, [currentDate, events])

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const eventId = event.dataTransfer.getData("eventId")
    if (eventId) {
      onEventDrop(eventId, currentDate)
    }
  }

  return (
    <div
      className="flex h-full flex-col bg-card"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onDateClick(currentDate)}
    >
      <div className="border-b bg-muted/20 p-4">
        <h2 className="text-xl font-semibold">{format(currentDate, "EEEE, MMMM d, yyyy")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {dayEvents.length === 1 ? "1 scheduled item" : `${dayEvents.length} scheduled items`}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {dayEvents.length === 0 ? (
          <div className="flex h-[240px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 text-muted-foreground">
            <p>No scheduled content for this day</p>
            <p className="mt-2 text-sm">Click the empty area to create a new schedule</p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-3">
            {dayEvents.map((calendarEvent) => {
              const Icon = platformIcons[calendarEvent.platform]

              return (
                <div
                  key={calendarEvent.id}
                  onClick={(event) => {
                    event.stopPropagation()
                    onEventClick(calendarEvent)
                  }}
                  className={cn(
                    "flex cursor-pointer gap-4 rounded-lg border bg-card p-4 shadow-xs transition-all hover:-translate-y-px hover:shadow-sm",
                    calendarEvent.status === "draft" && "border-dashed bg-muted/20",
                    calendarEvent.status === "failed" &&
                      "border-red-500 bg-red-50 dark:bg-red-950/20",
                  )}
                >
                  <div className="flex w-20 shrink-0 flex-col items-center justify-center border-r pr-4">
                    <span className="text-lg font-bold">
                      {format(calendarEvent.scheduledAt, "HH:mm")}
                    </span>
                    {calendarEvent.status === "published" ? (
                      <Badge
                        variant="outline"
                        className="mt-1 border-green-600 text-[10px] text-green-600"
                      >
                        Published
                      </Badge>
                    ) : null}
                    {calendarEvent.status === "draft" ? (
                      <Badge variant="outline" className="mt-1 text-[10px] text-muted-foreground">
                        Draft
                      </Badge>
                    ) : null}
                    {calendarEvent.status === "failed" ? (
                      <Badge variant="destructive" className="mt-1 text-[10px]">
                        Failed
                      </Badge>
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-md text-white",
                          calendarEvent.platform === "x" && "bg-slate-900",
                          calendarEvent.platform === "instagram" &&
                            "bg-gradient-to-r from-purple-500 to-pink-500",
                          calendarEvent.platform === "line" && "bg-[#06C755]",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="truncate text-base font-semibold">{calendarEvent.title}</h3>
                      <Badge variant="secondary" className="ml-auto">
                        {calendarEvent.tone}
                      </Badge>
                    </div>
                    <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
                      {calendarEvent.content}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

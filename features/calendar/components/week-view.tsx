"use client"

import { useMemo } from "react"
import { eachDayOfInterval, endOfWeek, format, isSameDay, isToday, startOfWeek } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/components/ui/utils"
import type { CalendarEvent } from "@/domain/types"
import { InstagramIcon, LineIcon, XIcon } from "@/features/platform/platform-icons"

interface WeekViewProps {
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

const platformColors = {
  x: "bg-slate-900 text-white border-slate-900",
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-pink-500",
  line: "bg-[#06C755] text-white border-[#06C755]",
}

export function WeekView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  onEventDrop,
}: WeekViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 })
    const end = endOfWeek(currentDate, { weekStartsOn: 0 })
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
    <div className="flex h-full overflow-hidden bg-card">
      <div className="flex w-full divide-x">
        {days.map((day) => {
          const dayEvents = events
            .filter((event) => isSameDay(event.scheduledAt, day))
            .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())

          return (
            <div
              key={day.toString()}
              className="flex min-w-[150px] flex-1 flex-col bg-card"
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(event, day)}
            >
              <div
                className={cn(
                  "cursor-pointer border-b bg-muted/20 p-3 text-center transition-colors hover:bg-muted/50",
                  isToday(day) && "bg-primary/5",
                )}
                onClick={() => onDateClick(day)}
              >
                <div className="mb-1 text-xs text-muted-foreground">{format(day, "EEE")}</div>
                <div
                  className={cn(
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold",
                    isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground",
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>

              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
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
                          "cursor-grab rounded-md border p-3 text-sm shadow-xs transition-all active:cursor-grabbing",
                          calendarEvent.status === "draft" && "border-dashed bg-muted/50",
                          calendarEvent.status === "failed" &&
                            "border-red-500 bg-red-50 dark:bg-red-950",
                          (calendarEvent.status === "scheduled" ||
                            calendarEvent.status === "published") &&
                            platformColors[calendarEvent.platform],
                          calendarEvent.status === "published" && "opacity-60",
                          "hover:-translate-y-px hover:shadow-sm",
                        )}
                      >
                        <div className="mb-1.5 flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="font-bold">
                            {format(calendarEvent.scheduledAt, "HH:mm")}
                          </span>
                          {calendarEvent.status === "published" ? (
                            <Badge
                              variant="secondary"
                              className="ml-auto h-4 bg-white/20 px-1 py-0 text-[10px]"
                            >
                              Done
                            </Badge>
                          ) : null}
                        </div>
                        <div className="mb-1 truncate font-medium">{calendarEvent.title}</div>
                        <div className="line-clamp-2 text-xs opacity-80">
                          {calendarEvent.content}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          )
        })}
      </div>
    </div>
  )
}

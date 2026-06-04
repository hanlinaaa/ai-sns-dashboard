"use client"

import { useMemo } from "react"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/components/ui/utils"
import type { CalendarEvent } from "@/domain/types"
import { XIcon, InstagramIcon, LineIcon } from "@/features/platform/platform-icons"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

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

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData("eventId", eventId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    const eventId = e.dataTransfer.getData("eventId")
    if (eventId) {
      onEventDrop(eventId, date)
    }
  }

  return (
    <div className="flex h-full overflow-hidden bg-card">
      <div className="flex w-full divide-x">
        {days.map((day) => {
          const dayEvents = events
            .filter((e) => isSameDay(e.scheduledAt, day))
            .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())

          return (
            <div
              key={day.toString()}
              className="flex min-w-[150px] flex-1 flex-col bg-card"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
            >
              {/* Header */}
              <div
                className={cn(
                  "cursor-pointer border-b bg-muted/20 p-3 text-center transition-colors hover:bg-muted/50",
                  isToday(day) && "bg-primary/5",
                )}
                onClick={() => onDateClick(day)}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {format(day, "E", { locale: ja })}
                </div>
                <div
                  className={cn(
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold",
                    isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground",
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>

              {/* Events */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {dayEvents.map((event) => {
                    const Icon = platformIcons[event.platform]

                    return (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation()
                          handleDragStart(e, event.id)
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(event)
                        }}
                        className={cn(
                          "cursor-grab rounded-md border p-3 text-sm shadow-xs transition-all active:cursor-grabbing",
                          event.status === "draft" && "border-dashed bg-muted/50",
                          event.status === "failed" && "border-red-500 bg-red-50 dark:bg-red-950",
                          (event.status === "scheduled" || event.status === "published") &&
                            platformColors[event.platform],
                          event.status === "published" && "opacity-60",
                          "hover:-translate-y-px hover:shadow-sm",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="font-bold">{format(event.scheduledAt, "HH:mm")}</span>
                          {event.status === "published" && (
                            <Badge
                              variant="secondary"
                              className="ml-auto text-[10px] px-1 py-0 h-4 bg-white/20"
                            >
                              済
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium truncate mb-1">{event.title}</div>
                        <div className="text-xs opacity-80 line-clamp-2">{event.content}</div>
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

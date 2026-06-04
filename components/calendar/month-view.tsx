"use client"

import { useMemo } from "react"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, isToday } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CalendarEvent } from "@/lib/calendar-mock"
import { XIcon, InstagramIcon, LineIcon } from "@/components/dashboard/platform-icons"
import { Badge } from "@/components/ui/badge"

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

export function MonthView({ currentDate, events, onEventClick, onDateClick, onEventDrop }: MonthViewProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 })
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
    <div className="flex h-full flex-col bg-card">
      <div className="grid grid-cols-7 border-b bg-muted/35">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day} className="py-2.5 text-center text-xs font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-5 auto-rows-[minmax(108px,1fr)]">
        {days.map((day, i) => {
          const dayEvents = events.filter((e) => isSameDay(e.scheduledAt, day)).sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
          const isCurrentMonth = isSameMonth(day, currentDate)

          return (
            <div
              key={day.toString()}
              className={cn(
                "flex min-h-[108px] flex-col gap-1 border-r border-b p-2 transition-colors hover:bg-muted/30",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                i % 7 === 0 && "border-l-0" // remove left border for sunday
              )}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
              onClick={() => onDateClick(day)}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                  isToday(day) ? "bg-primary text-primary-foreground" : ""
                )}>
                  {format(day, "d")}
                </span>
              </div>
              <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto pr-1">
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
                        "cursor-grab truncate rounded-md border px-2 py-1.5 text-xs shadow-xs transition-all active:cursor-grabbing",
                        event.status === "draft" && "border-dashed bg-muted/50 text-muted-foreground",
                        event.status === "failed" && "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
                        (event.status === "scheduled" || event.status === "published") && platformColors[event.platform],
                        event.status === "published" && "opacity-60",
                        "hover:-translate-y-px hover:opacity-90"
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon className="w-3 h-3 shrink-0" />
                        <span className="font-semibold truncate">{format(event.scheduledAt, "HH:mm")}</span>
                        {event.status === "published" && (
                          <span className="ml-auto text-[10px]">✓</span>
                        )}
                      </div>
                      <div className="truncate">{event.title}</div>
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

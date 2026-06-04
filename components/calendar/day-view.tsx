"use client"

import { useMemo } from "react"
import { format, isSameDay } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CalendarEvent } from "@/lib/calendar-mock"
import { XIcon, InstagramIcon, LineIcon } from "@/components/dashboard/platform-icons"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

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

export function DayView({ currentDate, events, onEventClick, onDateClick, onEventDrop }: DayViewProps) {
  const dayEvents = useMemo(() => {
    return events.filter((e) => isSameDay(e.scheduledAt, currentDate)).sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
  }, [currentDate, events])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const eventId = e.dataTransfer.getData("eventId")
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
        <h2 className="text-xl font-semibold">{format(currentDate, "yyyy年M月d日 (E)", { locale: ja })}</h2>
        <p className="text-muted-foreground text-sm mt-1">{dayEvents.length}件の排期があります</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {dayEvents.length === 0 ? (
          <div className="flex h-[240px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 text-muted-foreground">
            <p>この日の排期はありません</p>
            <p className="text-sm mt-2">クリックして新規作成</p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-3">
            {dayEvents.map((event) => {
              const Icon = platformIcons[event.platform]
              
              return (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventClick(event)
                  }}
                  className={cn(
                    "flex cursor-pointer gap-4 rounded-lg border bg-card p-4 shadow-xs transition-all hover:-translate-y-px hover:shadow-sm",
                    event.status === "draft" && "border-dashed bg-muted/20",
                    event.status === "failed" && "border-red-500 bg-red-50 dark:bg-red-950/20"
                  )}
                >
                  <div className="flex w-20 shrink-0 flex-col items-center justify-center border-r pr-4">
                    <span className="text-lg font-bold">{format(event.scheduledAt, "HH:mm")}</span>
                    {event.status === "published" && (
                      <Badge variant="outline" className="mt-1 text-[10px] text-green-600 border-green-600">公開済</Badge>
                    )}
                    {event.status === "draft" && (
                      <Badge variant="outline" className="mt-1 text-[10px] text-muted-foreground">下書き</Badge>
                    )}
                    {event.status === "failed" && (
                      <Badge variant="destructive" className="mt-1 text-[10px]">失敗</Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-md text-white",
                        event.platform === "x" && "bg-slate-900",
                        event.platform === "instagram" && "bg-gradient-to-r from-purple-500 to-pink-500",
                        event.platform === "line" && "bg-[#06C755]"
                      )}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-semibold text-base truncate">{event.title}</h3>
                      <Badge variant="secondary" className="ml-auto">{event.tone}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
                      {event.content}
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

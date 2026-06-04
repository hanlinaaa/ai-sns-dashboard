"use client"

import { format } from "date-fns"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CalendarEvent, Platform, Status } from "@/domain/types"
import type { ViewType } from "@/app/calendar/page"

interface CalendarHeaderProps {
  currentDate: Date
  view: ViewType
  onViewChange: (view: ViewType) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  platformFilter: Platform | "all"
  onPlatformFilterChange: (platform: Platform | "all") => void
  statusFilter: Status | "all"
  onStatusFilterChange: (status: Status | "all") => void
  onNewEvent: () => void
  events: CalendarEvent[]
}

const platformOptions: Array<{ value: Platform; label: string }> = [
  { value: "x", label: "X" },
  { value: "instagram", label: "Instagram" },
  { value: "line", label: "LINE" },
]

const statusOptions: Array<{ value: Status; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "generated", label: "Generated" },
  { value: "scheduled", label: "Scheduled" },
  { value: "pendingApproval", label: "Pending approval" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
]

const viewOptions: Array<{ value: ViewType; label: string }> = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
  { value: "list", label: "List" },
]

function getCalendarTitle(currentDate: Date, view: ViewType) {
  if (view === "month") return format(currentDate, "yyyy/MM")
  if (view === "week") return `Week of ${format(currentDate, "yyyy/MM/dd")}`
  if (view === "day") return format(currentDate, "yyyy/MM/dd")
  return "Schedule list"
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  platformFilter,
  onPlatformFilterChange,
  statusFilter,
  onStatusFilterChange,
  onNewEvent,
  events,
}: CalendarHeaderProps) {
  const handleExport = () => {
    try {
      const headers = ["ID", "Title", "Platform", "Tone", "Content", "Scheduled at", "Status"]
      const csvContent = [
        headers.join(","),
        ...events.map((event) =>
          [
            event.id,
            `"${event.title.replace(/"/g, '""')}"`,
            event.platform,
            event.tone,
            `"${event.content.replace(/"/g, '""').replace(/\n/g, "\\n")}"`,
            event.scheduledAt.toISOString(),
            event.status,
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `calendar_export_${format(new Date(), "yyyyMMdd")}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error("Failed to export calendar:", error)
    }
  }

  return (
    <div className="shrink-0 rounded-lg border bg-card/95 p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-foreground sm:text-2xl">
              Publishing Calendar
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage scheduled content before approval and publishing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-10 items-center rounded-md border bg-background px-1 shadow-xs">
            <Filter className="ml-2 mr-1 h-4 w-4 text-muted-foreground" />
            <Select
              value={platformFilter}
              onValueChange={(value) => onPlatformFilterChange(value as Platform | "all")}
            >
              <SelectTrigger className="h-8 w-[128px] border-0 bg-transparent text-xs shadow-none focus:ring-0">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All platforms</SelectItem>
                {platformOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mx-1 h-4 w-px bg-border" />
            <Select
              value={statusFilter}
              onValueChange={(value) => onStatusFilterChange(value as Status | "all")}
            >
              <SelectTrigger className="h-8 w-[150px] border-0 bg-transparent text-xs shadow-none focus:ring-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex h-10 items-center rounded-md bg-muted p-1">
            {viewOptions.map((option) => (
              <Button
                key={option.value}
                variant={view === option.value ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => onViewChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="flex h-10 items-center gap-1 rounded-md border bg-background p-1 shadow-xs">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-[140px] px-3 text-sm font-medium"
              onClick={onToday}
            >
              {getCalendarTitle(currentDate, view)}
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" className="h-10" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" className="h-10" onClick={onNewEvent}>
            <Plus className="mr-2 h-4 w-4" />
            New schedule
          </Button>
        </div>
      </div>
    </div>
  )
}

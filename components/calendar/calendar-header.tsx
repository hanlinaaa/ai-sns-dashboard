"use client"

import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Platform, Status, platformLabels, statusLabels } from "@/lib/types"
import { CalendarEvent } from "@/lib/calendar-mock"

interface CalendarHeaderProps {
  currentDate: Date
  view: "month" | "week" | "day"
  onViewChange: (view: "month" | "week" | "day") => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  platformFilter: Platform | "all"
  onPlatformFilterChange: (p: Platform | "all") => void
  statusFilter: Status | "all"
  onStatusFilterChange: (s: Status | "all") => void
  onNewEvent: () => void
  events: CalendarEvent[]
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
    const headers = ["ID", "タイトル", "プラットフォーム", "トーン", "内容", "予定日時", "ステータス"]
    const csvContent = [
      headers.join(","),
      ...events.map(e => [
        e.id,
        `"${e.title}"`,
        e.platform,
        e.tone,
        `"${e.content.replace(/"/g, '""').replace(/\n/g, "\\n")}"`,
        e.scheduledAt.toISOString(),
        e.status
      ].join(","))
    ].join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `calendar_export_${format(new Date(), "yyyyMMdd")}.csv`
    link.click()
  }

  const title = view === "month" 
    ? format(currentDate, "yyyy年 M月", { locale: ja })
    : view === "week"
      ? `${format(currentDate, "yyyy年 M月", { locale: ja })} 第${Math.ceil(currentDate.getDate() / 7)}週`
      : format(currentDate, "yyyy年 M月 d日", { locale: ja })

  return (
    <div className="shrink-0 rounded-lg border bg-card/95 p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <CalendarIcon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="flex items-center gap-3 truncate text-xl font-semibold text-foreground sm:text-2xl">
            投稿カレンダー
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">SNSの投稿スケジュールを管理・可視化します</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Filters */}
        <div className="flex h-10 items-center rounded-md border bg-background px-1 shadow-xs">
          <Filter className="w-4 h-4 text-muted-foreground ml-2 mr-1" />
          <Select value={platformFilter} onValueChange={(v) => onPlatformFilterChange(v as Platform | "all")}>
            <SelectTrigger className="h-8 w-[122px] border-0 bg-transparent text-xs shadow-none focus:ring-0">
              <SelectValue placeholder="プラットフォーム" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {Object.entries(platformLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="w-px h-4 bg-border mx-1" />
          <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as Status | "all")}>
            <SelectTrigger className="h-8 w-[122px] border-0 bg-transparent text-xs shadow-none focus:ring-0">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Switcher */}
        <div className="flex h-10 items-center rounded-md bg-muted p-1">
          <Button 
            variant={view === "month" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-8 px-3 text-xs"
            onClick={() => onViewChange("month")}
          >
            月
          </Button>
          <Button 
            variant={view === "week" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-8 px-3 text-xs"
            onClick={() => onViewChange("week")}
          >
            週
          </Button>
          <Button 
            variant={view === "day" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-8 px-3 text-xs"
            onClick={() => onViewChange("day")}
          >
            日
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex h-10 items-center gap-1 rounded-md border bg-background p-1 shadow-xs">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-[132px] px-3 text-sm font-medium" onClick={onToday}>
            {title}
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <Button variant="outline" size="sm" className="h-10" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          エクスポート
        </Button>
        <Button size="sm" className="h-10" onClick={onNewEvent}>
          <Plus className="w-4 h-4 mr-2" />
          新規排期
        </Button>
      </div>
      </div>
    </div>
  )
}

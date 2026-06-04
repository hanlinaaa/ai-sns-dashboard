"use client"

import { Search, X, Download, Trash2, Star, CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar } from "@/components/ui/calendar"
import { Platform, Tone, Status, platformLabels, toneLabels, statusLabels } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface HistoryFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  platformFilter: Platform | "all"
  onPlatformChange: (value: Platform | "all") => void
  toneFilter: Tone | "all"
  onToneChange: (value: Tone | "all") => void
  statusFilter: Status | "all"
  onStatusChange: (value: Status | "all") => void
  showFavoritesOnly: boolean
  onFavoritesChange: (value: boolean) => void
  dateRange: { from: Date | undefined; to: Date | undefined }
  onDateRangeChange: (value: { from: Date | undefined; to: Date | undefined }) => void
  selectedCount: number
  totalCount: number
  onExport: (format: "csv" | "excel") => void
  onDeleteSelected: () => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function HistoryFilters({
  searchQuery,
  onSearchChange,
  platformFilter,
  onPlatformChange,
  toneFilter,
  onToneChange,
  statusFilter,
  onStatusChange,
  showFavoritesOnly,
  onFavoritesChange,
  dateRange,
  onDateRangeChange,
  selectedCount,
  totalCount,
  onExport,
  onDeleteSelected,
  hasActiveFilters,
  onClearFilters,
}: HistoryFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Search and Actions Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="内容・キーワード・ターゲット層で検索..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => onSearchChange("")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11">
                <Download className="w-4 h-4 mr-2" />
                エクスポート
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedCount}件
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport("csv")}>
                CSVでダウンロード
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("excel")}>
                Excelでダウンロード
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Batch Delete */}
          {selectedCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-11">
                  <Trash2 className="w-4 h-4 mr-2" />
                  削除 ({selectedCount}件)
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>選択した履歴を削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    {selectedCount}件の履歴を完全に削除します。この操作は取り消せません。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteSelected}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Platform Filter */}
        <Select value={platformFilter} onValueChange={(v) => onPlatformChange(v as Platform | "all")}>
          <SelectTrigger className="w-[140px] h-10">
            <SelectValue placeholder="プラットフォーム" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {Object.entries(platformLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tone Filter */}
        <Select value={toneFilter} onValueChange={(v) => onToneChange(v as Tone | "all")}>
          <SelectTrigger className="w-[160px] h-10">
            <SelectValue placeholder="トーン" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのトーン</SelectItem>
            {Object.entries(toneLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as Status | "all")}>
          <SelectTrigger className="w-[130px] h-10">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-10 justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MM/dd", { locale: ja })} -{" "}
                    {format(dateRange.to, "MM/dd", { locale: ja })}
                  </>
                ) : (
                  format(dateRange.from, "yyyy/MM/dd", { locale: ja })
                )
              ) : (
                "期間を選択"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => onDateRangeChange({ from: range?.from, to: range?.to })}
              numberOfMonths={2}
              locale={ja}
            />
          </PopoverContent>
        </Popover>

        {/* Favorites Toggle */}
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          className="h-10"
          onClick={() => onFavoritesChange(!showFavoritesOnly)}
        >
          <Star className={cn("w-4 h-4 mr-2", showFavoritesOnly && "fill-current")} />
          お気に入りのみ
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" className="h-10" onClick={onClearFilters}>
            <X className="w-4 h-4 mr-2" />
            フィルターをクリア
          </Button>
        )}

        {/* Results Count */}
        <div className="ml-auto text-sm text-muted-foreground">
          {totalCount}件の結果
        </div>
      </div>
    </div>
  )
}

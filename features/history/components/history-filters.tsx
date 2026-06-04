"use client"

import { format } from "date-fns"
import { CalendarIcon, Download, Forward, Search, Star, Trash2, X } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/components/ui/utils"
import type { ContentStatus, Platform, Status, Tone } from "@/domain/types"

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
  onFavoriteSelected: (favorite: boolean) => void
  onUpdateSelectedStatus: (status: Status) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

const platformOptions: Array<{ value: Platform; label: string }> = [
  { value: "x", label: "X" },
  { value: "instagram", label: "Instagram" },
  { value: "line", label: "LINE" },
]

const toneOptions: Array<{ value: Tone; label: string }> = [
  { value: "business", label: "Business" },
  { value: "friendly", label: "Friendly" },
  { value: "gyaru", label: "Gyaru" },
  { value: "promo", label: "Promotion" },
]

const statusOptions: Array<{ value: ContentStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "generated", label: "Generated" },
  { value: "scheduled", label: "Scheduled" },
  { value: "pendingApproval", label: "Pending approval" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
]

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
  onFavoriteSelected,
  onUpdateSelectedStatus,
  hasActiveFilters,
  onClearFilters,
}: HistoryFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search content, keywords, or audience"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 pl-10"
          />
          {searchQuery ? (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedCount > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11">
                  <Forward className="mr-2 h-4 w-4" />
                  Batch actions
                  <Badge variant="secondary" className="ml-2">
                    {selectedCount}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onFavoriteSelected(true)}>
                  <Star className="mr-2 h-4 w-4" />
                  Mark favorite
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFavoriteSelected(false)}>
                  <Star className="mr-2 h-4 w-4" />
                  Remove favorite
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {statusOptions.map((status) => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => onUpdateSelectedStatus(status.value)}
                  >
                    Move to {status.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11">
                <Download className="mr-2 h-4 w-4" />
                Export
                {selectedCount > 0 ? (
                  <Badge variant="secondary" className="ml-2">
                    {selectedCount}
                  </Badge>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport("csv")}>Download CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("excel")}>Download Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedCount > 0 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-11">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete selected records?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes {selectedCount} saved content asset(s) from history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteSelected}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={platformFilter}
          onValueChange={(value) => onPlatformChange(value as Platform | "all")}
        >
          <SelectTrigger className="h-10 w-[150px]">
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

        <Select value={toneFilter} onValueChange={(value) => onToneChange(value as Tone | "all")}>
          <SelectTrigger className="h-10 w-[160px]">
            <SelectValue placeholder="Tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tones</SelectItem>
            {toneOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusChange(value as Status | "all")}
        >
          <SelectTrigger className="h-10 w-[170px]">
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

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-10 justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MM/dd")} - {format(dateRange.to, "MM/dd")}
                  </>
                ) : (
                  format(dateRange.from, "yyyy/MM/dd")
                )
              ) : (
                "Date range"
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
            />
          </PopoverContent>
        </Popover>

        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          className="h-10"
          onClick={() => onFavoritesChange(!showFavoritesOnly)}
        >
          <Star className={cn("mr-2 h-4 w-4", showFavoritesOnly && "fill-current")} />
          Favorites
        </Button>

        {hasActiveFilters ? (
          <Button variant="ghost" className="h-10" onClick={onClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        ) : null}

        <div className="ml-auto text-sm text-muted-foreground">{totalCount} result(s)</div>
      </div>
    </div>
  )
}

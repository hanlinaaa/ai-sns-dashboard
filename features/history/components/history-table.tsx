"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  CalendarPlus,
  Check,
  Copy,
  Edit3,
  Eye,
  MoreHorizontal,
  RotateCcw,
  Star,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/components/ui/utils"
import type { BrandSettings, ContentStatus, HistoryRecord, Platform, Status } from "@/domain/types"
import { canTransitionStatus } from "@/domain/workflow"
import { validateContent, type ValidationIssue } from "@/domain/validation"
import { InstagramIcon, LineIcon, XIcon } from "@/features/platform/platform-icons"

interface HistoryTableProps {
  records: HistoryRecord[]
  selectedIds: Set<string>
  brandSettings?: BrandSettings
  isMutating?: boolean
  onSelectAll: (checked: boolean) => void
  onSelectRecord: (id: string, checked: boolean) => void
  onToggleFavorite: (id: string) => void | Promise<void>
  onUpdateStatus: (id: string, status: Status) => void | Promise<void>
  onUpdateContent: (id: string, content: string) => void | Promise<void>
  onDelete: (id: string) => void | Promise<void>
  onAddToCalendar: (id: string) => void | Promise<void>
}

const contentStatuses: ContentStatus[] = [
  "draft",
  "generated",
  "scheduled",
  "pendingApproval",
  "published",
  "failed",
]

const statusLabelMap: Record<ContentStatus, string> = {
  draft: "Draft",
  generated: "Generated",
  scheduled: "Scheduled",
  pendingApproval: "Pending approval",
  published: "Published",
  failed: "Failed",
}

const toneLabelMap: Record<HistoryRecord["tone"], string> = {
  business: "Business",
  friendly: "Friendly",
  gyaru: "Gyaru",
  promo: "Promotion",
}

const platformLabelMap: Record<Platform, string> = {
  x: "X",
  instagram: "Instagram",
  line: "LINE",
}

const statusStyleMap: Record<ContentStatus, string> = {
  draft: "border-slate-300 bg-slate-50 text-slate-700",
  generated: "border-blue-300 bg-blue-50 text-blue-700",
  scheduled: "border-violet-300 bg-violet-50 text-violet-700",
  pendingApproval: "border-amber-300 bg-amber-50 text-amber-700",
  published: "border-green-300 bg-green-50 text-green-700",
  failed: "border-red-300 bg-red-50 text-red-700",
}

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "x") return <XIcon className="h-4 w-4" />
  if (platform === "instagram") return <InstagramIcon className="h-4 w-4" />
  return <LineIcon className="h-4 w-4" />
}

function buildRegenerateUrl(record: HistoryRecord) {
  const params = new URLSearchParams({
    platform: record.platform,
    tone: record.tone,
    targetAudience: record.targetAudience,
    keywords: record.keywords,
  })
  return `/?${params.toString()}`
}

function hasBlockingIssues(issues: ValidationIssue[]) {
  return issues.some((issue) => issue.severity === "error")
}

function ValidationIssueList({ issues }: { issues: ValidationIssue[] }) {
  if (issues.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50 text-green-800">
        <Check className="h-4 w-4" />
        <AlertTitle>Validation passed</AlertTitle>
        <AlertDescription>This content can continue through the lifecycle.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-2">
      {issues.map((issue, index) => (
        <Alert
          key={`${issue.code}-${index}`}
          variant={issue.severity === "error" ? "destructive" : "default"}
          className={cn(issue.severity === "warning" && "border-amber-300 bg-amber-50")}
        >
          <AlertTitle>{issue.severity === "error" ? "Blocking error" : "Warning"}</AlertTitle>
          <AlertDescription>{issue.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

export function HistoryTable({
  records,
  selectedIds,
  brandSettings,
  isMutating = false,
  onSelectAll,
  onSelectRecord,
  onToggleFavorite,
  onUpdateStatus,
  onUpdateContent,
  onDelete,
  onAddToCalendar,
}: HistoryTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [detailRecord, setDetailRecord] = useState<HistoryRecord | null>(null)

  const allSelected = records.length > 0 && records.every((record) => selectedIds.has(record.id))
  const someSelected = records.some((record) => selectedIds.has(record.id))
  const editingRecord = records.find((record) => record.id === editingId)
  const editValidationIssues = useMemo(() => {
    if (!editingRecord) return []
    return validateContent({
      platform: editingRecord.platform,
      content: editContent,
      brandSettings,
    })
  }, [brandSettings, editContent, editingRecord])
  const editHasErrors = hasBlockingIssues(editValidationIssues)

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success("Content copied.")
    } catch (error) {
      console.error("Failed to copy history content:", error)
      toast.error("Could not copy the content.")
    }
  }

  const handleStartEdit = (record: HistoryRecord) => {
    setEditingId(record.id)
    setEditContent(record.generatedContent)
  }

  const handleSaveEdit = async (id: string) => {
    if (editHasErrors) {
      toast.error("Fix blocking validation errors before saving.")
      return
    }

    try {
      await onUpdateContent(id, editContent)
      setEditingId(null)
      setEditContent("")
      toast.success("Content updated.")
    } catch (error) {
      console.error("Failed to update history content:", error)
      toast.error("Could not update the content.")
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const handleStatusChange = async (record: HistoryRecord, nextStatus: Status) => {
    if (!canTransitionStatus(record.status, nextStatus)) {
      toast.error(`Cannot move ${statusLabelMap[record.status]} to ${statusLabelMap[nextStatus]}.`)
      return
    }

    try {
      await onUpdateStatus(record.id, nextStatus)
    } catch (error) {
      console.error("Failed to update history status:", error)
      toast.error("Could not update the status.")
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return

    try {
      await onDelete(deleteTargetId)
      toast.success("History record deleted.")
    } catch (error) {
      console.error("Failed to delete history record:", error)
      toast.error("Could not delete the history record.")
    } finally {
      setDeleteTargetId(null)
    }
  }

  if (records.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-foreground">No history records</h3>
          <p className="max-w-md text-center text-sm text-muted-foreground">
            Generated content saved from the editor appears here for reuse, scheduling, and
            lifecycle management.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4 rounded-t-lg border border-b-0 border-border/50 bg-muted/50 px-4 py-3">
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => onSelectAll(checked === true)}
          aria-label="Select all history records"
          className={cn(someSelected && !allSelected && "data-[state=checked]:bg-primary/50")}
        />
        <span className="flex-1 text-sm font-medium text-muted-foreground">
          {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select records"}
        </span>
      </div>

      <div className="divide-y divide-border/50 rounded-b-lg border border-t-0 border-border/50">
        {records.map((record) => {
          const rowValidationIssues = validateContent({
            platform: record.platform,
            content: record.generatedContent,
            brandSettings,
          })
          const rowHasErrors = hasBlockingIssues(rowValidationIssues)
          const allowedStatuses = new Set(
            contentStatuses.filter((status) => canTransitionStatus(record.status, status)),
          )

          return (
            <div
              key={record.id}
              className={cn(
                "flex gap-4 p-4 transition-colors hover:bg-muted/30",
                selectedIds.has(record.id) && "bg-primary/5",
              )}
            >
              <div className="flex items-start pt-1">
                <Checkbox
                  checked={selectedIds.has(record.id)}
                  onCheckedChange={(checked) => onSelectRecord(record.id, checked === true)}
                  aria-label={`Select history record ${record.id}`}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1.5">
                    <PlatformIcon platform={record.platform} />
                    {platformLabelMap[record.platform]}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {toneLabelMap[record.tone]}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs", statusStyleMap[record.status])}>
                    {statusLabelMap[record.status]}
                  </Badge>
                  {rowHasErrors ? (
                    <Badge variant="destructive" className="text-xs">
                      Validation error
                    </Badge>
                  ) : rowValidationIssues.length > 0 ? (
                    <Badge
                      variant="outline"
                      className="border-amber-300 bg-amber-50 text-amber-700"
                    >
                      Validation warning
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-green-300 bg-green-50 text-green-700"
                    >
                      Valid
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Audience: {record.targetAudience}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {format(record.createdAt, "yyyy/MM/dd HH:mm")}
                  </span>
                </div>

                {editingId === record.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(event) => setEditContent(event.target.value)}
                      className="min-h-[140px] resize-none"
                      autoFocus
                    />
                    <ValidationIssueList issues={editValidationIssues} />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => void handleSaveEdit(record.id)}
                        disabled={editHasErrors || isMutating}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="mr-1 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="line-clamp-3 whitespace-pre-wrap text-sm text-foreground">
                    {record.generatedContent}
                  </p>
                )}

                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Keywords:</span> {record.keywords}
                </div>

                {editingId !== record.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void onToggleFavorite(record.id)}
                          className={cn("h-8", record.isFavorite && "text-yellow-500")}
                          disabled={isMutating}
                        >
                          <Star className={cn("h-4 w-4", record.isFavorite && "fill-current")} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {record.isFavorite ? "Remove favorite" : "Add favorite"}
                      </TooltipContent>
                    </Tooltip>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => void handleCopy(record.generatedContent)}
                    >
                      <Copy className="mr-1 h-4 w-4" />
                      Copy
                    </Button>

                    <Button variant="outline" size="sm" className="h-8" asChild>
                      <Link href={buildRegenerateUrl(record)}>
                        <RotateCcw className="mr-1 h-4 w-4" />
                        Regenerate
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => void onAddToCalendar(record.id)}
                      disabled={
                        rowHasErrors ||
                        !canTransitionStatus(record.status, "scheduled") ||
                        isMutating
                      }
                    >
                      <CalendarPlus className="mr-1 h-4 w-4" />
                      Add to calendar
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => handleStartEdit(record)}
                    >
                      <Edit3 className="mr-1 h-4 w-4" />
                      Edit
                    </Button>

                    <Select
                      value={record.status}
                      onValueChange={(value) => void handleStatusChange(record, value as Status)}
                    >
                      <SelectTrigger className="h-8 w-[170px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contentStatuses.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            disabled={!allowedStatuses.has(status)}
                          >
                            {statusLabelMap[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailRecord(record)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTargetId(record.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this history record?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the saved content asset from history. The action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailRecord !== null} onOpenChange={(open) => !open && setDetailRecord(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          {detailRecord ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <PlatformIcon platform={detailRecord.platform} />
                  History asset details
                </DialogTitle>
                <DialogDescription>
                  Review the prompt context, lifecycle status, validation result, and reusable
                  content.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-5">
                <div className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Platform</span>
                    <p className="font-medium">{platformLabelMap[detailRecord.platform]}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tone</span>
                    <p className="font-medium">{toneLabelMap[detailRecord.tone]}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium">{statusLabelMap[detailRecord.status]}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created</span>
                    <p className="font-mono text-xs">{detailRecord.createdAt.toISOString()}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Target audience</span>
                    <p className="font-medium">{detailRecord.targetAudience}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Keywords</span>
                    <p className="font-medium">{detailRecord.keywords}</p>
                  </div>
                </div>

                <ValidationIssueList
                  issues={validateContent({
                    platform: detailRecord.platform,
                    content: detailRecord.generatedContent,
                    brandSettings,
                  })}
                />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Content</h4>
                  <div className="rounded-lg border bg-card p-4">
                    <p className="whitespace-pre-wrap text-sm">{detailRecord.generatedContent}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                  <Button onClick={() => void handleCopy(detailRecord.generatedContent)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={buildRegenerateUrl(detailRecord)}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void onAddToCalendar(detailRecord.id)}
                    disabled={
                      hasBlockingIssues(
                        validateContent({
                          platform: detailRecord.platform,
                          content: detailRecord.generatedContent,
                          brandSettings,
                        }),
                      ) || !canTransitionStatus(detailRecord.status, "scheduled")
                    }
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Add to calendar
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

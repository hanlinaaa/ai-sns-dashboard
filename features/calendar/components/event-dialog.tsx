"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Copy, History, Loader2, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { withCurrentDataVersion } from "@/domain/data-version"
import type {
  BrandSettings,
  CalendarEvent,
  ContentStatus,
  HistoryRecord,
  Platform,
  SystemSettings,
  Tone,
} from "@/domain/types"
import { validateContent } from "@/domain/validation"

interface EventDialogProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent | null
  initialDate: Date | null
  historyRecords: HistoryRecord[]
  brandSettings?: BrandSettings
  systemSettings?: SystemSettings
  onSave: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
  onCopy?: () => void
  isSaving?: boolean
}

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

export function EventDialog({
  isOpen,
  onClose,
  event,
  initialDate,
  historyRecords,
  brandSettings,
  systemSettings,
  onSave,
  onDelete,
  onCopy,
  isSaving = false,
}: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [platform, setPlatform] = useState<Platform>("x")
  const [tone, setTone] = useState<Tone>("friendly")
  const [content, setContent] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [status, setStatus] = useState<ContentStatus>("scheduled")
  const [historyId, setHistoryId] = useState<string>("none")

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setPlatform(event.platform)
      setTone(event.tone)
      setContent(event.content)
      setDate(format(event.scheduledAt, "yyyy-MM-dd"))
      setTime(format(event.scheduledAt, "HH:mm"))
      setStatus(event.status)
      setHistoryId(event.historyId ?? "none")
      return
    }

    if (initialDate) {
      setTitle("")
      setPlatform("x")
      setTone("friendly")
      setContent("")
      setDate(format(initialDate, "yyyy-MM-dd"))
      setTime("12:00")
      setStatus("scheduled")
      setHistoryId("none")
    }
  }, [event, initialDate, isOpen])

  const validationIssues = useMemo(
    () =>
      validateContent({
        platform,
        content,
        brandSettings,
      }),
    [brandSettings, content, platform],
  )
  const blockingIssues = validationIssues.filter((issue) => issue.severity === "error")
  const warningIssues = validationIssues.filter((issue) => issue.severity === "warning")
  const approvalWillApply = systemSettings?.workflow.requireApproval && status === "scheduled"

  const handleHistoryImport = (nextHistoryId: string) => {
    setHistoryId(nextHistoryId)
    const record = historyRecords.find((item) => item.id === nextHistoryId)
    if (!record) return

    setTitle(record.keywords || "Imported history content")
    setPlatform(record.platform)
    setTone(record.tone)
    setContent(record.generatedContent)
  }

  const handleSave = () => {
    if (!title.trim() || !content.trim() || !date || !time) return
    if (blockingIssues.length > 0) return

    const [year, month, day] = date.split("-").map(Number)
    const [hours, minutes] = time.split(":").map(Number)
    const scheduledAt = new Date(year, month - 1, day, hours, minutes)

    onSave(
      withCurrentDataVersion({
        id: event ? event.id : `evt-${Date.now()}`,
        title,
        platform,
        tone,
        content,
        scheduledAt,
        status,
        historyId: historyId === "none" ? undefined : historyId,
        publishJobId: event?.publishJobId,
      }),
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="custom-scrollbar w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="mb-6">
          <SheetTitle>{event ? "Edit schedule" : "New schedule"}</SheetTitle>
          <SheetDescription>
            Validate content, import reusable history assets, and save the publishing workflow
            status.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="history-import">Import from history</Label>
            <Select value={historyId} onValueChange={handleHistoryImport}>
              <SelectTrigger id="history-import">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No imported history record</SelectItem>
                {historyRecords.map((record) => (
                  <SelectItem key={record.id} value={record.id}>
                    {record.platform.toUpperCase()} - {record.keywords}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="schedule-title">Title</Label>
            <Input
              id="schedule-title"
              value={title}
              onChange={(eventChange) => setTitle(eventChange.target.value)}
              placeholder="Campaign announcement"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(value) => setPlatform(value as Platform)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="x">X</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="line">LINE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(value) => setTone(value as Tone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ContentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(change) => setDate(change.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Time</Label>
            <Input type="time" value={time} onChange={(change) => setTime(change.target.value)} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="schedule-content">Content</Label>
              <History className="h-4 w-4 text-muted-foreground" />
            </div>
            <Textarea
              id="schedule-content"
              value={content}
              onChange={(eventChange) => setContent(eventChange.target.value)}
              className="min-h-[160px]"
            />
          </div>

          {blockingIssues.length > 0 ? (
            <Alert variant="destructive">
              <AlertTitle>Content blocks scheduling</AlertTitle>
              <AlertDescription>{blockingIssues[0].message}</AlertDescription>
            </Alert>
          ) : null}

          {warningIssues.length > 0 ? (
            <Alert className="border-amber-300 bg-amber-50">
              <AlertTitle>Content warning</AlertTitle>
              <AlertDescription>{warningIssues[0].message}</AlertDescription>
            </Alert>
          ) : null}

          {approvalWillApply ? (
            <Alert className="border-blue-300 bg-blue-50">
              <AlertTitle>Approval required</AlertTitle>
              <AlertDescription>
                System settings require approval. Saving as scheduled will create a pending approval
                item.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertTitle>Approval policy</AlertTitle>
              <AlertDescription>
                Approval is not required by current system settings. Scheduled items can enter the
                calendar directly.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <SheetFooter className="mt-8 flex-col gap-3 sm:flex-row sm:gap-0">
          {event ? (
            <Button variant="destructive" onClick={() => onDelete(event.id)} className="sm:mr-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          ) : null}
          {event && onCopy ? (
            <Button variant="outline" onClick={onCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          ) : null}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              !title.trim() ||
              !content.trim() ||
              !date ||
              !time ||
              blockingIssues.length > 0
            }
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

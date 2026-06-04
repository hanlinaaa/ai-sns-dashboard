"use client"

import { format } from "date-fns"
import { Copy, Edit3, RotateCcw, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CalendarEvent, ContentStatus, Platform, PublishJob, PublishJobStatus } from "@/domain/types"

interface ListViewProps {
  events: CalendarEvent[]
  publishJobs: PublishJob[]
  onEventClick: (event: CalendarEvent) => void
  onCopyEvent: (event: CalendarEvent) => void | Promise<void>
  onRetryPublishJob: (jobId: string) => void | Promise<void>
  onCancelPublishJob: (jobId: string) => void | Promise<void>
  isMutating?: boolean
}

const platformLabelMap: Record<Platform, string> = {
  x: "X",
  instagram: "Instagram",
  line: "LINE",
}

const statusLabelMap: Record<ContentStatus, string> = {
  draft: "Draft",
  generated: "Generated",
  scheduled: "Scheduled",
  pendingApproval: "Pending approval",
  published: "Published",
  failed: "Failed",
}

const statusClassMap: Record<ContentStatus, string> = {
  draft: "border-slate-300 bg-slate-50 text-slate-700",
  generated: "border-blue-300 bg-blue-50 text-blue-700",
  scheduled: "border-violet-300 bg-violet-50 text-violet-700",
  pendingApproval: "border-amber-300 bg-amber-50 text-amber-700",
  published: "border-green-300 bg-green-50 text-green-700",
  failed: "border-red-300 bg-red-50 text-red-700",
}

const publishJobClassMap: Record<PublishJobStatus, string> = {
  queued: "border-violet-300 bg-violet-50 text-violet-700",
  running: "border-blue-300 bg-blue-50 text-blue-700",
  succeeded: "border-green-300 bg-green-50 text-green-700",
  failed: "border-red-300 bg-red-50 text-red-700",
  cancelled: "border-slate-300 bg-slate-50 text-slate-700",
}

function getPublishJob(event: CalendarEvent, publishJobs: PublishJob[]) {
  if (event.publishJobId) {
    const linkedJob = publishJobs.find((job) => job.id === event.publishJobId)
    if (linkedJob) return linkedJob
  }

  return publishJobs.find((job) => job.calendarEventId === event.id) ?? null
}

export function ListView({
  events,
  publishJobs,
  onEventClick,
  onCopyEvent,
  onRetryPublishJob,
  onCancelPublishJob,
  isMutating = false,
}: ListViewProps) {
  const sortedEvents = [...events].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Scheduled at</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[110px]">Platform</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[180px]">Publish job</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="w-[260px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.map((event) => {
              const publishJob = getPublishJob(event, publishJobs)
              return (
                <TableRow key={event.id}>
                  <TableCell className="font-mono text-xs">
                    {format(event.scheduledAt, "yyyy/MM/dd HH:mm")}
                  </TableCell>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{platformLabelMap[event.platform]}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusClassMap[event.status]}>
                      {statusLabelMap[event.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {publishJob ? (
                      <div className="space-y-1">
                        <Badge variant="outline" className={publishJobClassMap[publishJob.status]}>
                          {publishJob.status}
                        </Badge>
                        {publishJob.errorMessage ? (
                          <p className="line-clamp-2 text-xs text-destructive">
                            {publishJob.errorMessage}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not queued</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[320px] whitespace-normal">
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {event.content}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEventClick(event)}>
                        <Edit3 className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void onCopyEvent(event)}
                        disabled={isMutating}
                      >
                        <Copy className="mr-1 h-4 w-4" />
                        Copy
                      </Button>
                      {publishJob?.status === "failed" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void onRetryPublishJob(publishJob.id)}
                          disabled={isMutating || publishJob.retryCount >= 3}
                        >
                          <RotateCcw className="mr-1 h-4 w-4" />
                          Retry
                        </Button>
                      ) : null}
                      {publishJob &&
                      publishJob.status !== "succeeded" &&
                      publishJob.status !== "cancelled" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void onCancelPublishJob(publishJob.id)}
                          disabled={isMutating}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  )
}

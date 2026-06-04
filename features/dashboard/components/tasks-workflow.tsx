"use client"

import Link from "next/link"
import { format, startOfDay } from "date-fns"
import { ArrowRight, Calendar, Clock, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/components/ui/utils"
import type { CalendarEvent, PublishJob } from "@/domain/types"

interface TasksWorkflowProps {
  upcomingEvents: CalendarEvent[]
  failedJobs: PublishJob[]
}

const platformColors: Record<CalendarEvent["platform"], string> = {
  x: "bg-slate-900 text-white",
  instagram: "bg-pink-600 text-white",
  line: "bg-emerald-600 text-white",
}

function daysUntil(date: Date) {
  const today = startOfDay(new Date())
  const target = startOfDay(date)
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatScheduledTime(date: Date) {
  const distance = daysUntil(date)
  if (distance === 0) return `Today ${format(date, "HH:mm")}`
  if (distance === 1) return `Tomorrow ${format(date, "HH:mm")}`
  return format(date, "M/d HH:mm")
}

export function TasksWorkflow({ upcomingEvents, failedJobs }: TasksWorkflowProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="h-4 w-4 text-primary" />
              Upcoming Publishing
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
              <Link href="/calendar">
                Calendar
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {upcomingEvents.length === 0 ? (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              No scheduled publish jobs are waiting.
            </div>
          ) : (
            <div className="relative">
              <div className="absolute bottom-3 left-[11px] top-3 w-0.5 bg-border" />
              <div className="space-y-4">
                {upcomingEvents.map((post) => {
                  const distance = daysUntil(post.scheduledAt)
                  return (
                    <div key={post.id} className="relative flex items-start gap-3">
                      <div
                        className={cn(
                          "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-background",
                          distance <= 1 ? "border-primary" : "border-muted-foreground/30",
                        )}
                      >
                        <Clock
                          className={cn(
                            "h-3 w-3",
                            distance <= 1 ? "text-primary" : "text-muted-foreground/50",
                          )}
                        />
                      </div>
                      <div className="min-w-0 flex-1 pb-2">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={cn("px-1.5 py-0 text-[10px]", platformColors[post.platform])}
                          >
                            {post.platform === "x" ? "X" : post.platform}
                          </Badge>
                          <span className="truncate text-xs font-medium text-foreground">
                            {post.title}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatScheduledTime(post.scheduledAt)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <RotateCcw className="h-4 w-4 text-primary" />
            Retry Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {failedJobs.length === 0 ? (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              No failed publish jobs need retry.
            </div>
          ) : (
            failedJobs.map((job) => (
              <div key={job.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="destructive">Failed</Badge>
                  <span className="text-xs text-muted-foreground">Retry {job.retryCount}/3</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-foreground">
                  {job.errorMessage ?? "Publishing failed without a connector message."}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { withCurrentDataVersion } from "@/domain/data-version"
import type { BrandSettings, CalendarEvent, ContentStatus, SystemSettings } from "@/domain/types"
import { findScheduleConflicts, validateContent, type ValidationIssue } from "@/domain/validation"
import { canTransitionStatus } from "@/domain/workflow"

export interface ScheduleSaveInput {
  event: CalendarEvent
  existingEvents: CalendarEvent[]
  previousEvent?: CalendarEvent | null
  brandSettings?: BrandSettings
  systemSettings?: SystemSettings
}

export interface ScheduleSaveResult {
  event: CalendarEvent
  issues: ValidationIssue[]
  blockingIssues: ValidationIssue[]
  warningIssues: ValidationIssue[]
}

function shouldRouteToApproval(input: {
  requestedStatus: ContentStatus
  previousStatus?: ContentStatus
  systemSettings?: SystemSettings
}) {
  if (!input.systemSettings?.workflow.requireApproval) return false
  if (input.requestedStatus !== "scheduled") return false
  if (input.previousStatus === "pendingApproval") return false
  return true
}

function normalizeRequestedStatus(input: {
  requestedStatus: ContentStatus
  previousStatus?: ContentStatus
  systemSettings?: SystemSettings
}): ContentStatus {
  return shouldRouteToApproval(input) ? "pendingApproval" : input.requestedStatus
}

export function validateScheduleSave(input: ScheduleSaveInput): ScheduleSaveResult {
  const requestedStatus = input.event.status
  const finalStatus = normalizeRequestedStatus({
    requestedStatus,
    previousStatus: input.previousEvent?.status,
    systemSettings: input.systemSettings,
  })
  const previousStatus = input.previousEvent?.status ?? "draft"
  const issues: ValidationIssue[] = [
    ...validateContent({
      platform: input.event.platform,
      content: input.event.content,
      brandSettings: input.brandSettings,
    }),
    ...findScheduleConflicts({
      event: input.event,
      existingEvents: input.existingEvents,
    }),
  ]

  if (!canTransitionStatus(previousStatus, finalStatus)) {
    issues.push({
      code: "schedule_conflict",
      severity: "error",
      message: `Invalid schedule status transition: ${previousStatus} -> ${finalStatus}.`,
      meta: { previousStatus, requestedStatus, finalStatus },
    })
  }

  if (finalStatus === "pendingApproval" && requestedStatus === "scheduled") {
    issues.push({
      code: "schedule_conflict",
      severity: "warning",
      message: "Approval is required. This schedule will be saved as pending approval.",
      meta: { requestedStatus, finalStatus },
    })
  }

  const event = withCurrentDataVersion({
    ...input.event,
    status: finalStatus,
  })
  const blockingIssues = issues.filter((issue) => issue.severity === "error")
  const warningIssues = issues.filter((issue) => issue.severity === "warning")

  return {
    event,
    issues,
    blockingIssues,
    warningIssues,
  }
}

export function createCopiedCalendarEvent(event: CalendarEvent, scheduledAt = new Date()) {
  const nextScheduledAt = new Date(scheduledAt)
  nextScheduledAt.setDate(nextScheduledAt.getDate() + 1)
  nextScheduledAt.setHours(event.scheduledAt.getHours(), event.scheduledAt.getMinutes(), 0, 0)

  return withCurrentDataVersion({
    ...event,
    id: `evt-${Date.now()}-${event.id}`,
    title: `${event.title} copy`,
    scheduledAt: nextScheduledAt,
    status: "scheduled" as const,
    publishJobId: undefined,
  })
}

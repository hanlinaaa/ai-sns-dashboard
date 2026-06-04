import { differenceInMinutes, isSameDay } from "date-fns"
import { countCharacters, extractHashtags, getPlatformRule } from "./platform-rules"
import type { BrandSettings, CalendarEvent, Platform } from "./types"

export type ValidationSeverity = "error" | "warning"

export type ValidationCode =
  | "ng_word"
  | "must_have_word"
  | "hashtag_count"
  | "content_length"
  | "line_format"
  | "schedule_conflict"

export interface ValidationIssue {
  code: ValidationCode
  severity: ValidationSeverity
  message: string
  meta?: Record<string, unknown>
}

export interface ContentValidationInput {
  platform: Platform
  content: string
  brandSettings?: Pick<BrandSettings, "ngWords" | "mustHaveWords" | "allowHashtags" | "maxHashtags">
}

export function validateContent(input: ContentValidationInput): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const rule = getPlatformRule(input.platform)
  const length = countCharacters(input.content)
  const hashtags = extractHashtags(input.content)
  const maxHashtags =
    input.brandSettings?.allowHashtags === false
      ? 0
      : (input.brandSettings?.maxHashtags[input.platform] ?? rule.maxHashtags)

  if (length > rule.maxContentLength) {
    issues.push({
      code: "content_length",
      severity: "error",
      message: `${rule.label} content is ${length} characters; max is ${rule.maxContentLength}.`,
      meta: { length, max: rule.maxContentLength },
    })
  }

  if (hashtags.length > maxHashtags) {
    issues.push({
      code: "hashtag_count",
      severity: "error",
      message: `${rule.label} content has ${hashtags.length} hashtags; max is ${maxHashtags}.`,
      meta: { count: hashtags.length, max: maxHashtags },
    })
  }

  for (const word of input.brandSettings?.ngWords ?? []) {
    if (word && input.content.includes(word)) {
      issues.push({
        code: "ng_word",
        severity: "error",
        message: `Content includes blocked word: ${word}.`,
        meta: { word },
      })
    }
  }

  for (const word of input.brandSettings?.mustHaveWords ?? []) {
    if (word && !input.content.includes(word)) {
      issues.push({
        code: "must_have_word",
        severity: "warning",
        message: `Content is missing required word: ${word}.`,
        meta: { word },
      })
    }
  }

  if (input.platform === "line" && /\n{3,}/.test(input.content)) {
    issues.push({
      code: "line_format",
      severity: "warning",
      message: "LINE content should avoid long blank-line runs.",
    })
  }

  return issues
}

export interface ScheduleConflictInput {
  event: Pick<CalendarEvent, "id" | "platform" | "scheduledAt">
  existingEvents: Array<Pick<CalendarEvent, "id" | "platform" | "scheduledAt">>
}

export function findScheduleConflicts(input: ScheduleConflictInput): ValidationIssue[] {
  const rule = getPlatformRule(input.event.platform)
  const conflicts = input.existingEvents.filter((existing) => {
    if (existing.id === input.event.id) return false
    if (existing.platform !== input.event.platform) return false
    if (!isSameDay(existing.scheduledAt, input.event.scheduledAt)) return false

    return (
      Math.abs(differenceInMinutes(existing.scheduledAt, input.event.scheduledAt)) <
      rule.minScheduleGapMinutes
    )
  })

  if (conflicts.length === 0) return []

  return [
    {
      code: "schedule_conflict",
      severity: "error",
      message: `${rule.label} has ${conflicts.length} scheduled item(s) within ${rule.minScheduleGapMinutes} minutes.`,
      meta: { conflictIds: conflicts.map((event) => event.id) },
    },
  ]
}

export function hasBlockingIssues(issues: ValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === "error")
}

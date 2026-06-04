import type { ContentStatus, Platform } from "./types"

export const contentStatuses = [
  "draft",
  "generated",
  "scheduled",
  "pendingApproval",
  "published",
  "failed",
] as const satisfies readonly ContentStatus[]

export const statusTransitions: Record<ContentStatus, ContentStatus[]> = {
  draft: ["generated", "scheduled", "pendingApproval", "failed"],
  generated: ["draft", "scheduled", "pendingApproval", "failed"],
  scheduled: ["draft", "pendingApproval", "published", "failed"],
  pendingApproval: ["draft", "scheduled", "published", "failed"],
  published: ["failed"],
  failed: ["draft", "scheduled"],
}

export const platformStatusTransitions: Record<Platform, Record<ContentStatus, ContentStatus[]>> = {
  x: statusTransitions,
  instagram: statusTransitions,
  line: statusTransitions,
}

export function canTransitionStatus(from: ContentStatus, to: ContentStatus): boolean {
  return from === to || statusTransitions[from].includes(to)
}

export function canTransitionPlatformStatus(
  platform: Platform,
  from: ContentStatus,
  to: ContentStatus,
): boolean {
  return from === to || platformStatusTransitions[platform][from].includes(to)
}

export function assertStatusTransition(from: ContentStatus, to: ContentStatus) {
  if (!canTransitionStatus(from, to)) {
    throw new Error(`Invalid content status transition: ${from} -> ${to}`)
  }
}

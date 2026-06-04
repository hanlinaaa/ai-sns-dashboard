import { describe, expect, it } from "vitest"
import type { CalendarEvent, SystemSettings } from "@/domain/types"
import { validateScheduleSave } from "./schedule-service"

const baseEvent: CalendarEvent = {
  dataVersion: 1,
  id: "evt-new",
  title: "LINE coupon campaign",
  platform: "line",
  tone: "business",
  content: "Thank you for following our LINE account.",
  scheduledAt: new Date("2026-06-05T12:00:00"),
  status: "scheduled",
}

const systemSettings: SystemSettings = {
  dataVersion: 1,
  id: "default",
  ai: { model: "gpt-4o-mini", apiKey: "" },
  sns: {
    x: { apiKey: "", apiSecret: "", connected: true },
    instagram: { accessToken: "", connected: true },
    line: { channelToken: "", channelSecret: "", connected: true },
  },
  analytics: { gaId: "" },
  workflow: { requireApproval: true, autoCleanupDays: "90" },
  notifications: {
    emailWeeklyReport: true,
    emailPublishStatus: true,
    inAppToast: true,
  },
}

describe("validateScheduleSave", () => {
  it("routes scheduled posts to pending approval when approval is required", () => {
    const result = validateScheduleSave({
      event: baseEvent,
      existingEvents: [],
      systemSettings,
    })

    expect(result.event.status).toBe("pendingApproval")
    expect(result.warningIssues).toContainEqual(
      expect.objectContaining({
        message: "Approval is required. This schedule will be saved as pending approval.",
      }),
    )
  })

  it("blocks conflicting schedules on the same platform", () => {
    const result = validateScheduleSave({
      event: baseEvent,
      existingEvents: [
        {
          ...baseEvent,
          id: "evt-existing",
          scheduledAt: new Date("2026-06-05T12:02:00"),
        },
      ],
      systemSettings: {
        ...systemSettings,
        workflow: { ...systemSettings.workflow, requireApproval: false },
      },
    })

    expect(result.blockingIssues).toContainEqual(
      expect.objectContaining({ code: "schedule_conflict" }),
    )
  })
})

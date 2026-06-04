import { describe, expect, it } from "vitest"
import type { BrandSettings } from "./types"
import { findScheduleConflicts, validateContent } from "./validation"

const brandSettings: Pick<
  BrandSettings,
  "ngWords" | "mustHaveWords" | "allowHashtags" | "maxHashtags"
> = {
  ngWords: ["guaranteed"],
  mustHaveWords: ["AI SNS Ops"],
  allowHashtags: true,
  maxHashtags: {
    x: 1,
    instagram: 3,
    line: 0,
  },
}

describe("validateContent", () => {
  it("blocks excessive hashtags and warns about missing required wording", () => {
    const issues = validateContent({
      platform: "x",
      content: "Guaranteed results with #one #two",
      brandSettings,
    })

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["hashtag_count", "must_have_word"]),
    )
  })

  it("warns when required brand wording is missing", () => {
    const issues = validateContent({
      platform: "instagram",
      content: "New seasonal product is available now.",
      brandSettings,
    })

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "must_have_word",
        severity: "warning",
      }),
    )
  })
})

describe("findScheduleConflicts", () => {
  it("detects same-platform posts inside the minimum schedule gap", () => {
    const issues = findScheduleConflicts({
      event: {
        id: "new",
        platform: "x",
        scheduledAt: new Date("2026-06-05T10:00:00"),
      },
      existingEvents: [
        {
          id: "existing",
          platform: "x",
          scheduledAt: new Date("2026-06-05T10:05:00"),
        },
      ],
    })

    expect(issues).toHaveLength(1)
    expect(issues[0].code).toBe("schedule_conflict")
  })
})

import { describe, expect, it } from "vitest"
import { assertStatusTransition, canTransitionStatus } from "./workflow"

describe("content status workflow", () => {
  it("allows scheduled content to become published", () => {
    expect(canTransitionStatus("scheduled", "published")).toBe(true)
  })

  it("rejects published content moving back to scheduled", () => {
    expect(canTransitionStatus("published", "scheduled")).toBe(false)
    expect(() => assertStatusTransition("published", "scheduled")).toThrow(
      "Invalid content status transition",
    )
  })
})

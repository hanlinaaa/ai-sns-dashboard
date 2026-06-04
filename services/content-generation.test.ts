import { describe, expect, it } from "vitest"
import { mockBrandSettings } from "@/domain/mock-data"
import {
  buildContentGenerationPrompt,
  generateMockContent,
  validateGeneratedContent,
  type GenerateContentInput,
} from "./content-generation"

const input: GenerateContentInput = {
  platform: "x",
  tone: "friendly",
  targetAudience: "retail marketers",
  keywords: "LINE coupon campaign, weekend offer",
  mustHaveWords: "AI SNS Ops",
  contentLength: "medium",
  brandSettings: mockBrandSettings,
}

describe("content generation service", () => {
  it("builds an OpenAI-compatible prompt with platform rules and JSON instructions", () => {
    const prompt = buildContentGenerationPrompt(input)

    expect(prompt[0].content).toContain("Return strict JSON only")
    expect(prompt[1].content).toContain("Platform rules")
    expect(prompt[1].content).toContain("LINE coupon campaign")
  })

  it("generates deterministic mock content that validates across platforms", () => {
    const contents = generateMockContent(input)
    const records = validateGeneratedContent(contents, mockBrandSettings)

    expect(contents.x).toContain("AI SNS Ops")
    expect(contents.instagram).toContain("#SNSMarketing")
    expect(records).toHaveLength(3)
    expect(records.every((record) => record.content.length > 0)).toBe(true)
  })
})

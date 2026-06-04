import { withCurrentDataVersion } from "@/domain/data-version"
import { getPlatformRule } from "@/domain/platform-rules"
import type {
  BrandSettings,
  ContentLengthPreference,
  GeneratedContent,
  HistoryRecord,
  Platform,
  Tone,
} from "@/domain/types"
import { validateContent, type ValidationIssue } from "@/domain/validation"

export interface GenerateContentInput {
  platform: Platform
  tone: Tone
  targetAudience: string
  keywords: string
  ngWords?: string
  mustHaveWords?: string
  contentLength?: ContentLengthPreference
  brandSettings?: BrandSettings
  action?: GenerationAction
  previousContent?: string
  validationIssues?: ValidationIssue[]
  highPerformingContent?: HighPerformingContentReference[]
}

export interface HighPerformingContentReference {
  platform: Platform
  content: string
  engagementRate: number
  impressions: number
}

export type GenerationAction =
  | "generate"
  | "regenerate"
  | "changeTone"
  | "shorten"
  | "lengthen"
  | "fixValidation"

export interface GeneratedContentByPlatform {
  x: string
  instagram: string
  line: string
}

export interface PlatformGeneratedContent {
  platform: Platform
  content: string
  validationIssues: ValidationIssue[]
}

export interface GenerateContentResult {
  contents: GeneratedContentByPlatform
  records: PlatformGeneratedContent[]
  provider?: "openai" | "mock"
}

export interface OpenAiChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface OpenAiCompatibleOptions {
  apiKey: string
  baseUrl?: string
  model?: string
}

const allPlatforms: Platform[] = ["x", "instagram", "line"]

const defaultContent: GeneratedContentByPlatform = {
  x: "Fill out the form and generate demo or real AI copy for X.",
  instagram: "Fill out the form and generate demo or real AI copy for Instagram.",
  line: "Fill out the form and generate demo or real AI copy for LINE.",
}

export const defaultGeneratedContent = defaultContent

const toneInstruction: Record<Tone, string> = {
  business: "Professional, concise, trustworthy, and suitable for business communication.",
  friendly: "Warm, approachable, easy to read, and conversational.",
  gyaru: "Casual, upbeat, playful, and trend-aware without becoming hard to understand.",
  promo: "Sales-oriented, benefit-led, urgent where appropriate, and clear about the offer.",
}

const lengthInstruction: Record<ContentLengthPreference, string> = {
  short: "Short. Prefer 1-2 compact sentences.",
  medium: "Medium. Prefer 2-4 concise sentences.",
  long: "Long. Add useful context while staying within platform limits.",
}

function splitWords(value?: string): string[] {
  return (
    value
      ?.split(/[,\n]/)
      .map((word) => word.trim())
      .filter(Boolean) ?? []
  )
}

function formatWords(words: string[]) {
  return words.length > 0 ? words.join(", ") : "None"
}

function getBrandValue(input: GenerateContentInput, key: "ngWords" | "mustHaveWords"): string[] {
  const formWords = splitWords(input[key])
  if (formWords.length > 0) return formWords
  return input.brandSettings?.[key] ?? []
}

function buildPlatformRulesSection(platforms: Platform[]) {
  return platforms
    .map((platform) => {
      const rule = getPlatformRule(platform)
      return [
        `${rule.label}:`,
        `- Max characters: ${rule.maxContentLength}`,
        `- Max hashtags: ${rule.maxHashtags}`,
        `- Line breaks allowed: ${rule.allowLineBreaks ? "yes" : "no"}`,
      ].join("\n")
    })
    .join("\n\n")
}

function buildBrandSection(input: GenerateContentInput) {
  const brand = input.brandSettings
  const ngWords = getBrandValue(input, "ngWords")
  const mustHaveWords = getBrandValue(input, "mustHaveWords")
  const contentLength = input.contentLength ?? brand?.contentLength ?? "medium"

  return [
    `Brand name: ${brand?.brandName || "Not specified"}`,
    `Brand description: ${brand?.brandBio || "Not specified"}`,
    `Brand instructions: ${brand?.customInstructions || "None"}`,
    `First person wording: ${brand?.firstPerson || "Not specified"}`,
    `Second person wording: ${brand?.secondPerson || "Not specified"}`,
    `Website: ${brand?.websiteUrl || "Not specified"}`,
    `Contact: ${brand?.contactInfo || "Not specified"}`,
    `Disclaimer: ${brand?.disclaimer || "None"}`,
    `NG words: ${formatWords(ngWords)}`,
    `Must-have words: ${formatWords(mustHaveWords)}`,
    `Emoji allowed: ${brand?.allowEmojis === false ? "no" : "yes"}`,
    `Hashtags allowed: ${brand?.allowHashtags === false ? "no" : "yes"}`,
    `Length preference: ${lengthInstruction[contentLength]}`,
  ].join("\n")
}

function buildHighPerformingContentSection(input: GenerateContentInput) {
  const references = input.highPerformingContent ?? []
  if (references.length === 0) return "None"

  return references
    .slice(0, 5)
    .map((reference, index) =>
      [
        `${index + 1}. Platform: ${reference.platform}`,
        `   Engagement rate: ${reference.engagementRate.toFixed(2)}%`,
        `   Impressions: ${reference.impressions}`,
        `   Content: ${reference.content}`,
      ].join("\n"),
    )
    .join("\n")
}

export function buildContentGenerationPrompt(input: GenerateContentInput): OpenAiChatMessage[] {
  const validationText =
    input.validationIssues && input.validationIssues.length > 0
      ? input.validationIssues.map((issue) => `- ${issue.code}: ${issue.message}`).join("\n")
      : "None"

  return [
    {
      role: "system",
      content: [
        "You generate social media copy for marketing teams.",
        "Return strict JSON only, with keys x, instagram, and line.",
        "Each value must be a string. Do not include markdown fences.",
        "Follow platform rules, brand rules, must-have words, and NG words.",
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        `Action: ${input.action ?? "generate"}`,
        `Primary selected platform: ${input.platform}`,
        "",
        "Platform rules:",
        buildPlatformRulesSection(allPlatforms),
        "",
        "Brand settings:",
        buildBrandSection(input),
        "",
        `Tone: ${toneInstruction[input.tone]}`,
        `Target audience: ${input.targetAudience}`,
        `Keywords / content brief: ${input.keywords}`,
        "",
        `Previous content: ${input.previousContent || "None"}`,
        "",
        "High-performing historical content for strategy reference:",
        buildHighPerformingContentSection(input),
        "",
        "Validation issues to fix:",
        validationText,
        "",
        "Output requirement:",
        "Generate copy for X, Instagram, and LINE. Keep the same campaign idea across platforms, but adapt format and length to each platform.",
        "Use the high-performing references only to infer topic patterns, tone, structure, and timing signals. Do not copy their wording.",
      ].join("\n"),
    },
  ]
}

function formatTopic(input: GenerateContentInput): string {
  const brief = input.keywords.trim()
  if (brief.length > 0) return brief
  return "the current campaign"
}

function formatAudience(input: GenerateContentInput): string {
  const audience = input.targetAudience.trim()
  if (audience.length > 0) return audience
  return "the target audience"
}

function getRequiredWords(input: GenerateContentInput): string {
  const words = getBrandValue(input, "mustHaveWords")
  return words.length > 0 ? ` Include ${words.join(" and ")}.` : ""
}

export function generateMockContent(input: GenerateContentInput): GeneratedContentByPlatform {
  const topic = formatTopic(input)
  const audience = formatAudience(input)
  const brandName = input.brandSettings?.brandName || "AI SNS Ops"
  const requiredWords = getRequiredWords(input)
  const actionLabel =
    input.action === "fixValidation"
      ? "This version tightens brand and platform compliance."
      : "This version is generated from demo data."

  return {
    x: `${brandName}: ${topic} for ${audience}. Clear next steps, quick value, and a reusable campaign angle for your SNS workflow.${requiredWords}`,
    instagram: [
      `${brandName} campaign update`,
      "",
      `${topic} is ready for ${audience}. ${actionLabel} Use it as a polished draft for launch planning, approval review, and content reuse.`,
      "",
      "#SNSMarketing #ContentOps #CampaignPlanning",
      requiredWords.trim(),
    ]
      .filter(Boolean)
      .join("\n"),
    line: `${brandName} update: ${topic} is available for ${audience}. Please review the details and use this demo draft for scheduling, approval, or follow-up messaging.${requiredWords}`,
  }
}

function parseJsonObject(text: string): Partial<GeneratedContentByPlatform> {
  try {
    return JSON.parse(text) as Partial<GeneratedContentByPlatform>
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return {}
    return JSON.parse(match[0]) as Partial<GeneratedContentByPlatform>
  }
}

export async function generateContentWithOpenAi(
  input: GenerateContentInput,
  options: OpenAiCompatibleOptions,
): Promise<GeneratedContentByPlatform> {
  try {
    const response = await fetch(
      `${options.baseUrl ?? "https://api.openai.com/v1"}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: options.model ?? "gpt-4o-mini",
          messages: buildContentGenerationPrompt(input),
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      },
    )

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || `Content generation failed with status ${response.status}.`)
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const rawContent = data.choices?.[0]?.message?.content
    if (!rawContent) throw new Error("The AI provider returned an empty response.")

    const parsed = parseJsonObject(rawContent)
    return {
      x: parsed.x?.trim() || "",
      instagram: parsed.instagram?.trim() || "",
      line: parsed.line?.trim() || "",
    }
  } catch (error) {
    console.error("OpenAI-compatible content generation failed:", error)
    throw error
  }
}

export function validateGeneratedContent(
  contents: GeneratedContentByPlatform,
  brandSettings?: BrandSettings,
): PlatformGeneratedContent[] {
  return allPlatforms.map((platform) => ({
    platform,
    content: contents[platform],
    validationIssues: validateContent({
      platform,
      content: contents[platform],
      brandSettings,
    }),
  }))
}

export function createGeneratedContentRecords({
  contents,
  input,
  brandSettings,
  now = new Date(),
}: {
  contents: GeneratedContentByPlatform
  input: GenerateContentInput
  brandSettings?: BrandSettings
  now?: Date
}): { generatedContents: GeneratedContent[]; historyRecords: HistoryRecord[] } {
  const timestamp = now.getTime()
  const generatedContents = allPlatforms.map((platform, index) =>
    withCurrentDataVersion({
      id: `gen-${timestamp}-${platform}-${index}`,
      platform,
      tone: input.tone,
      targetAudience: input.targetAudience,
      keywords: input.keywords,
      body: contents[platform],
      status: "generated" as const,
      createdAt: now,
      updatedAt: now,
      brandSettingsId: brandSettings?.id,
    }),
  )

  const historyRecords = generatedContents.map((content, index) =>
    withCurrentDataVersion({
      id: `hist-${timestamp}-${content.platform}-${index}`,
      platform: content.platform,
      tone: content.tone,
      targetAudience: content.targetAudience,
      keywords: content.keywords,
      generatedContent: content.body,
      createdAt: now,
      status: content.status,
      isFavorite: false,
      generatedContentId: content.id,
    }),
  )

  return { generatedContents, historyRecords }
}

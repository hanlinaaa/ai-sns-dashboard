import type { Platform } from "./types"

export interface PlatformRule {
  platform: Platform
  label: string
  maxContentLength: number
  maxHashtags: number
  minScheduleGapMinutes: number
  allowLineBreaks: boolean
  requiredFormat?: RegExp
}

export const platformRules: Record<Platform, PlatformRule> = {
  x: {
    platform: "x",
    label: "X",
    maxContentLength: 280,
    maxHashtags: 3,
    minScheduleGapMinutes: 10,
    allowLineBreaks: true,
  },
  instagram: {
    platform: "instagram",
    label: "Instagram",
    maxContentLength: 2200,
    maxHashtags: 30,
    minScheduleGapMinutes: 15,
    allowLineBreaks: true,
  },
  line: {
    platform: "line",
    label: "LINE",
    maxContentLength: 500,
    maxHashtags: 0,
    minScheduleGapMinutes: 5,
    allowLineBreaks: true,
  },
}

export function getPlatformRule(platform: Platform): PlatformRule {
  return platformRules[platform]
}

export function countCharacters(content: string): number {
  return Array.from(content).length
}

export function extractHashtags(content: string): string[] {
  return content.match(/#[\p{L}\p{N}_]+/gu) ?? []
}

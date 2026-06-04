"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/components/ui/utils"
import type { ContentLengthPreference, Platform, Tone } from "@/domain/types"
import { toast } from "sonner"

export interface ContentFormData {
  platform: Platform
  tone: Tone
  targetAudience: string
  keywords: string
  ngWords: string
  mustHaveWords: string
  contentLength: ContentLengthPreference
}

interface ContentFormProps {
  selectedPlatform: Platform
  setSelectedPlatform: (platform: Platform) => void
  onGenerate: (data: ContentFormData) => void | Promise<void>
  initialData?: Partial<ContentFormData> | null
  isGenerating?: boolean
}

const platforms: Array<{ value: Platform; label: string }> = [
  { value: "x", label: "X" },
  { value: "instagram", label: "Instagram" },
  { value: "line", label: "LINE" },
]

const toneOptions: Array<{ value: Tone; label: string }> = [
  { value: "business", label: "Business" },
  { value: "friendly", label: "Friendly" },
  { value: "gyaru", label: "Gyaru" },
  { value: "promo", label: "Promotion" },
]

const lengthOptions: Array<{ value: ContentLengthPreference; label: string }> = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
]

export function ContentForm({
  selectedPlatform,
  setSelectedPlatform,
  onGenerate,
  initialData,
  isGenerating = false,
}: ContentFormProps) {
  const [tone, setTone] = useState<Tone>("friendly")
  const [targetAudience, setTargetAudience] = useState("")
  const [keywords, setKeywords] = useState("")
  const [ngWords, setNgWords] = useState("")
  const [mustHaveWords, setMustHaveWords] = useState("")
  const [contentLength, setContentLength] = useState<ContentLengthPreference>("medium")

  useEffect(() => {
    if (!initialData) return
    if (initialData.tone) setTone(initialData.tone)
    if (initialData.targetAudience !== undefined) setTargetAudience(initialData.targetAudience)
    if (initialData.keywords !== undefined) setKeywords(initialData.keywords)
    if (initialData.ngWords !== undefined) setNgWords(initialData.ngWords)
    if (initialData.mustHaveWords !== undefined) setMustHaveWords(initialData.mustHaveWords)
    if (initialData.contentLength) setContentLength(initialData.contentLength)
    toast.info("Loaded form data from history.")
  }, [initialData])

  const handleSubmit = async () => {
    if (!targetAudience.trim() || !keywords.trim()) {
      toast.error("Enter a target audience and keywords before generating.")
      return
    }

    await onGenerate({
      platform: selectedPlatform,
      tone,
      targetAudience,
      keywords,
      ngWords,
      mustHaveWords,
      contentLength,
    })
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </span>
          Content brief
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Primary platform</Label>
          <ToggleGroup
            type="single"
            value={selectedPlatform}
            onValueChange={(value) => value && setSelectedPlatform(value as Platform)}
            className="justify-start gap-2"
          >
            {platforms.map((platform) => (
              <ToggleGroupItem
                key={platform.value}
                value={platform.value}
                className={cn(
                  "rounded-lg border px-4 py-2 transition-all",
                  selectedPlatform === platform.value
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                {platform.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={(value) => setTone(value as Tone)}>
              <SelectTrigger id="tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="contentLength">Length</Label>
            <Select
              value={contentLength}
              onValueChange={(value) => setContentLength(value as ContentLengthPreference)}
            >
              <SelectTrigger id="contentLength">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lengthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="audience">Target audience</Label>
          <Input
            id="audience"
            placeholder="Example: busy solo founders, first-time buyers, LINE followers"
            value={targetAudience}
            onChange={(event) => setTargetAudience(event.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="keywords">Keywords and offer details</Label>
          <Textarea
            id="keywords"
            placeholder="Example: spring launch, limited 20% discount, free shipping, new product line"
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="ngWords">NG words</Label>
            <Textarea
              id="ngWords"
              placeholder="Comma or line separated"
              value={ngWords}
              onChange={(event) => setNgWords(event.target.value)}
              className="min-h-20 resize-none"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="mustHaveWords">Must-have words</Label>
            <Textarea
              id="mustHaveWords"
              placeholder="Comma or line separated"
              value={mustHaveWords}
              onChange={(event) => setMustHaveWords(event.target.value)}
              className="min-h-20 resize-none"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isGenerating}
          className="h-12 w-full text-base font-semibold"
        >
          {isGenerating ? (
            <>
              <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate AI content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { Palette, Save, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { mockBrandSettings } from "@/domain/mock-data"
import type { BrandSettings, ContentLengthPreference, Platform, Tone } from "@/domain/types"
import { Sidebar } from "@/features/navigation/sidebar"
import { getRepositories } from "@/services/repositories"
import { toDataAccessErrorInfo } from "@/services/repositories/errors"

const toneOptions: Array<{ value: Tone; label: string }> = [
  { value: "business", label: "Business" },
  { value: "friendly", label: "Friendly" },
  { value: "gyaru", label: "Casual pop" },
  { value: "promo", label: "Promotion" },
]
const contentLengthOptions: Array<{ value: ContentLengthPreference; label: string }> = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
]
const BRAND_SETTINGS_ID = "default"

const isTone = (value: string): value is Tone =>
  toneOptions.some((option) => option.value === value)

const isContentLengthPreference = (value: string): value is ContentLengthPreference =>
  contentLengthOptions.some((option) => option.value === value)

export default function BrandSettingsPage() {
  const repositories = useMemo(() => getRepositories(), [])
  const [settings, setSettings] = useState<BrandSettings>(mockBrandSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        const savedSettings =
          await repositories.settingsRepository.brandSettings.get(BRAND_SETTINGS_ID)
        setSettings(savedSettings ?? mockBrandSettings)
      } catch (error) {
        const errorInfo = toDataAccessErrorInfo(error, "Failed to load brand settings.")
        toast.error(errorInfo.message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadSettings()
  }, [repositories])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const existingSettings =
        await repositories.settingsRepository.brandSettings.get(BRAND_SETTINGS_ID)

      if (existingSettings) {
        await repositories.settingsRepository.brandSettings.update(BRAND_SETTINGS_ID, settings)
      } else {
        await repositories.settingsRepository.brandSettings.create({
          ...settings,
          id: BRAND_SETTINGS_ID,
        })
      }
      toast.success("Brand settings saved", {
        description: "The rules will be used for future generation and validation.",
      })
    } catch (error) {
      const errorInfo = toDataAccessErrorInfo(error, "Failed to save brand settings.")
      toast.error(errorInfo.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = <K extends keyof BrandSettings>(field: K, value: BrandSettings[K]) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleToneSelect = (platform: Platform, value: string) => {
    if (!isTone(value)) {
      toast.error("Invalid tone selected", {
        description: "Please select a supported tone.",
      })
      return
    }

    setSettings((prev) => ({
      ...prev,
      defaultTones: { ...prev.defaultTones, [platform]: value },
    }))
  }

  const handleContentLengthSelect = (value: string) => {
    if (!isContentLengthPreference(value)) {
      toast.error("Invalid content length selected", {
        description: "Please select a supported content length.",
      })
      return
    }

    handleChange("contentLength", value)
  }

  const handleMaxHashtagsChange = (platform: Platform, count: number) => {
    setSettings((prev) => ({
      ...prev,
      maxHashtags: { ...prev.maxHashtags, [platform]: count },
    }))
  }

  const handleAddWord = (field: "ngWords" | "mustHaveWords", word: string) => {
    if (!word.trim()) return
    setSettings((prev) => ({
      ...prev,
      [field]: [...new Set([...prev[field], word.trim()])],
    }))
  }

  const handleRemoveWord = (field: "ngWords" | "mustHaveWords", wordToRemove: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: prev[field].filter((word) => word !== wordToRemove),
    }))
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar currentPath="/settings/brand" />
      <main className="ml-0 w-full flex-1 px-4 py-5 sm:px-6 lg:ml-64 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-5">
          <div className="flex flex-col justify-between gap-4 rounded-lg border bg-card/95 p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold text-foreground sm:text-2xl">
                  Brand Settings
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Define brand voice, safety rules, and fixed context for AI generation.
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="h-10 w-full sm:w-auto"
            >
              {isLoading || isSaving ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save settings
            </Button>
          </div>

          <Tabs defaultValue="identity" className="w-full gap-5">
            <TabsList className="grid h-auto w-full grid-cols-2 rounded-lg border bg-card p-1 shadow-sm lg:grid-cols-4">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="tone">Tone</TabsTrigger>
              <TabsTrigger value="safety">Safety</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-6">
              <Card className="rounded-lg border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Brand Identity</CardTitle>
                  <CardDescription>
                    Provide the core context the generator should use when writing SNS copy.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="brandName">Brand or account name</Label>
                    <Input
                      id="brandName"
                      value={settings.brandName}
                      onChange={(event) => handleChange("brandName", event.target.value)}
                      placeholder="Example: AI SNS Ops"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="brandBio">Brand description and mission</Label>
                    <Textarea
                      id="brandBio"
                      value={settings.brandBio}
                      onChange={(event) => handleChange("brandBio", event.target.value)}
                      placeholder="Example: We help lean marketing teams generate, validate, and schedule SNS content."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="targetAudience">Default target audience</Label>
                    <Input
                      id="targetAudience"
                      value={settings.targetAudience}
                      onChange={(event) => handleChange("targetAudience", event.target.value)}
                      placeholder="Example: retail marketers and small business owners"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tone" className="space-y-6">
              <Card className="rounded-lg border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Tone and Voice</CardTitle>
                  <CardDescription>
                    Set default platform tones and reusable wording preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Default tone by platform</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {(["x", "instagram", "line"] as const).map((platform) => (
                        <div key={platform} className="space-y-2 rounded-lg border bg-muted/20 p-4">
                          <Label>{platform === "x" ? "X" : platform.toUpperCase()}</Label>
                          <Select
                            value={settings.defaultTones[platform]}
                            onValueChange={(value) => handleToneSelect(platform, value)}
                          >
                            <SelectTrigger>
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
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="firstPerson">First-person wording</Label>
                      <Input
                        id="firstPerson"
                        value={settings.firstPerson}
                        onChange={(event) => handleChange("firstPerson", event.target.value)}
                        placeholder="Example: our team"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="secondPerson">Customer wording</Label>
                      <Input
                        id="secondPerson"
                        value={settings.secondPerson}
                        onChange={(event) => handleChange("secondPerson", event.target.value)}
                        placeholder="Example: customers"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="customInstructions">Custom prompt instructions</Label>
                    <Textarea
                      id="customInstructions"
                      value={settings.customInstructions}
                      onChange={(event) => handleChange("customInstructions", event.target.value)}
                      placeholder="Example: Avoid exaggerated claims and keep wording concise."
                      className="min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="safety" className="space-y-6">
              <Card className="rounded-lg border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Safety Rules</CardTitle>
                  <CardDescription>
                    Configure validation rules for blocked words, required words, hashtags, and
                    length preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <WordListEditor
                      label="NG words"
                      words={settings.ngWords}
                      variant="destructive"
                      placeholder="Add blocked word and press Enter"
                      onAdd={(word) => handleAddWord("ngWords", word)}
                      onRemove={(word) => handleRemoveWord("ngWords", word)}
                    />
                    <WordListEditor
                      label="Must-have words"
                      words={settings.mustHaveWords}
                      variant="secondary"
                      placeholder="Add required word and press Enter"
                      onAdd={(word) => handleAddWord("mustHaveWords", word)}
                      onRemove={(word) => handleRemoveWord("mustHaveWords", word)}
                    />
                  </div>

                  <div className="space-y-6 border-t pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label>Allow emojis</Label>
                        <p className="text-xs text-muted-foreground">
                          Permit emoji usage in generated copy.
                        </p>
                      </div>
                      <Switch
                        checked={settings.allowEmojis}
                        onCheckedChange={(checked) => handleChange("allowEmojis", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label>Allow hashtags</Label>
                        <p className="text-xs text-muted-foreground">
                          Permit hashtags and enforce platform-specific maximum counts.
                        </p>
                      </div>
                      <Switch
                        checked={settings.allowHashtags}
                        onCheckedChange={(checked) => handleChange("allowHashtags", checked)}
                      />
                    </div>

                    {settings.allowHashtags ? (
                      <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
                        {(["x", "instagram", "line"] as const).map((platform) => (
                          <div key={platform} className="space-y-2">
                            <Label className="text-xs">
                              {platform === "x" ? "X" : platform.toUpperCase()} max hashtags
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              max={platform === "instagram" ? 30 : 10}
                              value={settings.maxHashtags[platform]}
                              onChange={(event) =>
                                handleMaxHashtagsChange(platform, Number(event.target.value) || 0)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="space-y-3 pt-2">
                      <Label>Default content length</Label>
                      <Select
                        value={settings.contentLength}
                        onValueChange={handleContentLengthSelect}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {contentLengthOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-6">
              <Card className="rounded-lg border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>Knowledge Base</CardTitle>
                  <CardDescription>
                    Store fixed details that should be available to campaign generation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="websiteUrl">Official website URL</Label>
                    <Input
                      id="websiteUrl"
                      value={settings.websiteUrl}
                      onChange={(event) => handleChange("websiteUrl", event.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="contactInfo">Contact and business hours</Label>
                    <Input
                      id="contactInfo"
                      value={settings.contactInfo}
                      onChange={(event) => handleChange("contactInfo", event.target.value)}
                      placeholder="Example: weekdays 10:00-18:00 JST"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="disclaimer">Disclaimer or fixed footer copy</Label>
                    <Textarea
                      id="disclaimer"
                      value={settings.disclaimer}
                      onChange={(event) => handleChange("disclaimer", event.target.value)}
                      placeholder="Example: Campaign details may change without prior notice."
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

interface WordListEditorProps {
  label: string
  words: string[]
  variant: "destructive" | "secondary"
  placeholder: string
  onAdd: (word: string) => void
  onRemove: (word: string) => void
}

function WordListEditor({
  label,
  words,
  variant,
  placeholder,
  onAdd,
  onRemove,
}: WordListEditorProps) {
  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <Label>{label}</Label>
      <div className="mb-2 flex min-h-8 flex-wrap gap-2">
        {words.map((word) => (
          <Badge key={word} variant={variant} className="flex items-center gap-1 pr-1">
            {word}
            <button
              type="button"
              aria-label={`Remove ${word}`}
              onClick={() => onRemove(word)}
              className="rounded-full p-0.5 hover:bg-background/30"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        placeholder={placeholder}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            onAdd(event.currentTarget.value)
            event.currentTarget.value = ""
          }
        }}
      />
    </div>
  )
}

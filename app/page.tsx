"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { withCurrentDataVersion } from "@/domain/data-version"
import { appLabels } from "@/domain/labels"
import type { BrandSettings, Platform, Tone } from "@/domain/types"
import { validateContent, type ValidationIssue } from "@/domain/validation"
import {
  ContentForm,
  type ContentFormData,
} from "@/features/content-generation/components/content-form"
import { PreviewArea } from "@/features/content-generation/components/preview-area"
import { Sidebar } from "@/features/navigation/sidebar"
import { createAnalyticsService, type TopContentPoint } from "@/services/analytics"
import {
  createGeneratedContentRecords,
  defaultGeneratedContent,
  type GenerateContentInput,
  type GenerateContentResult,
  type GeneratedContentByPlatform,
  type GenerationAction,
} from "@/services/content-generation"
import { getRepositories } from "@/services/repositories"
import { toDataAccessErrorInfo } from "@/services/repositories/errors"

type ValidationIssueMap = Record<Platform, ValidationIssue[]>

type InitialFormData = Partial<ContentFormData>

const emptyValidationIssues: ValidationIssueMap = {
  x: [],
  instagram: [],
  line: [],
}

function isPlatform(value: string | null): value is Platform {
  return value === "x" || value === "instagram" || value === "line"
}

function isTone(value: string | null): value is Tone {
  return value === "business" || value === "friendly" || value === "gyaru" || value === "promo"
}

function toIssueMap(result: GenerateContentResult): ValidationIssueMap {
  return result.records.reduce<ValidationIssueMap>(
    (issues, record) => ({
      ...issues,
      [record.platform]: record.validationIssues,
    }),
    { ...emptyValidationIssues },
  )
}

function DashboardFallback() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-0 flex-1 p-6 lg:ml-64 lg:p-8">
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="mt-3 h-5 w-80 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="min-h-[520px] animate-pulse rounded-xl border border-border bg-card" />
          <div className="min-h-[520px] animate-pulse rounded-xl border border-border bg-card" />
        </div>
      </main>
    </div>
  )
}

function DashboardContent() {
  const repositories = useMemo(() => getRepositories(), [])
  const analyticsService = useMemo(() => createAnalyticsService(repositories), [repositories])
  const searchParams = useSearchParams()
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("x")
  const [initialFormData, setInitialFormData] = useState<InitialFormData | null>(null)
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContentByPlatform>(defaultGeneratedContent)
  const [validationIssues, setValidationIssues] =
    useState<ValidationIssueMap>(emptyValidationIssues)
  const [brandSettings, setBrandSettings] = useState<BrandSettings | undefined>()
  const [topContentReferences, setTopContentReferences] = useState<TopContentPoint[]>([])
  const [lastFormData, setLastFormData] = useState<GenerateContentInput>({
    platform: "x",
    tone: "friendly",
    targetAudience: "SNS marketers",
    keywords: "New product launch, limited discount, time saving",
    contentLength: "medium",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSavingHistory, setIsSavingHistory] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)

  useEffect(() => {
    const loadGenerationContext = async () => {
      try {
        const [settings, dashboardAnalytics] = await Promise.all([
          repositories.settingsRepository.brandSettings.get("default"),
          analyticsService.getDashboardAnalytics(),
        ])
        if (settings) setBrandSettings(settings)
        setTopContentReferences(dashboardAnalytics.topContent)
      } catch (error) {
        const errorInfo = toDataAccessErrorInfo(error, "Failed to load generation context.")
        toast.error(errorInfo.message)
      }
    }

    void loadGenerationContext()
  }, [analyticsService, repositories])

  useEffect(() => {
    const platformParam = searchParams.get("platform")
    const toneParam = searchParams.get("tone")
    const targetAudienceParam = searchParams.get("targetAudience")
    const keywordsParam = searchParams.get("keywords")
    const platform = isPlatform(platformParam) ? platformParam : "x"
    const tone = isTone(toneParam) ? toneParam : "friendly"

    if (isPlatform(platformParam)) setSelectedPlatform(platformParam)

    if (isTone(toneParam) || targetAudienceParam || keywordsParam) {
      const nextInitialData = {
        tone,
        targetAudience: targetAudienceParam ?? "",
        keywords: keywordsParam ?? "",
      }

      setInitialFormData(nextInitialData)
      setLastFormData({ platform, ...nextInitialData })
      return
    }

    setInitialFormData(null)
  }, [searchParams])

  const saveAllGeneratedRecords = async (
    contents: GeneratedContentByPlatform,
    input: GenerateContentInput,
  ) => {
    const { generatedContents, historyRecords } = createGeneratedContentRecords({
      contents,
      input,
      brandSettings,
    })

    await Promise.all([
      ...generatedContents.map((record) =>
        repositories.generatedContentRepository.create(withCurrentDataVersion(record)),
      ),
      ...historyRecords.map((record) =>
        repositories.historyRepository.create(withCurrentDataVersion(record)),
      ),
    ])
  }

  const requestGeneration = async (formData: GenerateContentInput) => {
    const response = await fetch("/api/content-generation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
    const result = (await response.json()) as GenerateContentResult | { error?: string }

    if (!response.ok) {
      throw new Error("error" in result ? result.error : "Failed to generate content.")
    }

    return result as GenerateContentResult
  }

  const handleGenerate = async (formData: ContentFormData) => {
    const input: GenerateContentInput = {
      ...formData,
      action: "generate",
      brandSettings,
      highPerformingContent: topContentReferences,
    }

    setIsGenerating(true)
    try {
      const result = await requestGeneration(input)
      setSelectedPlatform(formData.platform)
      setLastFormData(input)
      setGeneratedContent(result.contents)
      setValidationIssues(toIssueMap(result))
      await saveAllGeneratedRecords(result.contents, input)
      toast.success(appLabels.generatedContent)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate content.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTransform = async (action: GenerationAction) => {
    const input: GenerateContentInput = {
      ...lastFormData,
      action,
      brandSettings,
      previousContent: generatedContent[selectedPlatform],
      validationIssues: validationIssues[selectedPlatform],
      highPerformingContent: topContentReferences,
    }

    setIsGenerating(true)
    try {
      const result = await requestGeneration(input)
      setLastFormData(input)
      setGeneratedContent(result.contents)
      setValidationIssues(toIssueMap(result))
      await saveAllGeneratedRecords(result.contents, input)
      toast.success("Generated a new version.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate content.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveHistory = async () => {
    const content = generatedContent[selectedPlatform]
    const issues = validateContent({ platform: selectedPlatform, content, brandSettings })
    const blockingIssue = issues.find((issue) => issue.severity === "error")

    if (blockingIssue) {
      toast.error(blockingIssue.message)
      return
    }

    setIsSavingHistory(true)
    try {
      const now = new Date()
      const generatedRecord = await repositories.generatedContentRepository.create(
        withCurrentDataVersion({
          id: `gen-${Date.now()}`,
          platform: selectedPlatform,
          tone: lastFormData.tone,
          targetAudience: lastFormData.targetAudience || "Unspecified",
          keywords: lastFormData.keywords || "Unspecified",
          body: content,
          status: "generated",
          createdAt: now,
          updatedAt: now,
          brandSettingsId: brandSettings?.id,
        }),
      )

      await repositories.historyRepository.create(
        withCurrentDataVersion({
          id: `hist-${Date.now()}`,
          platform: selectedPlatform,
          tone: lastFormData.tone,
          targetAudience: lastFormData.targetAudience || "Unspecified",
          keywords: lastFormData.keywords || "Unspecified",
          generatedContent: content,
          createdAt: now,
          status: "generated",
          isFavorite: false,
          generatedContentId: generatedRecord.id,
        }),
      )

      toast.success(appLabels.savedToHistory)
    } catch (error) {
      const errorInfo = toDataAccessErrorInfo(error, "Failed to save generated content.")
      toast.error(errorInfo.message)
    } finally {
      setIsSavingHistory(false)
    }
  }

  const handleAddToCalendar = async () => {
    const scheduledAt = new Date()
    scheduledAt.setDate(scheduledAt.getDate() + 1)
    scheduledAt.setHours(12, 0, 0, 0)

    setIsScheduling(true)
    try {
      await repositories.calendarRepository.create(
        withCurrentDataVersion({
          id: `evt-${Date.now()}`,
          title: lastFormData.keywords || "Generated content post",
          platform: selectedPlatform,
          tone: lastFormData.tone,
          content: generatedContent[selectedPlatform],
          scheduledAt,
          status: "scheduled",
        }),
      )

      toast.success(appLabels.addedToCalendar)
    } catch (error) {
      const errorInfo = toDataAccessErrorInfo(error, "Failed to add content to calendar.")
      toast.error(errorInfo.message)
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-0 flex-1 p-6 lg:ml-64 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">{appLabels.contentGenerationTitle}</h1>
          <p className="mt-1 text-muted-foreground">{appLabels.contentGenerationDescription}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ContentForm
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            onGenerate={handleGenerate}
            initialData={initialFormData}
            isGenerating={isGenerating}
          />
          <PreviewArea
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            content={generatedContent}
            validationIssues={validationIssues}
            onSave={handleSaveHistory}
            onAddToCalendar={handleAddToCalendar}
            onTransform={handleTransform}
            isSaving={isSavingHistory}
            isScheduling={isScheduling}
            isGenerating={isGenerating}
          />
        </div>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  )
}

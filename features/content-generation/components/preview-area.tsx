"use client"

import { CalendarPlus, Copy, RefreshCcw, Save, ScanLine, TextCursorInput } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Platform } from "@/domain/types"
import type { ValidationIssue } from "@/domain/validation"
import type { GenerationAction, GeneratedContentByPlatform } from "@/services/content-generation"

interface PreviewAreaProps {
  selectedPlatform: Platform
  setSelectedPlatform: (platform: Platform) => void
  content: GeneratedContentByPlatform
  validationIssues: Record<Platform, ValidationIssue[]>
  onSave?: () => void | Promise<void>
  onAddToCalendar?: () => void | Promise<void>
  onTransform?: (action: GenerationAction) => void | Promise<void>
  isSaving?: boolean
  isScheduling?: boolean
  isGenerating?: boolean
}

const platforms: Array<{ value: Platform; label: string }> = [
  { value: "x", label: "X" },
  { value: "instagram", label: "Instagram" },
  { value: "line", label: "LINE" },
]

export function PreviewArea({
  selectedPlatform,
  setSelectedPlatform,
  content,
  validationIssues,
  onSave,
  onAddToCalendar,
  onTransform,
  isSaving = false,
  isScheduling = false,
  isGenerating = false,
}: PreviewAreaProps) {
  const selectedIssues = validationIssues[selectedPlatform] ?? []

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast.success("Copied content.")
  }

  const runTransform = (action: GenerationAction) => {
    if (!onTransform) return
    void onTransform(action)
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between gap-3 text-lg font-semibold">
          <span>Generated content</span>
          <Badge
            variant={
              selectedIssues.some((issue) => issue.severity === "error")
                ? "destructive"
                : "secondary"
            }
          >
            {selectedIssues.length === 0 ? "Valid" : `${selectedIssues.length} issue(s)`}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={selectedPlatform}
          onValueChange={(value) => setSelectedPlatform(value as Platform)}
        >
          <TabsList className="mb-6 grid w-full grid-cols-3">
            {platforms.map((platform) => (
              <TabsTrigger key={platform.value} value={platform.value}>
                {platform.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {platforms.map((platform) => (
            <TabsContent key={platform.value} value={platform.value} className="mt-0">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="min-h-[220px] whitespace-pre-line rounded-md bg-card p-4 text-sm leading-6 shadow-sm">
                  {content[platform.value]}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {selectedIssues.length > 0 && (
          <div className="mt-4 space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            {selectedIssues.map((issue, index) => (
              <div key={`${issue.code}-${index}`} className="text-sm">
                <span
                  className={issue.severity === "error" ? "text-destructive" : "text-amber-600"}
                >
                  {issue.severity.toUpperCase()}
                </span>
                <span className="ml-2 text-muted-foreground">{issue.message}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Button
            variant="outline"
            onClick={() => runTransform("regenerate")}
            disabled={isGenerating}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button
            variant="outline"
            onClick={() => runTransform("changeTone")}
            disabled={isGenerating}
          >
            <TextCursorInput className="mr-2 h-4 w-4" />
            Change tone
          </Button>
          <Button variant="outline" onClick={() => runTransform("shorten")} disabled={isGenerating}>
            <ScanLine className="mr-2 h-4 w-4" />
            Shorten
          </Button>
          <Button
            variant="outline"
            onClick={() => runTransform("lengthen")}
            disabled={isGenerating}
          >
            <TextCursorInput className="mr-2 h-4 w-4" />
            Lengthen
          </Button>
          <Button
            variant="outline"
            onClick={() => runTransform("fixValidation")}
            disabled={isGenerating || selectedIssues.length === 0}
          >
            <ScanLine className="mr-2 h-4 w-4" />
            Fix issues
          </Button>
          <Button variant="outline" onClick={() => handleCopy(content[selectedPlatform])}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" onClick={() => void onSave?.()} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Save record
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => void onAddToCalendar?.()}
            disabled={isScheduling}
          >
            <CalendarPlus className="mr-2 h-4 w-4" />
            Add to calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

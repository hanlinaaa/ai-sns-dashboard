"use client"

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { Platform, Tone } from "@/lib/types"
import { toast } from "sonner"

interface ContentFormProps {
  selectedPlatform: Platform
  setSelectedPlatform: (platform: Platform) => void
  onGenerate: (data: {
    platform: Platform
    tone: Tone
    targetAudience: string
    keywords: string
  }) => void
  initialData?: {
    tone: Tone
    targetAudience: string
    keywords: string
  } | null
}

const platforms = [
  { 
    value: "x", 
    label: "X", 
    icon: () => (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  },
  { 
    value: "instagram", 
    label: "Instagram", 
    icon: () => (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  },
  { 
    value: "line", 
    label: "LINE", 
    icon: () => (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
      </svg>
    )
  },
]

const toneOptions = [
  { value: "business", label: "ビジネス敬語" },
  { value: "friendly", label: "親しみやすい" },
  { value: "gyaru", label: "ギャル風" },
  { value: "promo", label: "セール・プロモーション" },
]

export function ContentForm({ selectedPlatform, setSelectedPlatform, onGenerate, initialData }: ContentFormProps) {
  const [tone, setTone] = useState<Tone>("friendly")
  const [targetAudience, setTargetAudience] = useState("")
  const [keywords, setKeywords] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Handle initial data from regeneration
  useEffect(() => {
    if (initialData) {
      setTone(initialData.tone)
      setTargetAudience(initialData.targetAudience)
      setKeywords(initialData.keywords)
      toast.info("履歴からデータを読み込みました")
    }
  }, [initialData])

  const handleSubmit = async () => {
    if (!targetAudience.trim() || !keywords.trim()) {
      toast.error("ターゲット層とキーワードを入力してください")
      return
    }

    setIsGenerating(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    onGenerate({
      platform: selectedPlatform,
      tone,
      targetAudience,
      keywords,
    })
    setIsGenerating(false)
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          入力フォーム
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">プラットフォーム</Label>
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
                  "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200",
                  selectedPlatform === platform.value 
                    ? "bg-primary text-primary-foreground border-primary shadow-md" 
                    : "bg-card border-border hover:bg-muted"
                )}
              >
                <platform.icon />
                <span className="font-medium">{platform.label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Tone Selection */}
        <div className="space-y-3">
          <Label htmlFor="tone" className="text-sm font-medium">トーン・文体</Label>
          <Select value={tone} onValueChange={(val) => setTone(val as Tone)}>
            <SelectTrigger id="tone" className="w-full">
              <SelectValue placeholder="トーンを選択" />
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

        {/* Target Audience */}
        <div className="space-y-3">
          <Label htmlFor="audience" className="text-sm font-medium">ターゲット層</Label>
          <Input
            id="audience"
            placeholder="例: 20代OL、シニア層、学生"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Keywords */}
        <div className="space-y-3">
          <Label htmlFor="keywords" className="text-sm font-medium">キーワード・伝えたい内容</Label>
          <Textarea
            id="keywords"
            placeholder="例: 春の新作コレクション発売、期間限定20%OFF、送料無料キャンペーン実施中"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleSubmit}
          disabled={isGenerating}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/25"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              AIコンテンツを生成する
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

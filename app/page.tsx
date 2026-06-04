"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ContentForm } from "@/components/dashboard/content-form"
import { PreviewArea } from "@/components/dashboard/preview-area"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Platform, Tone } from "@/lib/types"
import { toast } from "sonner"

interface InitialFormData {
  tone: Tone
  targetAudience: string
  keywords: string
}

interface GeneratedContent {
  x: string
  instagram: string
  line: string
}

interface GenerateFormData {
  platform: Platform
  tone: Tone
  targetAudience: string
  keywords: string
}

const defaultGeneratedContent: GeneratedContent = {
  x: "【新商品発売】\n\n✨ 春の新作コレクションがついに登場！\n\nトレンドを押さえた最新アイテムを\n今すぐチェック 👇\n\n#春コーデ #新作 #ファッション",
  instagram:
    "🌸 春の新作コレクション 🌸\n\n待望の春コレクションがついに解禁！\n\n今季のトレンドカラーを取り入れた\nフレッシュなアイテムが勢揃い ✨\n\n詳しくはプロフィールのリンクから 🔗\n\n#春コーデ #新作発売 #ファッション好きな人と繋がりたい #今日のコーデ",
  line: "🎉 春の新作コレクション発売中！\n\n今なら送料無料キャンペーン実施中です。\n\n詳細はこちら ▶︎",
}

const historyStorageKey = "sns-dashboard-history"
const calendarStorageKey = "sns-dashboard-calendar-events"

const platformSuffix: Record<Platform, string> = {
  x: "\n\n#SNS運用 #新着情報",
  instagram: "\n\nプロフィールのリンクから詳細をチェックしてください。\n\n#SNSマーケティング #キャンペーン #今日のおすすめ",
  line: "\n\n詳細はこちら ▶︎",
}

const toneOpening: Record<Tone, string> = {
  business: "いつもご利用いただきありがとうございます。",
  friendly: "こんにちは！今日はおすすめのお知らせです。",
  gyaru: "え、これ見逃せないかも！",
  promo: "期間限定のお得なお知らせです。",
}

const toneClosing: Record<Tone, string> = {
  business: "ご不明点がございましたら、お気軽にお問い合わせください。",
  friendly: "気になる方はぜひチェックしてみてくださいね。",
  gyaru: "気になったら今すぐチェックしてね。",
  promo: "数量・期間限定のため、お早めにご確認ください。",
}

function readJsonArray<T>(key: string): T[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function buildGeneratedContent({
  tone,
  targetAudience,
  keywords,
}: GenerateFormData): GeneratedContent {
  const topic = keywords.trim() || "新しいお知らせ"
  const audience = targetAudience.trim() || "フォロワーの皆様"
  const base = `${toneOpening[tone]}\n\n${topic}\n\n${audience}に向けて、今伝えたいポイントをわかりやすくまとめました。\n\n${toneClosing[tone]}`

  return {
    x: `${base}${platformSuffix.x}`,
    instagram: `${base}\n\n画像では商品の魅力や利用シーンが伝わる構成がおすすめです。${platformSuffix.instagram}`,
    line: `${base}${platformSuffix.line}`,
  }
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
  const searchParams = useSearchParams()
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("x")
  const [initialFormData, setInitialFormData] = useState<InitialFormData | null>(null)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>(defaultGeneratedContent)
  const [lastFormData, setLastFormData] = useState<GenerateFormData>({
    platform: "x",
    tone: "friendly",
    targetAudience: "20代OL",
    keywords: "春の新作コレクション、期間限定セール",
  })

  useEffect(() => {
    const platformParam = searchParams.get("platform")
    const toneParam = searchParams.get("tone")
    const targetAudienceParam = searchParams.get("targetAudience")
    const keywordsParam = searchParams.get("keywords")

    const isValidPlatform = platformParam === "x" || platformParam === "instagram" || platformParam === "line"
    const isValidTone =
      toneParam === "business" ||
      toneParam === "friendly" ||
      toneParam === "gyaru" ||
      toneParam === "promo"

    if (isValidPlatform) {
      setSelectedPlatform(platformParam)
    }

    if (isValidTone || targetAudienceParam || keywordsParam) {
      setInitialFormData({
        tone: isValidTone ? toneParam : "friendly",
        targetAudience: targetAudienceParam ?? "",
        keywords: keywordsParam ?? "",
      })
      setLastFormData({
        platform: isValidPlatform ? platformParam : "x",
        tone: isValidTone ? toneParam : "friendly",
        targetAudience: targetAudienceParam ?? "",
        keywords: keywordsParam ?? "",
      })
      return
    }

    setInitialFormData(null)
  }, [searchParams])

  const handleGenerate = (formData: GenerateFormData) => {
    setSelectedPlatform(formData.platform)
    setLastFormData(formData)
    setGeneratedContent(buildGeneratedContent(formData))
    toast.success("コンテンツを生成しました", {
      description: "プレビューで各SNS向けの文面を確認できます",
    })
  }

  const handleSaveHistory = () => {
    const saved = readJsonArray<Record<string, unknown>>(historyStorageKey)
    const newRecord = {
      id: `hist-${Date.now()}`,
      platform: selectedPlatform,
      tone: lastFormData.tone,
      targetAudience: lastFormData.targetAudience || "未設定",
      keywords: lastFormData.keywords || "未設定",
      generatedContent: generatedContent[selectedPlatform],
      createdAt: new Date().toISOString(),
      status: "unused",
      isFavorite: false,
    }

    window.localStorage.setItem(historyStorageKey, JSON.stringify([newRecord, ...saved]))
    toast.success("生成履歴に保存しました", {
      description: "履歴ページから編集・再利用できます",
    })
  }

  const handleAddToCalendar = () => {
    const saved = readJsonArray<Record<string, unknown>>(calendarStorageKey)
    const scheduledAt = new Date()
    scheduledAt.setDate(scheduledAt.getDate() + 1)
    scheduledAt.setHours(12, 0, 0, 0)

    const newEvent = {
      id: `evt-${Date.now()}`,
      title: lastFormData.keywords || "生成コンテンツ投稿",
      platform: selectedPlatform,
      tone: lastFormData.tone,
      content: generatedContent[selectedPlatform],
      scheduledAt: scheduledAt.toISOString(),
      status: "scheduled",
    }

    window.localStorage.setItem(calendarStorageKey, JSON.stringify([newEvent, ...saved]))
    toast.success("投稿カレンダーに追加しました", {
      description: "明日12:00の排期として登録しました",
    })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-0 flex-1 p-6 lg:ml-64 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">コンテンツ生成</h1>
          <p className="mt-1 text-muted-foreground">AIを使ってSNS投稿を簡単に作成しましょう</p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ContentForm
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            onGenerate={handleGenerate}
            initialData={initialFormData}
          />
          <PreviewArea
            selectedPlatform={selectedPlatform}
            setSelectedPlatform={setSelectedPlatform}
            content={generatedContent}
            onSave={handleSaveHistory}
            onAddToCalendar={handleAddToCalendar}
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

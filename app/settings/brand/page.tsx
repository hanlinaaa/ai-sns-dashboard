"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/features/navigation/sidebar"
import { mockBrandSettings } from "@/domain/mock-data"
import type { BrandSettings, ContentLengthPreference, Platform, Tone } from "@/domain/types"
import { getRepositories } from "@/services/repositories"
import { toDataAccessErrorInfo } from "@/services/repositories/errors"
import { toast } from "sonner"
import { Palette, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const toneOptions: readonly Tone[] = ["business", "friendly", "gyaru", "promo"]
const contentLengthOptions: readonly ContentLengthPreference[] = ["short", "medium", "long"]
const BRAND_SETTINGS_ID = "default"

const isTone = (value: string): value is Tone => toneOptions.includes(value as Tone)

const isContentLengthPreference = (value: string): value is ContentLengthPreference =>
  contentLengthOptions.includes(value as ContentLengthPreference)

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
        description: "The settings will be applied from the next content generation.",
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

  const handleToneChange = (platform: Platform, tone: Tone) => {
    setSettings((prev) => ({
      ...prev,
      defaultTones: { ...prev.defaultTones, [platform]: tone },
    }))
  }

  const handleToneSelect = (platform: Platform, value: string) => {
    if (isTone(value)) {
      handleToneChange(platform, value)
      return
    }

    toast.error("Invalid tone selected", {
      description: "Please select a supported tone.",
    })
  }

  const handleContentLengthSelect = (value: string) => {
    if (isContentLengthPreference(value)) {
      handleChange("contentLength", value)
      return
    }

    toast.error("Invalid content length selected", {
      description: "Please select a supported content length.",
    })
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
      [field]: prev[field].filter((w) => w !== wordToRemove),
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
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold text-foreground sm:text-2xl">
                  ブランド設定
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  AIが生成するコンテンツのトーンやルールを定義します
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="h-10 w-full sm:w-auto"
            >
              {isLoading || isSaving ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              設定を保存
            </Button>
          </div>

          <Tabs defaultValue="identity" className="w-full gap-5">
            <TabsList className="grid h-auto w-full grid-cols-2 rounded-lg border bg-card p-1 shadow-sm lg:grid-cols-4">
              <TabsTrigger value="identity">基本情報</TabsTrigger>
              <TabsTrigger value="tone">トーン＆文体</TabsTrigger>
              <TabsTrigger value="safety">NGワード＆ルール</TabsTrigger>
              <TabsTrigger value="knowledge">知識ベース</TabsTrigger>
            </TabsList>

            {/* 1. Brand Identity */}
            <TabsContent value="identity" className="space-y-6">
              <Card className="rounded-lg border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>基本ブランド情報</CardTitle>
                  <CardDescription>
                    AIが「自分が誰として発信しているか」を理解するための基本コンテキストです。
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="brandName">ブランド名 / アカウント名</Label>
                    <Input
                      id="brandName"
                      value={settings.brandName}
                      onChange={(e) => handleChange("brandName", e.target.value)}
                      placeholder="例: サクサクSNS君 公式"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="brandBio">ブランドの概要・ミッション</Label>
                    <Textarea
                      id="brandBio"
                      value={settings.brandBio}
                      onChange={(e) => handleChange("brandBio", e.target.value)}
                      placeholder="例: 私たちは持続可能な環境に優しい日用品を提供するスタートアップです。"
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      この情報は、AIがブランドの価値観に沿った文章を生成するのに役立ちます。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="targetAudience">デフォルトのターゲット層</Label>
                    <Input
                      id="targetAudience"
                      value={settings.targetAudience}
                      onChange={(e) => handleChange("targetAudience", e.target.value)}
                      placeholder="例: 20代〜30代の働く女性、環境問題に関心のある層"
                    />
                    <p className="text-xs text-muted-foreground">
                      コンテンツ生成画面でのデフォルト値として使用されます。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 2. Tone & Voice */}
            <TabsContent value="tone" className="space-y-6">
              <Card className="rounded-lg border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>トーン＆文体</CardTitle>
                  <CardDescription>
                    各プラットフォームのデフォルトの語り口や、独自のルールを設定します。
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">デフォルトのトーン</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
                        <Label>X (Twitter)</Label>
                        <Select
                          value={settings.defaultTones.x}
                          onValueChange={(value) => handleToneSelect("x", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business">ビジネス敬語</SelectItem>
                            <SelectItem value="friendly">親しみやすい</SelectItem>
                            <SelectItem value="gyaru">ギャル風</SelectItem>
                            <SelectItem value="promo">セール・プロモーション</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
                        <Label>Instagram</Label>
                        <Select
                          value={settings.defaultTones.instagram}
                          onValueChange={(value) => handleToneSelect("instagram", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business">ビジネス敬語</SelectItem>
                            <SelectItem value="friendly">親しみやすい</SelectItem>
                            <SelectItem value="gyaru">ギャル風</SelectItem>
                            <SelectItem value="promo">セール・プロモーション</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 rounded-lg border bg-muted/20 p-4">
                        <Label>LINE</Label>
                        <Select
                          value={settings.defaultTones.line}
                          onValueChange={(value) => handleToneSelect("line", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business">ビジネス敬語</SelectItem>
                            <SelectItem value="friendly">親しみやすい</SelectItem>
                            <SelectItem value="gyaru">ギャル風</SelectItem>
                            <SelectItem value="promo">セール・プロモーション</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="firstPerson">一人称（自社の呼び方）</Label>
                      <Input
                        id="firstPerson"
                        value={settings.firstPerson}
                        onChange={(e) => handleChange("firstPerson", e.target.value)}
                        placeholder="例: 弊社、当社、私、〇〇（ブランド名）"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="secondPerson">二人称（顧客の呼び方）</Label>
                      <Input
                        id="secondPerson"
                        value={settings.secondPerson}
                        onChange={(e) => handleChange("secondPerson", e.target.value)}
                        placeholder="例: 皆様、お客様、フォロワーの皆様"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="customInstructions">カスタム指示（プロンプト）</Label>
                    <Textarea
                      id="customInstructions"
                      value={settings.customInstructions}
                      onChange={(e) => handleChange("customInstructions", e.target.value)}
                      placeholder="例: 文末は「〜ですよね！」を多用する。絵文字は少なめに。"
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      AIへの追加の指示です。生成されるすべての文章に影響します。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 3. Brand Safety */}
            <TabsContent value="safety" className="space-y-6">
              <Card className="rounded-lg border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>NGワード＆ルール</CardTitle>
                  <CardDescription>
                    ブランドセーフティを守るための制限やフォーマットルールを設定します。
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                      <Label>NGワード（禁止語句）</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {settings.ngWords.map((word) => (
                          <Badge
                            key={word}
                            variant="destructive"
                            className="flex items-center gap-1 pr-1"
                          >
                            {word}
                            <button
                              onClick={() => handleRemoveWord("ngWords", word)}
                              className="hover:bg-destructive-foreground/20 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="NGワードを入力してEnter"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddWord("ngWords", e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        競合他社名や、使用を避けたい表現を指定します。
                      </p>
                    </div>

                    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                      <Label>必須ワード（コアバリュー）</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {settings.mustHaveWords.map((word) => (
                          <Badge
                            key={word}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1 border-primary/20 bg-primary/10 text-primary"
                          >
                            {word}
                            <button
                              onClick={() => handleRemoveWord("mustHaveWords", word)}
                              className="hover:bg-primary/20 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="必須ワードを入力してEnter"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddWord("mustHaveWords", e.currentTarget.value)
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        必ず含めたいスローガンやキーワードを指定します。
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4 border-t">
                    <h3 className="text-sm font-medium">フォーマット制限</h3>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>絵文字の使用</Label>
                        <p className="text-xs text-muted-foreground">
                          生成される文章での絵文字の使用を許可するかどうか
                        </p>
                      </div>
                      <Switch
                        checked={settings.allowEmojis}
                        onCheckedChange={(checked) => handleChange("allowEmojis", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>ハッシュタグの使用</Label>
                        <p className="text-xs text-muted-foreground">
                          生成される文章でのハッシュタグの使用を許可するかどうか
                        </p>
                      </div>
                      <Switch
                        checked={settings.allowHashtags}
                        onCheckedChange={(checked) => handleChange("allowHashtags", checked)}
                      />
                    </div>

                    {settings.allowHashtags && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label className="text-xs">X 最大ハッシュタグ数</Label>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            value={settings.maxHashtags.x}
                            onChange={(e) =>
                              handleMaxHashtagsChange("x", parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Instagram 最大ハッシュタグ数</Label>
                          <Input
                            type="number"
                            min={0}
                            max={30}
                            value={settings.maxHashtags.instagram}
                            onChange={(e) =>
                              handleMaxHashtagsChange("instagram", parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">LINE 最大ハッシュタグ数</Label>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            value={settings.maxHashtags.line}
                            onChange={(e) =>
                              handleMaxHashtagsChange("line", parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 pt-2">
                      <Label>デフォルトの文章量</Label>
                      <Select
                        value={settings.contentLength}
                        onValueChange={handleContentLengthSelect}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">短め（簡潔に伝える）</SelectItem>
                          <SelectItem value="medium">標準</SelectItem>
                          <SelectItem value="long">長め（詳細に伝える）</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 4. Knowledge Base */}
            <TabsContent value="knowledge" className="space-y-6">
              <Card className="rounded-lg border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>知識ベース</CardTitle>
                  <CardDescription>
                    プロモーション等で頻繁に使用する固定情報を登録しておきます。
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="websiteUrl">公式ウェブサイトURL</Label>
                    <Input
                      id="websiteUrl"
                      value={settings.websiteUrl}
                      onChange={(e) => handleChange("websiteUrl", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="contactInfo">お問い合わせ情報・営業時間</Label>
                    <Input
                      id="contactInfo"
                      value={settings.contactInfo}
                      onChange={(e) => handleChange("contactInfo", e.target.value)}
                      placeholder="例: 営業時間: 平日10:00-18:00"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="disclaimer">免責事項・定型文</Label>
                    <Textarea
                      id="disclaimer"
                      value={settings.disclaimer}
                      onChange={(e) => handleChange("disclaimer", e.target.value)}
                      placeholder="例: ※キャンペーンは予告なく終了する場合があります。"
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      プロモーション投稿などの末尾に自動的に追加を検討する定型文です。
                    </p>
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

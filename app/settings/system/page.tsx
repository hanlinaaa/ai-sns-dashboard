"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { toast } from "sonner"
import { 
  Settings, 
  Save, 
  Bot, 
  Share2, 
  LineChart, 
  GitMerge, 
  Bell, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

// --- Types ---
interface SystemSettings {
  ai: {
    model: string
    apiKey: string
  }
  sns: {
    x: { apiKey: string; apiSecret: string; connected: boolean }
    instagram: { accessToken: string; connected: boolean }
    line: { channelToken: string; channelSecret: string; connected: boolean }
  }
  analytics: {
    gaId: string
  }
  workflow: {
    requireApproval: boolean
    autoCleanupDays: string
  }
  notifications: {
    emailWeeklyReport: boolean
    emailPublishStatus: boolean
    inAppToast: boolean
  }
}

// --- Mock Initial Data ---
const initialSystemSettings: SystemSettings = {
  ai: {
    model: "gpt-4o",
    apiKey: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  sns: {
    x: { apiKey: "API_KEY_XXXXXXXX", apiSecret: "API_SECRET_XXXXXXXX", connected: true },
    instagram: { accessToken: "", connected: false },
    line: { channelToken: "", channelSecret: "", connected: false },
  },
  analytics: {
    gaId: "G-XXXXXXXXXX",
  },
  workflow: {
    requireApproval: true,
    autoCleanupDays: "90",
  },
  notifications: {
    emailWeeklyReport: true,
    emailPublishStatus: true,
    inAppToast: true,
  },
}

const systemStorageKey = "sns-dashboard-system-settings"

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(initialSystemSettings)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(systemStorageKey)
      if (raw) {
        setSettings(JSON.parse(raw) as SystemSettings)
      }
    } catch {
      toast.error("保存済みシステム設定の読み込みに失敗しました")
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      window.localStorage.setItem(systemStorageKey, JSON.stringify(settings))
      toast.success("システム設定を保存しました", {
        description: "設定の変更が正常に適用されました。",
      })
    } catch (error) {
      console.error("Failed to save system settings:", error)
      toast.error("保存に失敗しました", {
        description: "通信エラーが発生しました。もう一度お試しください。",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // --- Handlers for nested state updates ---
  const updateAiSettings = (field: keyof SystemSettings["ai"], value: string) => {
    setSettings(prev => ({ ...prev, ai: { ...prev.ai, [field]: value } }))
  }

  const updateSnsSettings = (platform: keyof SystemSettings["sns"], field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      sns: {
        ...prev.sns,
        [platform]: { ...prev.sns[platform], [field]: value }
      }
    }))
  }

  const updateAnalyticsSettings = (field: keyof SystemSettings["analytics"], value: string) => {
    setSettings(prev => ({ ...prev, analytics: { ...prev.analytics, [field]: value } }))
  }

  const updateWorkflowSettings = (field: keyof SystemSettings["workflow"], value: string | boolean) => {
    setSettings(prev => ({ ...prev, workflow: { ...prev.workflow, [field]: value } }))
  }

  const updateNotificationSettings = (field: keyof SystemSettings["notifications"], value: boolean) => {
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [field]: value } }))
  }

  const handleConnectSns = (platform: keyof SystemSettings["sns"]) => {
    const isCurrentlyConnected = settings.sns[platform].connected
    if (isCurrentlyConnected) {
      // Disconnect
      updateSnsSettings(platform, "connected", false)
      toast.info(`連携を解除しました`)
    } else {
      // Connect (Mock validation)
      updateSnsSettings(platform, "connected", true)
      toast.success(`正常に連携されました`)
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar currentPath="/settings/system" />
      <main className="ml-0 w-full flex-1 px-4 py-5 sm:px-6 lg:ml-64 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-5">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 rounded-lg border bg-card/95 p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-foreground sm:text-2xl">システム設定</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                API連携、ワークフロー、通知などのシステム全体の動作を設定します
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-10 w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                変更を保存
              </>
            )}
          </Button>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="api" className="gap-5">
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-lg border bg-card p-1 shadow-sm sm:max-w-md">
            <TabsTrigger value="api">API・連携</TabsTrigger>
            <TabsTrigger value="workflow">ワークフロー</TabsTrigger>
            <TabsTrigger value="notifications">通知</TabsTrigger>
          </TabsList>

          {/* TAB 1: API & Integrations */}
          <TabsContent value="api" className="space-y-6 outline-none">
            {/* AI Model Settings */}
            <Card className="rounded-lg border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <CardTitle>AI モデル設定</CardTitle>
                </div>
                <CardDescription>
                  コンテンツ生成に使用するAIモデルとAPIキーを設定します。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="ai-model">使用モデル</Label>
                  <Select 
                    value={settings.ai.model} 
                    onValueChange={(value) => updateAiSettings("model", value)}
                  >
                    <SelectTrigger id="ai-model" className="w-full sm:w-[300px]">
                      <SelectValue placeholder="モデルを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                      <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</SelectItem>
                      <SelectItem value="gemini-1-5-pro">Gemini 1.5 Pro (Google)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ai-api-key">API キー</Label>
                  <Input
                    id="ai-api-key"
                    type="password"
                    value={settings.ai.apiKey}
                    onChange={(e) => updateAiSettings("apiKey", e.target.value)}
                    placeholder="sk-..."
                    className="max-w-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    APIキーは暗号化されて安全に保存されます。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SNS Platform Bindings */}
            <Card className="rounded-lg border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  <CardTitle>SNS 連携</CardTitle>
                </div>
                <CardDescription>
                  各SNSプラットフォームのAPI情報を設定し、一括投稿を可能にします。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* X (Twitter) */}
                <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-white"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">X (Twitter)</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {settings.sns.x.connected ? (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-[10px] h-5">連携済み</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] h-5">未連携</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant={settings.sns.x.connected ? "outline" : "default"} 
                      size="sm"
                      onClick={() => handleConnectSns("x")}
                    >
                      {settings.sns.x.connected ? "連携を解除" : "連携する"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">API Key</Label>
                      <Input 
                        type="password" 
                        value={settings.sns.x.apiKey} 
                        onChange={(e) => updateSnsSettings("x", "apiKey", e.target.value)}
                        placeholder="API Keyを入力"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">API Secret</Label>
                      <Input 
                        type="password" 
                        value={settings.sns.x.apiSecret} 
                        onChange={(e) => updateSnsSettings("x", "apiSecret", e.target.value)}
                        placeholder="API Secretを入力"
                      />
                    </div>
                  </div>
                </div>

                {/* Instagram */}
                <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-md flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Instagram</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {settings.sns.instagram.connected ? (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-[10px] h-5">連携済み</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] h-5">未連携</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant={settings.sns.instagram.connected ? "outline" : "default"} 
                      size="sm"
                      onClick={() => handleConnectSns("instagram")}
                    >
                      {settings.sns.instagram.connected ? "連携を解除" : "Facebookでログイン"}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Page Access Token</Label>
                    <Input 
                      type="password" 
                      value={settings.sns.instagram.accessToken} 
                      onChange={(e) => updateSnsSettings("instagram", "accessToken", e.target.value)}
                      placeholder="アクセストークンを入力"
                    />
                  </div>
                </div>

                {/* LINE */}
                <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#06C755] rounded-md flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">LINE Official Account</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {settings.sns.line.connected ? (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-[10px] h-5">連携済み</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] h-5">未連携</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant={settings.sns.line.connected ? "outline" : "default"} 
                      size="sm"
                      onClick={() => handleConnectSns("line")}
                    >
                      {settings.sns.line.connected ? "連携を解除" : "連携する"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Channel Access Token</Label>
                      <Input 
                        type="password" 
                        value={settings.sns.line.channelToken} 
                        onChange={(e) => updateSnsSettings("line", "channelToken", e.target.value)}
                        placeholder="チャネルアクセストークンを入力"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Channel Secret</Label>
                      <Input 
                        type="password" 
                        value={settings.sns.line.channelSecret} 
                        onChange={(e) => updateSnsSettings("line", "channelSecret", e.target.value)}
                        placeholder="チャネルシークレットを入力"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Integration */}
            <Card className="rounded-lg border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  <CardTitle>データソース連携</CardTitle>
                </div>
                <CardDescription>
                  Google Analyticsなどのアクセス解析ツールと連携し、ダッシュボードにデータを表示します。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label htmlFor="ga-id">Google Analytics 測定ID</Label>
                  <Input
                    id="ga-id"
                    value={settings.analytics.gaId}
                    onChange={(e) => updateAnalyticsSettings("gaId", e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="max-w-md"
                  />
                  <p className="text-xs text-muted-foreground">
                    ダッシュボードのKPIやグラフデータの集計に使用されます。
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Automation & Workflow */}
          <TabsContent value="workflow" className="space-y-6 outline-none">
            <Card className="rounded-lg border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-primary" />
                  <CardTitle>ワークフローと自動化</CardTitle>
                </div>
                <CardDescription>
                  コンテンツ生成から公開までのフローと、データ保存に関する自動化を設定します。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Approval Flow */}
                <div className="flex flex-col justify-between gap-4 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">デフォルトの承認フロー</Label>
                    <p className="text-sm text-muted-foreground">
                      オンにすると、すべての生成コンテンツは投稿前に「承認待ち」ステータスになります。
                    </p>
                  </div>
                  <Switch 
                    checked={settings.workflow.requireApproval}
                    onCheckedChange={(checked) => updateWorkflowSettings("requireApproval", checked)}
                  />
                </div>

                {/* Auto Cleanup */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">自動クリーンアップ</Label>
                    <p className="text-sm text-muted-foreground">
                      未使用（Unused）ステータスの履歴データを自動的に削除する期間を設定します。
                    </p>
                  </div>
                  <Select 
                    value={settings.workflow.autoCleanupDays} 
                    onValueChange={(value) => updateWorkflowSettings("autoCleanupDays", value)}
                  >
                    <SelectTrigger className="w-full sm:w-[300px]">
                      <SelectValue placeholder="削除期間を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30日経過後に削除</SelectItem>
                      <SelectItem value="60">60日経過後に削除</SelectItem>
                      <SelectItem value="90">90日経過後に削除</SelectItem>
                      <SelectItem value="never">自動削除しない</SelectItem>
                    </SelectContent>
                  </Select>
                  {settings.workflow.autoCleanupDays !== "never" && (
                    <div className="flex items-center gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        注意: 削除されたデータは復元できません。お気に入りに登録されたアイテムは削除対象外です。
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Notifications */}
          <TabsContent value="notifications" className="space-y-6 outline-none">
            <Card className="rounded-lg border-border/70 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <CardTitle>通知設定</CardTitle>
                </div>
                <CardDescription>
                  システムからの各種通知の受け取り方法を設定します。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    メール通知
                  </h3>
                  
                  <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 p-4">
                    <div className="space-y-0.5">
                      <Label>週次レポート</Label>
                      <p className="text-sm text-muted-foreground">
                        SNSのエンゲージメントや生成実績をまとめた週次レポートを受け取ります。
                      </p>
                    </div>
                    <Switch 
                      checked={settings.notifications.emailWeeklyReport}
                      onCheckedChange={(checked) => updateNotificationSettings("emailWeeklyReport", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 p-4">
                    <div className="space-y-0.5">
                      <Label>排期公開ステータス</Label>
                      <p className="text-sm text-muted-foreground">
                        スケジュールされた投稿の成功・失敗時にメールで通知を受け取ります。
                      </p>
                    </div>
                    <Switch 
                      checked={settings.notifications.emailPublishStatus}
                      onCheckedChange={(checked) => updateNotificationSettings("emailPublishStatus", checked)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    アプリ内通知
                  </h3>
                  
                  <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 p-4">
                    <div className="space-y-0.5">
                      <Label>トースト通知 (Toast)</Label>
                      <p className="text-sm text-muted-foreground">
                        操作の成功やエラーを画面右下にポップアップで表示します。
                      </p>
                    </div>
                    <Switch 
                      checked={settings.notifications.inAppToast}
                      onCheckedChange={(checked) => updateNotificationSettings("inAppToast", checked)}
                    />
                  </div>
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

"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Bell,
  Bot,
  GitMerge,
  LineChart,
  Loader2,
  Save,
  Settings,
  Share2,
} from "lucide-react"
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
import { mockSystemSettings } from "@/domain/mock-data"
import type { SystemSettings } from "@/domain/types"
import { Sidebar } from "@/features/navigation/sidebar"
import { getRepositories } from "@/services/repositories"
import { toDataAccessErrorInfo } from "@/services/repositories/errors"

const SYSTEM_SETTINGS_ID = "default"

type SnsPlatform = keyof SystemSettings["sns"]

export default function SystemSettingsPage() {
  const repositories = useMemo(() => getRepositories(), [])
  const [settings, setSettings] = useState<SystemSettings>(mockSystemSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        const savedSettings =
          await repositories.settingsRepository.systemSettings.get(SYSTEM_SETTINGS_ID)
        setSettings(savedSettings ?? mockSystemSettings)
      } catch (error) {
        const errorInfo = toDataAccessErrorInfo(error, "Failed to load system settings.")
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
        await repositories.settingsRepository.systemSettings.get(SYSTEM_SETTINGS_ID)

      if (existingSettings) {
        await repositories.settingsRepository.systemSettings.update(SYSTEM_SETTINGS_ID, settings)
      } else {
        await repositories.settingsRepository.systemSettings.create({
          ...settings,
          id: SYSTEM_SETTINGS_ID,
        })
      }
      toast.success("System settings saved", {
        description: "The workflow and integration preferences were stored successfully.",
      })
    } catch (error) {
      const errorInfo = toDataAccessErrorInfo(error, "Failed to save system settings.")
      toast.error(errorInfo.message)
    } finally {
      setIsSaving(false)
    }
  }

  const updateAiSettings = (field: keyof SystemSettings["ai"], value: string) => {
    setSettings((prev) => ({ ...prev, ai: { ...prev.ai, [field]: value } }))
  }

  const updateSnsSettings = (platform: SnsPlatform, field: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      sns: {
        ...prev.sns,
        [platform]: { ...prev.sns[platform], [field]: value },
      },
    }))
  }

  const updateAnalyticsSettings = (field: keyof SystemSettings["analytics"], value: string) => {
    setSettings((prev) => ({ ...prev, analytics: { ...prev.analytics, [field]: value } }))
  }

  const updateWorkflowSettings = (
    field: keyof SystemSettings["workflow"],
    value: string | boolean,
  ) => {
    setSettings((prev) => ({ ...prev, workflow: { ...prev.workflow, [field]: value } }))
  }

  const updateNotificationSettings = (
    field: keyof SystemSettings["notifications"],
    value: boolean,
  ) => {
    setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, [field]: value } }))
  }

  const handleConnectSns = (platform: SnsPlatform) => {
    const isCurrentlyConnected = settings.sns[platform].connected
    updateSnsSettings(platform, "connected", !isCurrentlyConnected)

    if (isCurrentlyConnected) {
      toast.info("Mock platform account disconnected.")
    } else {
      toast.success("Mock platform account connected.", {
        description: "Real OAuth posting is intentionally outside this demo scope.",
      })
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar currentPath="/settings/system" />
      <main className="ml-0 w-full flex-1 px-4 py-5 sm:px-6 lg:ml-64 lg:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-5">
          <div className="flex flex-col justify-between gap-4 rounded-lg border bg-card/95 p-4 shadow-sm sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold text-foreground sm:text-2xl">
                  System Settings
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Configure AI generation, mock SNS connections, workflow automation, and
                  notifications.
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="h-10 w-full sm:w-auto"
            >
              {isLoading || isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save changes
            </Button>
          </div>

          <Tabs defaultValue="api" className="gap-5">
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-lg border bg-card p-1 shadow-sm sm:max-w-md">
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="space-y-6 outline-none">
              <Card className="rounded-lg border-border/70 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle>AI Provider</CardTitle>
                  </div>
                  <CardDescription>
                    The server route uses OpenAI when OPENAI_API_KEY is configured and falls back to
                    deterministic mock generation for public demos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ai-model">Model label</Label>
                    <Select
                      value={settings.ai.model}
                      onValueChange={(value) => updateAiSettings("model", value)}
                    >
                      <SelectTrigger id="ai-model" className="w-full sm:w-[300px]">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="openai-compatible">OpenAI-compatible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ai-api-key">API key reference</Label>
                    <Input
                      id="ai-api-key"
                      type="password"
                      value={settings.ai.apiKey}
                      onChange={(event) => updateAiSettings("apiKey", event.target.value)}
                      placeholder="Configured through OPENAI_API_KEY on the server"
                      className="max-w-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      This UI stores demo settings only. Production API keys belong in server
                      environment variables.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg border-border/70 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    <CardTitle>SNS Mock Connectors</CardTitle>
                  </div>
                  <CardDescription>
                    Publishing is a mock queue for portfolio demonstration. Real OAuth posting is a
                    planned extension.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <MockConnectorCard
                    title="X"
                    connected={settings.sns.x.connected}
                    onToggle={() => handleConnectSns("x")}
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <SecretInput
                        label="API key"
                        value={settings.sns.x.apiKey}
                        onChange={(value) => updateSnsSettings("x", "apiKey", value)}
                      />
                      <SecretInput
                        label="API secret"
                        value={settings.sns.x.apiSecret}
                        onChange={(value) => updateSnsSettings("x", "apiSecret", value)}
                      />
                    </div>
                  </MockConnectorCard>

                  <MockConnectorCard
                    title="Instagram"
                    connected={settings.sns.instagram.connected}
                    onToggle={() => handleConnectSns("instagram")}
                  >
                    <SecretInput
                      label="Page access token"
                      value={settings.sns.instagram.accessToken}
                      onChange={(value) => updateSnsSettings("instagram", "accessToken", value)}
                    />
                  </MockConnectorCard>

                  <MockConnectorCard
                    title="LINE Official Account"
                    connected={settings.sns.line.connected}
                    onToggle={() => handleConnectSns("line")}
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <SecretInput
                        label="Channel access token"
                        value={settings.sns.line.channelToken}
                        onChange={(value) => updateSnsSettings("line", "channelToken", value)}
                      />
                      <SecretInput
                        label="Channel secret"
                        value={settings.sns.line.channelSecret}
                        onChange={(value) => updateSnsSettings("line", "channelSecret", value)}
                      />
                    </div>
                  </MockConnectorCard>
                </CardContent>
              </Card>

              <Card className="rounded-lg border-border/70 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-primary" />
                    <CardTitle>Analytics Source</CardTitle>
                  </div>
                  <CardDescription>
                    Dashboard analytics are repository-driven demo data in this portfolio build.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <Label htmlFor="ga-id">Google Analytics measurement ID</Label>
                    <Input
                      id="ga-id"
                      value={settings.analytics.gaId}
                      onChange={(event) => updateAnalyticsSettings("gaId", event.target.value)}
                      placeholder="G-XXXXXXXXXX"
                      className="max-w-md"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workflow" className="space-y-6 outline-none">
              <Card className="rounded-lg border-border/70 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <GitMerge className="h-5 w-5 text-primary" />
                    <CardTitle>Workflow Automation</CardTitle>
                  </div>
                  <CardDescription>
                    Control approval routing and cleanup behavior for generated content records.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex flex-col justify-between gap-4 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold">Require approval by default</Label>
                      <p className="text-sm text-muted-foreground">
                        Scheduled items are routed to pending approval before publishing.
                      </p>
                    </div>
                    <Switch
                      checked={settings.workflow.requireApproval}
                      onCheckedChange={(checked) =>
                        updateWorkflowSettings("requireApproval", checked)
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold">History cleanup window</Label>
                      <p className="text-sm text-muted-foreground">
                        Demo setting for when unused generated content would be cleaned up.
                      </p>
                    </div>
                    <Select
                      value={settings.workflow.autoCleanupDays}
                      onValueChange={(value) => updateWorkflowSettings("autoCleanupDays", value)}
                    >
                      <SelectTrigger className="w-full sm:w-[300px]">
                        <SelectValue placeholder="Select cleanup window" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">After 30 days</SelectItem>
                        <SelectItem value="60">After 60 days</SelectItem>
                        <SelectItem value="90">After 90 days</SelectItem>
                        <SelectItem value="never">Never clean automatically</SelectItem>
                      </SelectContent>
                    </Select>
                    {settings.workflow.autoCleanupDays !== "never" ? (
                      <div className="flex items-center gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Favorites are kept outside the cleanup target.</span>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 outline-none">
              <Card className="rounded-lg border-border/70 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle>Notifications</CardTitle>
                  </div>
                  <CardDescription>
                    Configure how demo workflow status changes are surfaced.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <NotificationSwitch
                    label="Weekly email report"
                    description="Receive a weekly summary of SNS engagement and generation volume."
                    checked={settings.notifications.emailWeeklyReport}
                    onChange={(checked) => updateNotificationSettings("emailWeeklyReport", checked)}
                  />
                  <NotificationSwitch
                    label="Publish status email"
                    description="Receive email notifications when scheduled posts succeed or fail."
                    checked={settings.notifications.emailPublishStatus}
                    onChange={(checked) =>
                      updateNotificationSettings("emailPublishStatus", checked)
                    }
                  />
                  <NotificationSwitch
                    label="In-app toast notifications"
                    description="Show operation success and error messages in the application."
                    checked={settings.notifications.inAppToast}
                    onChange={(checked) => updateNotificationSettings("inAppToast", checked)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

interface MockConnectorCardProps {
  title: string
  connected: boolean
  onToggle: () => void
  children: React.ReactNode
}

function MockConnectorCard({ title, connected, onToggle, children }: MockConnectorCardProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold">{title}</h4>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={connected ? "default" : "secondary"} className="h-5 text-[10px]">
              {connected ? "Mock connected" : "Disconnected"}
            </Badge>
          </div>
        </div>
        <Button variant={connected ? "outline" : "default"} size="sm" onClick={onToggle}>
          {connected ? "Disconnect" : "Connect mock"}
        </Button>
      </div>
      {children}
    </div>
  )
}

interface SecretInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function SecretInput({ label, value, onChange }: SecretInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Demo credential reference"
      />
    </div>
  )
}

interface NotificationSwitchProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function NotificationSwitch({ label, description, checked, onChange }: NotificationSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 p-4">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, Clock, FileText, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/components/ui/utils"
import type { HistoryRecord, Platform } from "@/domain/types"
import { InstagramIcon, LineIcon, XIcon } from "@/features/platform/platform-icons"
import type { TopContentPoint } from "@/services/analytics"

interface RecentActivityProps {
  recentHistory: HistoryRecord[]
  topContent: TopContentPoint[]
}

const platformIcons = {
  x: XIcon,
  instagram: InstagramIcon,
  line: LineIcon,
}

const platformColors: Record<Platform, string> = {
  x: "bg-slate-900 text-white",
  instagram: "bg-pink-600 text-white",
  line: "bg-emerald-600 text-white",
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const PlatformIcon = platformIcons[platform]
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        platformColors[platform],
      )}
    >
      <PlatformIcon className="h-4 w-4" />
    </div>
  )
}

export function RecentActivity({ recentHistory, topContent }: RecentActivityProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="h-4 w-4 text-primary" />
              Recent History
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
              <Link href="/history">
                History
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {recentHistory.length === 0 ? (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              Generated content will appear here.
            </div>
          ) : (
            recentHistory.map((item) => (
              <Link
                key={item.id}
                href={`/history?id=${item.id}`}
                className="group flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50"
              >
                <PlatformBadge platform={item.platform} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground transition-colors group-hover:text-primary">
                    {item.generatedContent}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Trophy className="h-4 w-4 text-primary" />
            High Performing Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {topContent.length === 0 ? (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              Publish analytics will rank top content here.
            </div>
          ) : (
            topContent.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                <PlatformBadge platform={item.platform} />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-foreground">{item.content}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{item.engagementRate.toFixed(2)}% engagement</span>
                    <span>{item.impressions.toLocaleString()} impressions</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

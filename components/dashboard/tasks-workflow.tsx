"use client"

import Link from "next/link"
import { 
  ClipboardCheck, 
  Clock, 
  Calendar,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { mockCalendarEvents } from "@/lib/calendar-mock"

const platformColors: Record<string, string> = {
  x: "bg-slate-900 text-white",
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  line: "bg-[#06C755] text-white",
}

export function TasksWorkflow() {
  // Filter scheduled events from today onwards
  const upcomingPosts = mockCalendarEvents
    .filter(e => e.status === "scheduled")
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
    .slice(0, 4)

  const getDaysUntil = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)
    return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const formatScheduledTime = (date: Date, daysUntil: number) => {
    if (daysUntil === 0) return `今日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    if (daysUntil === 1) return `明日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return (
    <div className="space-y-6">
      {/* Upcoming Posts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              即将发布排期
            </CardTitle>
            <Link href="/calendar">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                カレンダー表示 <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border" />
            
            <div className="space-y-4">
              {upcomingPosts.map((post) => {
                const daysUntil = getDaysUntil(post.scheduledAt)
                return (
                <div key={post.id} className="flex items-start gap-3 relative">
                  {/* Timeline dot */}
                  <div className={cn(
                    "relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 bg-background",
                    daysUntil <= 1 ? "border-primary" : "border-muted-foreground/30"
                  )}>
                    <Clock className={cn(
                      "w-3 h-3",
                      daysUntil <= 1 ? "text-primary" : "text-muted-foreground/50"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-[10px] px-1.5 py-0 font-medium", platformColors[post.platform])}
                      >
                        {post.platform === 'x' ? 'X' : post.platform === 'instagram' ? 'Instagram' : 'LINE'}
                      </Badge>
                      <span className="text-xs font-medium text-foreground truncate">{post.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{formatScheduledTime(post.scheduledAt, daysUntil)}</span>
                      {daysUntil === 1 && (
                        <span className="text-orange-500 font-medium bg-orange-500/10 px-1 rounded">明日</span>
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

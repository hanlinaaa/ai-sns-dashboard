"use client"

import Link from "next/link"
import { 
  FileText, 
  Clock, 
  ArrowRight,
  Sparkles,
  Download,
  UserCircle,
  Edit,
  Trash2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { XIcon, InstagramIcon, LineIcon } from "@/components/dashboard/platform-icons"

// Recent Generations Data
const recentGenerations = [
  {
    id: "1",
    content: "春の新作コレクションがついに登場！今季トレンドを...",
    platform: "x" as const,
    createdAt: "10分前",
    tone: "friendly",
  },
  {
    id: "2", 
    content: "週末限定セール開催中！今なら全品20%OFF...",
    platform: "instagram" as const,
    createdAt: "1時間前",
    tone: "promo",
  },
  {
    id: "3",
    content: "会員様限定のお得な情報をお届けします...",
    platform: "line" as const,
    createdAt: "3時間前",
    tone: "business",
  },
  {
    id: "4",
    content: "新商品入荷のお知らせです！話題のアイテムが...",
    platform: "x" as const,
    createdAt: "5時間前",
    tone: "friendly",
  },
  {
    id: "5",
    content: "フォロワー様感謝キャンペーン実施中...",
    platform: "instagram" as const,
    createdAt: "昨日",
    tone: "promo",
  },
]

const platformIcons = {
  x: XIcon,
  instagram: InstagramIcon,
  line: LineIcon,
}

const platformColors = {
  x: "bg-slate-900 text-white",
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  line: "bg-[#06C755] text-white",
}

export function RecentActivity() {
  return (
    <div className="space-y-6">
      {/* Recent Generations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              最近の生成記録
            </CardTitle>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                履歴を表示 <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {recentGenerations.map((item) => {
              const PlatformIcon = platformIcons[item.platform]
              return (
                <Link 
                  key={item.id}
                  href={`/history?id=${item.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg",
                    platformColors[item.platform]
                  )}>
                    <PlatformIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{item.createdAt}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

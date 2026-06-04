"use client"

import { 
  Zap, 
  Clock, 
  FileText, 
  TrendingUp,
  TrendingDown,
  Heart
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const kpiData = [
  {
    title: "AI 節省時間",
    subtitle: "Time Saved",
    value: "45",
    unit: "時間",
    description: "本月のAI利用で節約した時間",
    icon: Clock,
    type: "value" as const,
    highlight: true,
  },
  {
    title: "総生成コンテンツ数",
    subtitle: "Total Generated",
    value: "127",
    unit: "件",
    change: { value: 12, direction: "up" as const },
    comparedTo: "先月比",
    icon: FileText,
    type: "value" as const,
  },
  {
    title: "発文インタラクション",
    subtitle: "Total Engagement",
    value: "2,847",
    unit: "",
    subValues: [
      { label: "いいね", value: "1,923" },
      { label: "リポスト", value: "924" },
    ],
    icon: Heart,
    type: "engagement" as const,
    requiresApi: true,
  },
]

export function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {kpiData.map((kpi, index) => (
        <Card 
          key={index} 
          className={cn(
            "relative overflow-hidden transition-all duration-200 hover:shadow-md",
            kpi.highlight && "ring-2 ring-primary/20"
          )}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">{kpi.subtitle}</p>
              </div>
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl",
                kpi.highlight 
                  ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>

            {kpi.type === "value" && (
              <>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-foreground">{kpi.value}</span>
                  <span className="text-sm text-muted-foreground ml-1">{kpi.unit}</span>
                </div>
                {kpi.change ? (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={cn(
                      "flex items-center font-medium",
                      kpi.change.direction === "up" ? "text-green-600" : "text-red-600"
                    )}>
                      {kpi.change.direction === "up" ? (
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                      )}
                      {kpi.change.value}%
                    </span>
                    <span className="text-muted-foreground">{kpi.comparedTo}</span>
                  </div>
                ) : kpi.description && (
                  <p className="text-xs text-muted-foreground">{kpi.description}</p>
                )}
              </>
            )}

            {kpi.type === "engagement" && (
              <>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold text-foreground">{kpi.value}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {kpi.subValues?.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground">{sub.label}</span>
                      <span className="text-xs font-bold">{sub.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

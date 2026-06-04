"use client"

import { BarChart3, Clock, FileText, Heart, MousePointerClick } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DashboardKpi } from "@/services/analytics"

interface KPICardsProps {
  kpis: DashboardKpi
}

const numberFormatter = new Intl.NumberFormat("en-US")

export function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    {
      title: "Total Generated",
      value: numberFormatter.format(kpis.totalGenerated),
      unit: "items",
      description: "Saved content assets from history.",
      icon: FileText,
    },
    {
      title: "Publish Success",
      value: `${kpis.publishSuccessRate}`,
      unit: "%",
      description: "Succeeded jobs and published calendar items.",
      icon: BarChart3,
    },
    {
      title: "Engagement",
      value: numberFormatter.format(kpis.totalEngagement),
      unit: "actions",
      description: "Likes, comments, shares, and saves.",
      icon: Heart,
    },
    {
      title: "Clicks",
      value: numberFormatter.format(kpis.totalClicks),
      unit: "clicks",
      description: "Tracked link or CTA clicks.",
      icon: MousePointerClick,
    },
    {
      title: "Best Publish Time",
      value: kpis.bestPublishTime,
      unit: "",
      description: "Based on top historical engagement.",
      icon: Clock,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title} className="border-border/70">
          <CardContent className="p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">{card.description}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{card.value}</span>
              {card.unit ? (
                <span className="text-sm text-muted-foreground">{card.unit}</span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DashboardAnalytics } from "@/services/analytics"

interface AnalyticsChartsProps {
  analytics: DashboardAnalytics
}

const chartConfig = {
  count: {
    label: "Generated",
    color: "hsl(var(--chart-1))",
  },
  impressions: {
    label: "Impressions",
    color: "hsl(var(--chart-2))",
  },
  engagementRate: {
    label: "Engagement rate",
    color: "hsl(var(--chart-3))",
  },
}

const platformColorMap = {
  x: "hsl(var(--chart-1))",
  instagram: "hsl(var(--chart-2))",
  line: "hsl(var(--chart-3))",
}

function keywordClassName(index: number) {
  if (index < 2) return "bg-primary/15 px-4 py-2 text-base font-semibold text-primary"
  if (index < 5) return "bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary/90"
  return "bg-muted px-2.5 py-1 text-sm text-muted-foreground"
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const platformShare = analytics.platformPerformance.map((point) => ({
    ...point,
    fill: platformColorMap[point.platform],
  }))

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base font-semibold">
            <span>Generation Trend</span>
            <span className="text-xs font-normal text-muted-foreground">Past 30 days</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <LineChart data={analytics.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--chart-1))" }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <PieChart>
              <Pie
                data={platformShare}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="impressions"
                label={({ label, engagementRate }) => `${label} ${engagementRate}%`}
                labelLine={false}
              >
                {platformShare.map((entry) => (
                  <Cell key={entry.platform} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            {platformShare.map((platform) => (
              <div key={platform.platform} className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: platform.fill }}
                />
                <span className="text-xs text-muted-foreground">{platform.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Tone Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart
              data={analytics.toneUsage}
              layout="vertical"
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={85}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base font-semibold">
            <span>Keyword Signals</span>
            <span className="text-xs font-normal text-muted-foreground">
              History and high-performing content
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2 py-4">
            {analytics.topKeywords.map((item, index) => (
              <span key={item.keyword} className={`rounded-full ${keywordClassName(index)}`}>
                {item.keyword}
                <span className="ml-1 opacity-60">({item.count})</span>
              </span>
            ))}
          </div>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            {analytics.optimizationHint}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

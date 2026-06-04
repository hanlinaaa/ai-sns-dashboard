"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts"

// Generation Trend Data (past 30 days simplified to weeks)
const trendData = [
  { date: "5/1", count: 12 },
  { date: "5/5", count: 18 },
  { date: "5/9", count: 8 },
  { date: "5/13", count: 24 },
  { date: "5/17", count: 16 },
  { date: "5/21", count: 32 },
  { date: "5/25", count: 28 },
  { date: "5/29", count: 22 },
]

// Platform Distribution Data
const platformData = [
  { name: "X", value: 50, fill: "hsl(var(--chart-1))" },
  { name: "Instagram", value: 35, fill: "hsl(var(--chart-2))" },
  { name: "LINE", value: 15, fill: "hsl(var(--chart-3))" },
]

// Tone Usage Data
const toneData = [
  { tone: "親しみやすい", count: 45 },
  { tone: "ビジネス敬語", count: 38 },
  { tone: "セール", count: 28 },
  { tone: "ギャル風", count: 16 },
]

// Top Keywords
const keywordsData = [
  { keyword: "春コレクション", count: 24, size: "large" },
  { keyword: "期間限定", count: 18, size: "medium" },
  { keyword: "新商品", count: 16, size: "medium" },
  { keyword: "セール", count: 14, size: "small" },
  { keyword: "キャンペーン", count: 12, size: "small" },
  { keyword: "送料無料", count: 10, size: "small" },
  { keyword: "20代OL", count: 8, size: "small" },
  { keyword: "トレンド", count: 7, size: "small" },
]

const chartConfig = {
  count: {
    label: "生成数",
    color: "hsl(var(--chart-1))",
  },
  x: {
    label: "X",
    color: "hsl(var(--chart-1))",
  },
  instagram: {
    label: "Instagram",
    color: "hsl(var(--chart-2))",
  },
  line: {
    label: "LINE",
    color: "hsl(var(--chart-3))",
  },
}

export function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Generation Trend Chart */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            <span>コンテンツ生成トレンド</span>
            <span className="text-xs font-normal text-muted-foreground">過去30日間</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
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

      {/* Platform Distribution Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">プラットフォーム別分布</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={false}
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          <div className="flex items-center justify-center gap-4 mt-2">
            {platformData.map((platform, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: platform.fill }}
                />
                <span className="text-xs text-muted-foreground">{platform.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tone Usage Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">使用語気の傾向</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart data={toneData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="tone" 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={85}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--chart-1))" 
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Keywords Word Cloud (Simplified) */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            <span>よく使うキーワード</span>
            <span className="text-xs font-normal text-muted-foreground">受众・提示词の分析</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2 py-4">
            {keywordsData.map((item, index) => {
              const sizeClasses = {
                large: "text-lg font-bold px-4 py-2 bg-primary/15 text-primary",
                medium: "text-base font-semibold px-3 py-1.5 bg-primary/10 text-primary/90",
                small: "text-sm px-2.5 py-1 bg-muted text-muted-foreground",
              }
              return (
                <span 
                  key={index}
                  className={`rounded-full transition-all duration-200 hover:scale-105 cursor-default ${sizeClasses[item.size as keyof typeof sizeClasses]}`}
                >
                  {item.keyword}
                  <span className="ml-1 opacity-60">({item.count})</span>
                </span>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

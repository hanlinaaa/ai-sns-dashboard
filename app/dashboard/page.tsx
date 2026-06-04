"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts"
import { TasksWorkflow } from "@/components/dashboard/tasks-workflow"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">ダッシュボード</h1>
          <p className="text-muted-foreground mt-1">
            データ分析とチームの活動状況を一目で把握できます
          </p>
        </div>

        <div className="space-y-6">
          {/* 1. KPI Cards */}
          <KPICards />

          {/* 2. Charts & Analytics */}
          <AnalyticsCharts />

          {/* 3. Tasks & Workflow + 4. Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TasksWorkflow />
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  )
}

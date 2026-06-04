"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import type { AsyncDataState } from "@/domain/data-state"
import { DataErrorState, DataLoadingState } from "@/components/ui/data-state"
import { AnalyticsCharts } from "@/features/dashboard/components/analytics-charts"
import { KPICards } from "@/features/dashboard/components/kpi-cards"
import { RecentActivity } from "@/features/dashboard/components/recent-activity"
import { TasksWorkflow } from "@/features/dashboard/components/tasks-workflow"
import { Sidebar } from "@/features/navigation/sidebar"
import { createAnalyticsService, type DashboardAnalytics } from "@/services/analytics"
import { getRepositories } from "@/services/repositories"
import { toDataAccessErrorInfo } from "@/services/repositories/errors"

export default function DashboardPage() {
  const repositories = useMemo(() => getRepositories(), [])
  const analyticsService = useMemo(() => createAnalyticsService(repositories), [repositories])
  const [analyticsState, setAnalyticsState] = useState<AsyncDataState<DashboardAnalytics | null>>({
    status: "loading",
    data: null,
    error: null,
  })

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setAnalyticsState((prev) => ({ ...prev, status: "loading", error: null }))
        const analytics = await analyticsService.getDashboardAnalytics()
        setAnalyticsState({ status: "success", data: analytics, error: null })
      } catch (error) {
        const errorInfo = toDataAccessErrorInfo(error, "Failed to load dashboard analytics.")
        setAnalyticsState({ status: "error", data: null, error: errorInfo })
        toast.error(errorInfo.message)
      }
    }

    void loadDashboard()
  }, [analyticsService])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPath="/dashboard" />
      <main className="ml-0 flex-1 p-6 lg:ml-64 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Review publishing performance, operational risk, and the next optimization target.
          </p>
        </div>

        {analyticsState.status === "loading" ? (
          <DataLoadingState
            title="Loading dashboard"
            description="Fetching history, calendar, publishing, and analytics data."
          />
        ) : null}

        {analyticsState.status === "error" ? (
          <DataErrorState
            title="Dashboard is unavailable"
            description="Failed to load dashboard analytics."
            error={analyticsState.error}
          />
        ) : null}

        {analyticsState.status === "success" && analyticsState.data ? (
          <div className="space-y-6">
            <KPICards kpis={analyticsState.data.kpis} />
            <AnalyticsCharts analytics={analyticsState.data} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TasksWorkflow
                upcomingEvents={analyticsState.data.upcomingEvents}
                failedJobs={analyticsState.data.failedJobs}
              />
              <RecentActivity
                recentHistory={analyticsState.data.recentHistory}
                topContent={analyticsState.data.topContent}
              />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

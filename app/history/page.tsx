"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { HistoryFilters } from "@/components/history/history-filters"
import { HistoryTable } from "@/components/history/history-table"
import { HistoryRecord, Platform, Tone, Status } from "@/lib/types"
import { History } from "lucide-react"
import { toast } from "sonner"

// Mock data for demonstration
const mockHistoryData: HistoryRecord[] = [
  {
    id: "1",
    platform: "x",
    tone: "friendly",
    targetAudience: "20代OL",
    keywords: "春の新作コレクション、期間限定セール",
    generatedContent: "【新商品発売】\n\n✨ 春の新作コレクションがついに登場！\n\nトレンドを押さえた最新アイテムを\n今すぐチェック 👇\n\n#春コーデ #新作 #ファッション",
    createdAt: new Date("2024-01-15T10:30:00"),
    status: "published",
    isFavorite: true,
  },
  {
    id: "2",
    platform: "instagram",
    tone: "promo",
    targetAudience: "ファッション好きな女性",
    keywords: "週末限定セール、最大50%OFF",
    generatedContent: "🎉 週末限定BIG SALE 🎉\n\n最大50%OFFの特別セール開催中！\n\n人気アイテムが驚きの価格で手に入るチャンス✨\n\n期間：今週末まで\n\n詳しくはプロフィールのリンクから🔗\n\n#セール #週末限定 #お得情報",
    createdAt: new Date("2024-01-14T15:20:00"),
    status: "published",
    isFavorite: true,
  },
  {
    id: "3",
    platform: "line",
    tone: "business",
    targetAudience: "既存顧客",
    keywords: "会員限定、ポイント2倍キャンペーン",
    generatedContent: "いつもご利用いただきありがとうございます。\n\n本日より会員様限定でポイント2倍キャンペーンを開催いたします。\n\n期間：1月15日〜1月31日\n\n詳細はこちら ▶︎",
    createdAt: new Date("2024-01-13T09:00:00"),
    status: "unused",
    isFavorite: false,
  },
  {
    id: "4",
    platform: "x",
    tone: "gyaru",
    targetAudience: "10代〜20代前半",
    keywords: "新作コスメ、限定カラー",
    generatedContent: "えっ待ってまって😍💕\n\n新作コスメの限定カラーがかわいすぎる件について！！\n\nこれ絶対GETしないと後悔するやつ🥺✨\n\n#新作コスメ #限定 #かわいい",
    createdAt: new Date("2024-01-12T18:45:00"),
    status: "unused",
    isFavorite: false,
  },
  {
    id: "5",
    platform: "instagram",
    tone: "friendly",
    targetAudience: "健康志向の30代",
    keywords: "オーガニック食品、新商品入荷",
    generatedContent: "🌿 新商品入荷のお知らせ 🌿\n\n体に優しいオーガニック食品が\n続々と入荷しています！\n\n毎日の食卓をもっとヘルシーに✨\n\n#オーガニック #健康生活 #ナチュラル",
    createdAt: new Date("2024-01-11T12:00:00"),
    status: "published",
    isFavorite: false,
  },
  {
    id: "6",
    platform: "line",
    tone: "promo",
    targetAudience: "全顧客",
    keywords: "新年セール、福袋",
    generatedContent: "🎍 新年あけましておめでとうございます 🎍\n\n新春特別福袋を数量限定で販売中！\n\n最大70%OFFのお得な内容となっております。\n\n売り切れ次第終了となりますので、お早めに！",
    createdAt: new Date("2024-01-01T00:00:00"),
    status: "published",
    isFavorite: true,
  },
  {
    id: "7",
    platform: "x",
    tone: "business",
    targetAudience: "ビジネスパーソン",
    keywords: "セミナー開催、無料参加",
    generatedContent: "【無料オンラインセミナー開催】\n\n「2024年のマーケティングトレンド」\n\n日時：1月20日（土）14:00〜\n講師：マーケティング専門家\n\n参加無料・事前登録制\n\n詳細・お申し込みは👇",
    createdAt: new Date("2024-01-10T11:30:00"),
    status: "unused",
    isFavorite: false,
  },
  {
    id: "8",
    platform: "instagram",
    tone: "friendly",
    targetAudience: "カフェ好き",
    keywords: "季節限定ドリンク、バレンタイン",
    generatedContent: "💝 バレンタイン限定メニュー 💝\n\n今年もこの季節がやってきました！\n\nチョコレート×ベリーの\n甘酸っぱいドリンクが登場🍫🍓\n\n期間：2月1日〜14日\n\n#バレンタイン #限定ドリンク #カフェ巡り",
    createdAt: new Date("2024-01-08T16:20:00"),
    status: "unused",
    isFavorite: false,
  },
]

const historyStorageKey = "sns-dashboard-history"

type StoredHistoryRecord = Omit<HistoryRecord, "createdAt"> & {
  createdAt: string
}

function serializeRecords(records: HistoryRecord[]): StoredHistoryRecord[] {
  return records.map((record) => ({
    ...record,
    createdAt: record.createdAt.toISOString(),
  }))
}

function hydrateRecords(records: StoredHistoryRecord[]): HistoryRecord[] {
  return records.map((record) => ({
    ...record,
    createdAt: new Date(record.createdAt),
  }))
}

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>(mockHistoryData)
  const [searchQuery, setSearchQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all")
  const [toneFilter, setToneFilter] = useState<Tone | "all">("all")
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(historyStorageKey)
      if (raw) {
        setRecords(hydrateRecords(JSON.parse(raw) as StoredHistoryRecord[]))
      }
    } catch {
      toast.error("保存済み履歴の読み込みに失敗しました")
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    window.localStorage.setItem(historyStorageKey, JSON.stringify(serializeRecords(records)))
  }, [isHydrated, records])

  // Filter records based on all criteria
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesContent = record.generatedContent.toLowerCase().includes(query)
        const matchesKeywords = record.keywords.toLowerCase().includes(query)
        const matchesAudience = record.targetAudience.toLowerCase().includes(query)
        if (!matchesContent && !matchesKeywords && !matchesAudience) return false
      }

      // Platform filter
      if (platformFilter !== "all" && record.platform !== platformFilter) return false

      // Tone filter
      if (toneFilter !== "all" && record.tone !== toneFilter) return false

      // Status filter
      if (statusFilter !== "all" && record.status !== statusFilter) return false

      // Favorites filter
      if (showFavoritesOnly && !record.isFavorite) return false

      // Date range filter
      if (dateRange.from && record.createdAt < dateRange.from) return false
      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to)
        endOfDay.setHours(23, 59, 59, 999)
        if (record.createdAt > endOfDay) return false
      }

      return true
    })
  }, [records, searchQuery, platformFilter, toneFilter, statusFilter, showFavoritesOnly, dateRange])

  const handleToggleFavorite = (id: string) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, isFavorite: !record.isFavorite } : record
      )
    )
  }

  const handleUpdateStatus = (id: string, status: Status) => {
    setRecords((prev) =>
      prev.map((record) => (record.id === id ? { ...record, status } : record))
    )
  }

  const handleUpdateContent = (id: string, content: string) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, generatedContent: content } : record
      )
    )
  }

  const handleDeleteRecords = (ids: string[]) => {
    setRecords((prev) => prev.filter((record) => !ids.includes(record.id)))
    setSelectedIds(new Set())
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredRecords.map((r) => r.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectRecord = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const handleExport = (format: "csv" | "excel") => {
    const dataToExport = selectedIds.size > 0 
      ? filteredRecords.filter((r) => selectedIds.has(r.id))
      : filteredRecords

    const headers = ["ID", "プラットフォーム", "トーン", "ターゲット", "キーワード", "生成内容", "作成日時", "ステータス", "お気に入り"]
    const rows = dataToExport.map((r) => [
      r.id,
      r.platform,
      r.tone,
      r.targetAudience,
      r.keywords,
      r.generatedContent,
      r.createdAt.toISOString(),
      r.status,
      r.isFavorite ? "Yes" : "No",
    ])

    if (format === "csv") {
      const escapeCsv = (value: string) => `"${value.replace(/"/g, '""').replace(/\n/g, "\\n")}"`
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((value) => escapeCsv(String(value))).join(",")),
      ].join("\n")

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `history_export_${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
      toast.success("CSVをダウンロードしました")
      return
    }

    const htmlRows = [headers, ...rows]
      .map(
        (row) =>
          `<tr>${row
            .map((value) => `<td>${String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>`)
            .join("")}</tr>`
      )
      .join("")
    const workbook = `<html><head><meta charset="utf-8" /></head><body><table>${htmlRows}</table></body></html>`
    const blob = new Blob(["\uFEFF" + workbook], { type: "application/vnd.ms-excel;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `history_export_${new Date().toISOString().split("T")[0]}.xls`
    link.click()
    URL.revokeObjectURL(link.href)
    toast.success("Excelファイルをダウンロードしました")
  }

  const clearFilters = () => {
    setSearchQuery("")
    setPlatformFilter("all")
    setToneFilter("all")
    setStatusFilter("all")
    setShowFavoritesOnly(false)
    setDateRange({ from: undefined, to: undefined })
  }

  const hasActiveFilters = searchQuery || platformFilter !== "all" || toneFilter !== "all" || 
    statusFilter !== "all" || showFavoritesOnly || dateRange.from || dateRange.to

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPath="/history" />
      <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">生成履歴</h1>
              <p className="text-muted-foreground text-sm">過去に生成したコンテンツを管理・再利用できます</p>
            </div>
          </div>
        </div>

        <HistoryFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          platformFilter={platformFilter}
          onPlatformChange={setPlatformFilter}
          toneFilter={toneFilter}
          onToneChange={setToneFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          showFavoritesOnly={showFavoritesOnly}
          onFavoritesChange={setShowFavoritesOnly}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedCount={selectedIds.size}
          totalCount={filteredRecords.length}
          onExport={handleExport}
          onDeleteSelected={() => handleDeleteRecords(Array.from(selectedIds))}
          hasActiveFilters={!!hasActiveFilters}
          onClearFilters={clearFilters}
        />

        <HistoryTable
          records={filteredRecords}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectRecord={handleSelectRecord}
          onToggleFavorite={handleToggleFavorite}
          onUpdateStatus={handleUpdateStatus}
          onUpdateContent={handleUpdateContent}
          onDelete={(id) => handleDeleteRecords([id])}
        />
      </main>
    </div>
  )
}

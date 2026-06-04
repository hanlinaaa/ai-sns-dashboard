"use client"

import { useState } from "react"
import { 
  Star, 
  Copy, 
  Trash2, 
  RotateCcw, 
  Edit3, 
  Check, 
  X,
  MoreHorizontal,
  Eye,
  ExternalLink
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HistoryRecord, Status, platformLabels, toneLabels, statusLabels } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import Link from "next/link"

interface HistoryTableProps {
  records: HistoryRecord[]
  selectedIds: Set<string>
  onSelectAll: (checked: boolean) => void
  onSelectRecord: (id: string, checked: boolean) => void
  onToggleFavorite: (id: string) => void
  onUpdateStatus: (id: string, status: Status) => void
  onUpdateContent: (id: string, content: string) => void
  onDelete: (id: string) => void
}

// Platform icons
const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case "x":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    case "instagram":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    case "line":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
        </svg>
      )
    default:
      return null
  }
}

export function HistoryTable({
  records,
  selectedIds,
  onSelectAll,
  onSelectRecord,
  onToggleFavorite,
  onUpdateStatus,
  onUpdateContent,
  onDelete,
}: HistoryTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [detailRecord, setDetailRecord] = useState<HistoryRecord | null>(null)

  const allSelected = records.length > 0 && records.every((r) => selectedIds.has(r.id))
  const someSelected = records.some((r) => selectedIds.has(r.id))

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success("テキストをコピーしました")
    } catch {
      toast.error("コピーに失敗しました")
    }
  }

  const handleStartEdit = (record: HistoryRecord) => {
    setEditingId(record.id)
    setEditContent(record.generatedContent)
  }

  const handleSaveEdit = (id: string) => {
    onUpdateContent(id, editContent)
    setEditingId(null)
    toast.success("内容を保存しました")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      onDelete(deleteTargetId)
      toast.success("履歴を削除しました")
    }
    setDeleteDialogOpen(false)
    setDeleteTargetId(null)
  }

  const handleShowDetail = (record: HistoryRecord) => {
    setDetailRecord(record)
    setDetailDialogOpen(true)
  }

  // Build regeneration URL with query params
  const buildRegenerateUrl = (record: HistoryRecord) => {
    const params = new URLSearchParams({
      platform: record.platform,
      tone: record.tone,
      targetAudience: record.targetAudience,
      keywords: record.keywords,
    })
    return `/?${params.toString()}`
  }

  if (records.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">履歴が見つかりません</h3>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            検索条件に一致する履歴がありません。フィルターを変更するか、新しいコンテンツを生成してください。
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      {/* Header Row */}
      <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 rounded-t-lg border border-b-0 border-border/50">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onSelectAll}
          aria-label="すべて選択"
          className={cn(someSelected && !allSelected && "data-[state=checked]:bg-primary/50")}
        />
        <span className="text-sm font-medium text-muted-foreground flex-1">
          {selectedIds.size > 0 ? `${selectedIds.size}件選択中` : "すべて選択"}
        </span>
      </div>

      {/* Records List */}
      <div className="space-y-0 border border-t-0 border-border/50 rounded-b-lg divide-y divide-border/50">
        {records.map((record) => (
          <div
            key={record.id}
            className={cn(
              "flex gap-4 p-4 transition-colors",
              selectedIds.has(record.id) && "bg-primary/5",
              "hover:bg-muted/30"
            )}
          >
            {/* Checkbox */}
            <div className="flex items-start pt-1">
              <Checkbox
                checked={selectedIds.has(record.id)}
                onCheckedChange={(checked) => onSelectRecord(record.id, !!checked)}
                aria-label={`選択: ${record.id}`}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Meta Row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Platform Badge */}
                <Badge variant="outline" className="gap-1.5">
                  <PlatformIcon platform={record.platform} />
                  {platformLabels[record.platform]}
                </Badge>

                {/* Tone Badge */}
                <Badge variant="secondary" className="text-xs">
                  {toneLabels[record.tone]}
                </Badge>

                {/* Status Badge */}
                <Badge
                  variant={record.status === "published" ? "default" : "outline"}
                  className={cn(
                    "text-xs",
                    record.status === "published" 
                      ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20" 
                      : "text-muted-foreground"
                  )}
                >
                  {statusLabels[record.status]}
                </Badge>

                {/* Target Audience */}
                <span className="text-xs text-muted-foreground">
                  ターゲット: {record.targetAudience}
                </span>

                {/* Date */}
                <span className="text-xs text-muted-foreground ml-auto">
                  {format(record.createdAt, "yyyy/MM/dd HH:mm", { locale: ja })}
                </span>
              </div>

              {/* Content */}
              {editingId === record.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[120px] resize-none"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(record.id)}>
                      <Check className="w-4 h-4 mr-1" />
                      保存
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-1" />
                      キャンセル
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">
                  {record.generatedContent}
                </p>
              )}

              {/* Keywords */}
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">キーワード:</span> {record.keywords}
              </div>

              {/* Action Buttons */}
              {editingId !== record.id && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Favorite */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleFavorite(record.id)}
                        className={cn(
                          "h-8",
                          record.isFavorite && "text-yellow-500"
                        )}
                      >
                        <Star
                          className={cn(
                            "w-4 h-4",
                            record.isFavorite && "fill-current"
                          )}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {record.isFavorite ? "お気に入りを解除" : "お気に入りに追加"}
                    </TooltipContent>
                  </Tooltip>

                  {/* Copy */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => handleCopy(record.generatedContent)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    コピー
                  </Button>

                  {/* Regenerate */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    asChild
                  >
                    <Link href={buildRegenerateUrl(record)}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      再生成
                    </Link>
                  </Button>

                  {/* Edit */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => handleStartEdit(record)}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    編集
                  </Button>

                  {/* More Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleShowDetail(record)}>
                        <Eye className="w-4 h-4 mr-2" />
                        詳細を表示
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          onUpdateStatus(
                            record.id,
                            record.status === "published" ? "unused" : "published"
                          )
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {record.status === "published" ? "未使用に変更" : "発布済みに変更"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(record.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>この履歴を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。履歴は完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {detailRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <PlatformIcon platform={detailRecord.platform} />
                  コンテンツ詳細
                </DialogTitle>
                <DialogDescription>
                  生成時のパラメータと完全な内容を確認できます
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Generation Context */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm">生成パラメータ（Prompt Context）</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">プラットフォーム:</span>
                      <p className="font-medium">{platformLabels[detailRecord.platform]}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">トーン:</span>
                      <p className="font-medium">{toneLabels[detailRecord.tone]}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ターゲット層:</span>
                      <p className="font-medium">{detailRecord.targetAudience}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ステータス:</span>
                      <p className="font-medium">{statusLabels[detailRecord.status]}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">キーワード:</span>
                      <p className="font-medium">{detailRecord.keywords}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">生成日時:</span>
                      <p className="font-medium font-mono text-xs">
                        {detailRecord.createdAt.toISOString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Full Content */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">生成コンテンツ</h4>
                  <div className="p-4 bg-card border rounded-lg">
                    <p className="whitespace-pre-wrap text-sm">{detailRecord.generatedContent}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button onClick={() => handleCopy(detailRecord.generatedContent)}>
                    <Copy className="w-4 h-4 mr-2" />
                    コピー
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={buildRegenerateUrl(detailRecord)}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      この設定で再生成
                    </Link>
                  </Button>
                </div>

                {/* Enterprise Extension Placeholder */}
                <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                  <p className="mb-1">Enterprise機能プレースホルダー</p>
                  <p className="text-xs">承認フロー / SNS直接投稿API連携</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

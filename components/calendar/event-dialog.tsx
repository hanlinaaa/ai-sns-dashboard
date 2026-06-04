"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarEvent } from "@/lib/calendar-mock"
import { Platform, Status, Tone } from "@/lib/types"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PreviewArea } from "@/components/dashboard/preview-area"
import { Calendar, Clock, Trash2, History } from "lucide-react"

interface EventDialogProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent | null
  initialDate: Date | null
  onSave: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
}

export function EventDialog({ isOpen, onClose, event, initialDate, onSave, onDelete }: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [platform, setPlatform] = useState<Platform>("x")
  const [tone, setTone] = useState<Tone>("friendly")
  const [content, setContent] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [status, setStatus] = useState<Status>("scheduled")

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setPlatform(event.platform)
      setTone(event.tone)
      setContent(event.content)
      setDate(format(event.scheduledAt, "yyyy-MM-dd"))
      setTime(format(event.scheduledAt, "HH:mm"))
      setStatus(event.status)
    } else if (initialDate) {
      setTitle("")
      setPlatform("x")
      setTone("friendly")
      setContent("")
      setDate(format(initialDate, "yyyy-MM-dd"))
      setTime("12:00")
      setStatus("scheduled")
    }
  }, [event, initialDate, isOpen])

  const handleSave = () => {
    if (!title || !content || !date || !time) return

    const [year, month, day] = date.split("-").map(Number)
    const [hours, minutes] = time.split(":").map(Number)
    const scheduledAt = new Date(year, month - 1, day, hours, minutes)

    onSave({
      id: event ? event.id : `evt-${Date.now()}`,
      title,
      platform,
      tone,
      content,
      scheduledAt,
      status,
    })
  }

  const handleImportHistory = () => {
    setTitle("インポートした投稿")
    setContent("【新商品】\n履歴からインポートされた内容です！\nぜひチェックしてください✨")
    setPlatform("instagram")
    setTone("promo")
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto custom-scrollbar">
        <SheetHeader className="mb-6">
          <SheetTitle>{event ? "排期の編集" : "新規排期"}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>タイトル</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="例: 週末セール告知" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>プラットフォーム</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="x">X (Twitter)</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="line">LINE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>ステータス</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">下書き</SelectItem>
                  <SelectItem value="scheduled">排期済み</SelectItem>
                  <SelectItem value="published">公開済</SelectItem>
                  <SelectItem value="failed">エラー</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>日付</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>時間</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>内容</Label>
              {!event && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleImportHistory}>
                  <History className="w-3 h-3 mr-1" />
                  履歴からインポート
                </Button>
              )}
            </div>
            <Textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="min-h-[150px]"
            />
          </div>

          {content && (
            <div className="space-y-3 pt-4 border-t">
              <Label>プレビュー</Label>
              <div className="pointer-events-none opacity-90 scale-95 origin-top">
                <PreviewArea 
                  selectedPlatform={platform} 
                  setSelectedPlatform={() => {}} 
                  content={{
                    x: platform === "x" ? content : "",
                    instagram: platform === "instagram" ? content : "",
                    line: platform === "line" ? content : "",
                  }} 
                />
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-8 flex-col sm:flex-row gap-3 sm:gap-0">
          {event && (
            <Button variant="destructive" onClick={() => onDelete(event.id)} className="sm:mr-auto">
              <Trash2 className="w-4 h-4 mr-2" />
              削除
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>
            保存する
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

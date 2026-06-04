import { Platform, Status, Tone } from "./types"
import { addDays, startOfToday, setHours, setMinutes } from "date-fns"

export interface CalendarEvent {
  id: string
  title: string
  platform: Platform
  tone: Tone
  content: string
  scheduledAt: Date
  status: Status
  historyId?: string
}

const today = startOfToday()

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "週末セール告知",
    platform: "x",
    tone: "promo",
    content: "【今週末限定】\n\n全品20%OFFのビッグセールを開催中！\n欲しかったあのアイテムをお得にGETするチャンスです✨\n\n👇今すぐチェック\n#セール #週末限定",
    scheduledAt: setMinutes(setHours(addDays(today, 1), 10), 0), // tomorrow 10:00
    status: "scheduled",
  },
  {
    id: "evt-2",
    title: "新商品ティザー",
    platform: "instagram",
    tone: "friendly",
    content: "🌟 新コレクション予告 🌟\n\n来週、待望の春の新作コレクションが解禁となります！\n\n少しだけお見せしちゃいます🤫\nどんなアイテムがあるか、お楽しみに✨\n\n#新作 #春コーデ",
    scheduledAt: setMinutes(setHours(addDays(today, 1), 18), 0), // tomorrow 18:00
    status: "scheduled",
  },
  {
    id: "evt-3",
    title: "会員限定クーポン",
    platform: "line",
    tone: "business",
    content: "いつもご利用ありがとうございます。\n\nLINE友だち限定で、今すぐ使える【500円OFFクーポン】をプレゼント🎁\n\n有効期限：今月末まで\nぜひこの機会にご利用ください！",
    scheduledAt: setMinutes(setHours(addDays(today, 2), 12), 0), // day after tomorrow 12:00
    status: "draft",
  },
  {
    id: "evt-4",
    title: "月初キャンペーン",
    platform: "x",
    tone: "friendly",
    content: "🌸 新しい月のスタート！ 🌸\n\n今月も皆様にワクワクする情報をお届けします✨\nまずは第1弾のキャンペーンから...\n\n詳細はスレッドへ👇",
    scheduledAt: setMinutes(setHours(addDays(today, 3), 9), 0), // +3 days 09:00
    status: "published",
  },
  {
    id: "evt-5",
    title: "トラブルお詫び",
    platform: "x",
    tone: "business",
    content: "【お詫び】\n現在、システムの一部に障害が発生しております。\n復旧に向けて対応中です。ご迷惑をおかけし、誠に申し訳ございません。",
    scheduledAt: setMinutes(setHours(today, 8), 0), // today 08:00
    status: "failed",
  },
]

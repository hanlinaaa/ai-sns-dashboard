"use client"

import { Copy, Save, ImagePlus, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, CalendarPlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface PreviewAreaProps {
  selectedPlatform: "x" | "instagram" | "line"
  setSelectedPlatform: (platform: "x" | "instagram" | "line") => void
  content: {
    x: string
    instagram: string
    line: string
  }
  onSave?: () => void
  onAddToCalendar?: () => void
}

export function PreviewArea({
  selectedPlatform,
  setSelectedPlatform,
  content,
  onSave,
  onAddToCalendar,
}: PreviewAreaProps) {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("テキストをコピーしました")
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
      return
    }

    toast.success("データベースに保存しました")
  }

  const handleAddToCalendar = () => {
    if (onAddToCalendar) {
      onAddToCalendar()
      return
    }

    toast.success("カレンダーの排期に追加しました", {
      description: "投稿カレンダーページから確認できます",
    })
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10">
            <span className="text-lg">📱</span>
          </div>
          プレビュー
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as "x" | "instagram" | "line")}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="x" className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </TabsTrigger>
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              LINE
            </TabsTrigger>
          </TabsList>

          {/* X Preview */}
          <TabsContent value="x" className="mt-0">
            <div className="bg-muted/30 rounded-2xl p-4">
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden max-w-sm mx-auto">
                {/* X Post Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm">
                      T
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-foreground text-sm">田中 太郎</span>
                        <svg className="w-4 h-4 text-primary" viewBox="0 0 22 22" fill="currentColor">
                          <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                        </svg>
                      </div>
                      <span className="text-muted-foreground text-sm">@tanaka_taro</span>
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-foreground text-sm whitespace-pre-line leading-relaxed">
                    {content.x}
                  </p>
                  <p className="mt-3 text-muted-foreground text-xs">午後3:24 · 2024年3月15日</p>
                </div>
                {/* X Post Actions */}
                <div className="px-4 py-3 border-t border-border flex items-center justify-between text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">24</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-xs">12</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">156</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Instagram Preview */}
          <TabsContent value="instagram" className="mt-0">
            <div className="bg-muted/30 rounded-2xl p-4">
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden max-w-sm mx-auto">
                {/* Instagram Header */}
                <div className="p-3 flex items-center gap-3 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xs">
                        T
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground text-sm">tanaka_taro</span>
                  <MoreHorizontal className="w-5 h-5 text-foreground ml-auto" />
                </div>
                {/* Instagram Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-3 border-b border-border">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <ImagePlus className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">画像を生成 (DALL-E)</p>
                    <p className="text-xs text-muted-foreground mt-1">クリックして画像を生成</p>
                  </div>
                </div>
                {/* Instagram Actions */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <Heart className="w-6 h-6 text-foreground cursor-pointer hover:text-red-500 transition-colors" />
                      <MessageCircle className="w-6 h-6 text-foreground cursor-pointer hover:text-primary transition-colors" />
                      <Send className="w-6 h-6 text-foreground cursor-pointer hover:text-primary transition-colors" />
                    </div>
                    <Bookmark className="w-6 h-6 text-foreground cursor-pointer hover:text-primary transition-colors" />
                  </div>
                  <p className="font-semibold text-foreground text-sm mb-1">1,234 いいね</p>
                  <p className="text-foreground text-sm">
                    <span className="font-semibold">tanaka_taro</span>{" "}
                    <span className="whitespace-pre-line">{content.instagram}</span>
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* LINE Preview */}
          <TabsContent value="line" className="mt-0">
            <div className="bg-muted/30 rounded-2xl p-4">
              <div className="bg-[#7494C0] rounded-xl overflow-hidden max-w-sm mx-auto">
                {/* LINE Header */}
                <div className="bg-[#5B7A99] px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xs">
                      T
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">サクサクSNS君</p>
                    <p className="text-white/70 text-xs">公式アカウント</p>
                  </div>
                </div>
                {/* LINE Messages */}
                <div className="p-4 min-h-[200px] space-y-3">
                  <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xs">
                        S
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%] shadow-sm">
                      <p className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">
                        {content.line}
                      </p>
                    </div>
                  </div>
                  {/* Rich Menu Placeholder */}
                  <div className="mt-4 bg-white/90 rounded-xl p-3 flex items-center justify-center">
                    <div className="text-center">
                      <ImagePlus className="w-6 h-6 text-primary mx-auto mb-1" />
                      <p className="text-xs text-gray-600">リッチメニュー画像</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => handleCopy(content[selectedPlatform])}
          >
            <Copy className="w-4 h-4 mr-2" />
            テキストをコピー
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            保存する
          </Button>
          <Button 
            variant="default"
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={handleAddToCalendar}
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            カレンダーに追加
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Sparkles,
  History,
  Menu,
  X,
  Zap,
  Calendar,
  Palette,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/components/ui/utils"
import { Button } from "@/components/ui/button"

interface NavigationItem {
  icon: LucideIcon
  label: string
  href: string
  description: string
  badge?: string | number
}

const workspaceItems: NavigationItem[] = [
  { icon: LayoutDashboard, label: "ダッシュボード", href: "/dashboard", description: "分析・概要" },
  { icon: Sparkles, label: "コンテンツ生成", href: "/", description: "メインワークスペース" },
  { icon: Calendar, label: "投稿カレンダー", href: "/calendar", description: "投稿スケジュール" },
  { icon: History, label: "生成履歴", href: "/history", description: "アセット管理" },
]

const settingsItems: NavigationItem[] = [
  { icon: Palette, label: "ブランド設定", href: "/settings/brand", description: "トーン・NG語" },
  { icon: Settings, label: "システム設定", href: "/settings/system", description: "API・連携" },
]

interface SidebarProps {
  currentPath?: string
}

export function Sidebar({ currentPath }: SidebarProps) {
  const pathname = usePathname()
  const activePath = currentPath || pathname
  const [isOpen, setIsOpen] = useState(false)

  const isActivePath = (href: string) => {
    if (href === "/") return activePath === "/"
    return activePath.startsWith(href)
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-sidebar-foreground">サクサクSNS君</h1>
                <p className="text-xs text-sidebar-foreground/60">AI Content Generator</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Workspace Section */}
            <div>
              <div className="flex items-center gap-2 px-3 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  ワークスペース
                </span>
                <div className="flex-1 h-px bg-sidebar-border/50" />
              </div>
              <div className="space-y-1">
                {workspaceItems.map((item) => {
                  const isActive = isActivePath(item.href)
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-[18px] h-[18px] flex-shrink-0",
                          isActive
                            ? "text-sidebar-primary"
                            : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Settings Section */}
            <div>
              <div className="flex items-center gap-2 px-3 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  管理
                </span>
                <div className="flex-1 h-px bg-sidebar-border/50" />
              </div>
              <div className="space-y-1">
                {settingsItems.map((item) => {
                  const isActive = isActivePath(item.href)
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-[18px] h-[18px] flex-shrink-0",
                          isActive
                            ? "text-sidebar-primary"
                            : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70",
                        )}
                      />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  )
}

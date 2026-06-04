"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  History,
  LayoutDashboard,
  Menu,
  Palette,
  Settings,
  Sparkles,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/ui/utils"

interface NavigationItem {
  icon: LucideIcon
  label: string
  href: string
  description: string
  badge?: string | number
}

const workspaceItems: NavigationItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    description: "Analytics overview",
  },
  {
    icon: Sparkles,
    label: "Content",
    href: "/",
    description: "AI generation workspace",
  },
  {
    icon: Calendar,
    label: "Calendar",
    href: "/calendar",
    description: "Publishing schedule",
  },
  {
    icon: History,
    label: "History",
    href: "/history",
    description: "Content asset management",
  },
]

const settingsItems: NavigationItem[] = [
  {
    icon: Palette,
    label: "Brand Settings",
    href: "/settings/brand",
    description: "Tone and safety rules",
  },
  {
    icon: Settings,
    label: "System Settings",
    href: "/settings/system",
    description: "API and workflow",
  },
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
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-sidebar-border p-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">AI SNS Ops</h1>
                <p className="text-xs text-sidebar-foreground/60">Content Dashboard</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto p-4">
            <div>
              <div className="mb-2 flex items-center gap-2 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  Workspace
                </span>
                <div className="h-px flex-1 bg-sidebar-border/50" />
              </div>
              <div className="space-y-1">
                {workspaceItems.map((item) => {
                  const isActive = isActivePath(item.href)
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      title={item.description}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          isActive
                            ? "text-sidebar-primary"
                            : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70",
                        )}
                      />
                      <span className="truncate text-sm font-medium">{item.label}</span>
                      {item.badge ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  Admin
                </span>
                <div className="h-px flex-1 bg-sidebar-border/50" />
              </div>
              <div className="space-y-1">
                {settingsItems.map((item) => {
                  const isActive = isActivePath(item.href)
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      title={item.description}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          isActive
                            ? "text-sidebar-primary"
                            : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70",
                        )}
                      />
                      <span className="truncate text-sm font-medium">{item.label}</span>
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

"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Search,
  Trophy,
  HeadphonesIcon,
  History,
  Settings,
  LogOut,
  User,
  Globe,
  Zap,
  DollarSign,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

const navItems = [
  { icon: User, label: "My Profile", href: "/profile" },
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: BarChart3, label: "Statistics", href: "/statistics" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Trophy, label: "Leaders", href: "/leaders" },
  { icon: HeadphonesIcon, label: "Support Service", href: "/support" },
  { icon: History, label: "History", href: "/history" },
  { icon: DollarSign, label: "Trade", href: "/trade" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [notifications, setNotifications] = useState(true)
  const [sound, setSound] = useState(false)

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Profile Section */}
      <div className="flex flex-col items-center gap-3 p-6 border-b border-sidebar-border">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-neon-blue via-neon-cyan to-neon-green p-[3px] animate-pulse">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-sidebar">
              <div className="relative">
                <Globe className="h-12 w-12 text-neon-cyan" />
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-neon-green animate-ping" />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-neon-green to-neon-cyan flex items-center justify-center shadow-lg">
            <Zap className="h-3.5 w-3.5 text-background" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-lg text-sidebar-foreground">ScraperPro</h3>
          <p className="text-xs text-neon-cyan font-medium">Pro Max User</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-neon-blue/20 via-neon-cyan/10 to-transparent text-neon-cyan border-l-[3px] border-neon-cyan shadow-lg shadow-neon-cyan/10"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-1"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 transition-colors", isActive && "text-neon-cyan")} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings Toggles */}
      <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Notifications</span>
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
            className="data-[state=checked]:bg-neon-green"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Sound</span>
          <Switch
            checked={sound}
            onCheckedChange={setSound}
            className="data-[state=checked]:bg-neon-blue"
          />
        </div>
      </div>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all duration-300">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}

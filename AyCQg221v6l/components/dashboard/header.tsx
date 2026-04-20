"use client"

import { Search, Bell, Menu, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface HeaderProps {
  onMenuClick?: () => void
  title?: string
}

export function Header({ onMenuClick, title = "Dashboard" }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/30 backdrop-blur-sm px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2.5 hover:bg-muted transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-blue via-neon-cyan to-neon-green shadow-lg shadow-neon-cyan/20">
            <span className="text-sm font-bold text-background">SP</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-72 bg-muted/30 pl-10 border-border/50 rounded-xl focus:border-neon-cyan focus:ring-neon-cyan/20 transition-all"
          />
        </div>

        <Link 
          href="/settings"
          className="relative rounded-xl p-2.5 hover:bg-muted transition-colors"
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Link>

        <button className="relative rounded-xl p-2.5 hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-neon-green animate-pulse" />
        </button>

        <div className="ml-2 h-9 w-9 rounded-xl bg-gradient-to-br from-neon-blue to-neon-cyan p-[2px]">
          <div className="h-full w-full rounded-[10px] bg-card flex items-center justify-center">
            <span className="text-xs font-bold text-neon-cyan">PM</span>
          </div>
        </div>
      </div>
    </header>
  )
}

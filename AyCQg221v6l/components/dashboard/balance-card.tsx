"use client"

import { CreditCard, TrendingUp, ArrowUpRight, Database, Globe, Zap, FileJson } from "lucide-react"
import { cn } from "@/lib/utils"

export function BalanceCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-neon-blue/30 bg-gradient-to-br from-deep-blue/40 via-card to-neon-cyan/10 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-neon-cyan uppercase tracking-wider">Current Balance</span>
        <div className="flex items-center gap-1 text-xs text-neon-green">
          <span>+1380</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </div>

      {/* Balance */}
      <div className="mb-6">
        <span className="text-4xl font-bold text-neon-green">7,500</span>
        <span className="ml-1 text-lg text-neon-green/70">Credits</span>
      </div>

      {/* Card details (masked) */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-neon-cyan/60" />
            ))}
          </div>
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-neon-cyan/60" />
            ))}
          </div>
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-neon-cyan/60" />
            ))}
          </div>
          <span className="text-sm text-neon-cyan">4582</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>**/**</span>
          <span>***</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Database, label: "Storage" },
          { icon: Globe, label: "Proxies" },
          { icon: Zap, label: "Speed" },
          { icon: FileJson, label: "Export" },
        ].map((item) => (
          <button
            key={item.label}
            className="flex flex-col items-center gap-1 rounded-lg bg-background/30 p-2 text-xs text-muted-foreground hover:bg-background/50 hover:text-neon-cyan transition-all"
          >
            <item.icon className="h-4 w-4" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-neon-blue/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-neon-cyan/10 blur-2xl" />
    </div>
  )
}

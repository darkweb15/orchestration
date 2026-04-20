"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  gradient?: "blue" | "green" | "cyan" | "purple"
}

const gradientStyles = {
  blue: "from-neon-blue/20 to-deep-blue/10 border-neon-blue/30",
  green: "from-neon-green/20 to-neon-green/5 border-neon-green/30",
  cyan: "from-neon-cyan/20 to-neon-cyan/5 border-neon-cyan/30",
  purple: "from-chart-5/20 to-chart-5/5 border-chart-5/30",
}

const iconStyles = {
  blue: "text-neon-blue",
  green: "text-neon-green",
  cyan: "text-neon-cyan",
  purple: "text-chart-5",
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  gradient = "blue",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 transition-all duration-300 hover:scale-[1.02]",
        gradientStyles[gradient]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                "text-sm font-medium",
                changeType === "positive" && "text-neon-green",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg bg-background/50",
            iconStyles[gradient]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Decorative glow */}
      <div
        className={cn(
          "absolute -bottom-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-30",
          gradient === "blue" && "bg-neon-blue",
          gradient === "green" && "bg-neon-green",
          gradient === "cyan" && "bg-neon-cyan",
          gradient === "purple" && "bg-chart-5"
        )}
      />
    </div>
  )
}

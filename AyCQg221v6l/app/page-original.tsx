"use client"

import {
  Globe,
  Database,
  Zap,
  Clock,
  TrendingUp,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ScrapingChart } from "@/components/dashboard/scraping-chart"
import { DonutChartCard, SourcesDonutChart } from "@/components/dashboard/donut-chart"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { WeeklyBarChart } from "@/components/dashboard/mini-chart"
import { CalendarWidget } from "@/components/dashboard/calendar-widget"
import { DetailedLineChart } from "@/components/dashboard/line-chart"
import { cn } from "@/lib/utils"

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  gradient,
}: {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ElementType
  gradient: "blue" | "green" | "cyan" | "purple"
}) {
  const gradients = {
    blue: "from-neon-blue/20 to-transparent border-neon-blue/30",
    green: "from-neon-green/20 to-transparent border-neon-green/30",
    cyan: "from-neon-cyan/20 to-transparent border-neon-cyan/30",
    purple: "from-deep-blue/20 to-transparent border-deep-blue/30",
  }

  const iconBg = {
    blue: "bg-neon-blue/20 text-neon-blue",
    green: "bg-neon-green/20 text-neon-green",
    cyan: "bg-neon-cyan/20 text-neon-cyan",
    purple: "bg-deep-blue/20 text-deep-blue",
  }

  return (
    <div className={cn(
      "rounded-2xl bg-gradient-to-br p-5 border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
      gradients[gradient]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <div className="flex items-center gap-1.5">
            {changeType === "positive" && <ArrowUpRight className="h-4 w-4 text-neon-green" />}
            {changeType === "negative" && <ArrowDownRight className="h-4 w-4 text-destructive" />}
            <span className={cn(
              "text-xs font-medium",
              changeType === "positive" && "text-neon-green",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {change}
            </span>
          </div>
        </div>
        <div className={cn("rounded-xl p-3", iconBg[gradient])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

// Balance Card Component
function BalanceCard() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-neon-blue via-deep-blue to-neon-cyan p-[1px] shadow-lg shadow-neon-blue/20">
      <div className="rounded-2xl bg-card/95 backdrop-blur-sm p-5 h-full">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Balance</p>
          <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-0.5 rounded-full font-medium">+1300 $</span>
        </div>
        <p className="text-4xl font-bold bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent mb-4">
          7,500 $
        </p>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-neon-cyan/30" />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>****/**</span>
          <span>*** ***</span>
        </div>
        <div className="flex gap-2 mt-5">
          {["Statistic", "Transfer", "Card", "Shopping", "Other"].map((label, i) => (
            <button
              key={label}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-xs font-medium transition-all",
                i === 0
                  ? "bg-gradient-to-r from-neon-blue to-neon-cyan text-background"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="flex gap-6 p-6">
        {/* Left/Center Content */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Top Row - Balance Card + Main Chart */}
          <div className="grid gap-6 lg:grid-cols-3">
            <BalanceCard />
            <div className="lg:col-span-2">
              <ScrapingChart />
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Scraped"
              value="124,847"
              change="+12.5% from last month"
              changeType="positive"
              icon={Globe}
              gradient="blue"
            />
            <StatCard
              title="Data Stored"
              value="48.2 GB"
              change="+8.2% from last month"
              changeType="positive"
              icon={Database}
              gradient="green"
            />
            <StatCard
              title="Avg Response"
              value="1.2s"
              change="-15% faster"
              changeType="positive"
              icon={Zap}
              gradient="cyan"
            />
            <StatCard
              title="Active Jobs"
              value="23"
              change="5 queued"
              changeType="neutral"
              icon={Clock}
              gradient="purple"
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <DetailedLineChart />
            <div className="grid gap-6">
              <ActivityFeed />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Success Rate"
              value="94.2%"
              change="+2.1% improvement"
              changeType="positive"
              icon={TrendingUp}
              gradient="green"
            />
            <StatCard
              title="Proxies Active"
              value="156"
              change="12 rotating"
              changeType="neutral"
              icon={Shield}
              gradient="blue"
            />
            <div className="sm:col-span-2">
              <WeeklyBarChart />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden w-80 shrink-0 space-y-6 2xl:flex 2xl:flex-col">
          <DonutChartCard />
          <CalendarWidget />
          <SourcesDonutChart />
        </div>
      </div>
    </DashboardLayout>
  )
}

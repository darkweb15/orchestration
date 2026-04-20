"use client"

import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const activities = [
  {
    id: 1,
    status: "success",
    title: "Amazon Products Scrape",
    description: "Extracted 2,450 product listings",
    time: "2 min ago",
    url: "amazon.com/electronics",
  },
  {
    id: 2,
    status: "success",
    title: "Twitter API Fetch",
    description: "Collected 1,200 tweets with hashtag #tech",
    time: "15 min ago",
    url: "twitter.com/api/v2",
  },
  {
    id: 3,
    status: "failed",
    title: "LinkedIn Profiles",
    description: "Rate limited - 403 Forbidden",
    time: "32 min ago",
    url: "linkedin.com/in/*",
  },
  {
    id: 4,
    status: "pending",
    title: "News Articles Batch",
    description: "Processing 500 URLs...",
    time: "1 hr ago",
    url: "news.ycombinator.com",
  },
  {
    id: 5,
    status: "warning",
    title: "Instagram Posts",
    description: "Partial success - 80% completed",
    time: "2 hr ago",
    url: "instagram.com/explore",
  },
]

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: "text-neon-green",
    bg: "bg-neon-green/10",
  },
  failed: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  pending: {
    icon: Clock,
    color: "text-neon-cyan",
    bg: "bg-neon-cyan/10",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
  },
}

export function ActivityFeed() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => {
          const config = statusConfig[activity.status as keyof typeof statusConfig]
          const Icon = config.icon

          return (
            <div
              key={activity.id}
              className="group flex items-start gap-3 rounded-lg p-3 transition-all hover:bg-muted/50"
            >
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", config.bg)}>
                <Icon className={cn("h-5 w-5", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium text-foreground truncate">{activity.title}</h4>
                  <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                <p className="text-xs text-primary/70 truncate mt-1">{activity.url}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

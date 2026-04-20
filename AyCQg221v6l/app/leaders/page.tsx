"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Trophy, Medal, Award, Crown, TrendingUp, Database, Zap, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

const leaderboardData = [
  { rank: 1, name: "DataMaster Pro", avatar: "DM", score: 2847523, requests: "2.8M", success: "99.2%", badge: "gold" },
  { rank: 2, name: "ScrapeLord", avatar: "SL", score: 2456789, requests: "2.4M", success: "98.7%", badge: "silver" },
  { rank: 3, name: "WebCrawler X", avatar: "WX", score: 2123456, requests: "2.1M", success: "98.1%", badge: "bronze" },
  { rank: 4, name: "ProxyKing", avatar: "PK", score: 1987654, requests: "1.9M", success: "97.8%", badge: null },
  { rank: 5, name: "DataHunter", avatar: "DH", score: 1876543, requests: "1.8M", success: "97.5%", badge: null },
  { rank: 6, name: "InfoMiner", avatar: "IM", score: 1765432, requests: "1.7M", success: "97.2%", badge: null },
  { rank: 7, name: "WebSpider", avatar: "WS", score: 1654321, requests: "1.6M", success: "96.9%", badge: null },
  { rank: 8, name: "ScraperElite", avatar: "SE", score: 1543210, requests: "1.5M", success: "96.5%", badge: null },
  { rank: 9, name: "DataNinja", avatar: "DN", score: 1432109, requests: "1.4M", success: "96.2%", badge: null },
  { rank: 10, name: "CrawlMaster", avatar: "CM", score: 1321098, requests: "1.3M", success: "95.8%", badge: null },
]

const badgeStyles = {
  gold: { bg: "bg-gradient-to-br from-yellow-500 to-amber-600", text: "text-yellow-400", glow: "shadow-yellow-500/30" },
  silver: { bg: "bg-gradient-to-br from-gray-300 to-gray-400", text: "text-gray-300", glow: "shadow-gray-400/30" },
  bronze: { bg: "bg-gradient-to-br from-amber-700 to-amber-900", text: "text-amber-600", glow: "shadow-amber-600/30" },
}

export default function LeadersPage() {
  return (
    <DashboardLayout title="Leaderboard">
      <div className="p-6 space-y-6">
        {/* Top 3 Podium */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Second Place */}
          <div className="order-1 md:order-1 rounded-2xl border border-gray-400/30 bg-gradient-to-br from-gray-400/10 to-transparent p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 p-[2px] mx-auto">
                <div className="h-full w-full rounded-[14px] bg-card flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-300">SL</span>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
                <Medal className="h-4 w-4 text-background" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground mb-1">ScrapeLord</p>
            <p className="text-3xl font-bold text-gray-300 mb-2">2,456,789</p>
            <p className="text-sm text-muted-foreground">2nd Place</p>
          </div>

          {/* First Place */}
          <div className="order-0 md:order-2 rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent p-6 text-center md:-mt-4">
            <div className="relative inline-block mb-4">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 p-[3px] mx-auto shadow-lg shadow-yellow-500/30">
                <div className="h-full w-full rounded-[13px] bg-card flex items-center justify-center">
                  <span className="text-3xl font-bold text-yellow-400">DM</span>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                <Crown className="h-5 w-5 text-background" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">DataMaster Pro</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mb-2">
              2,847,523
            </p>
            <p className="text-sm text-yellow-400 font-medium">Champion</p>
          </div>

          {/* Third Place */}
          <div className="order-2 md:order-3 rounded-2xl border border-amber-700/30 bg-gradient-to-br from-amber-700/10 to-transparent p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 p-[2px] mx-auto">
                <div className="h-full w-full rounded-[14px] bg-card flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-600">WX</span>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-amber-700 flex items-center justify-center">
                <Award className="h-4 w-4 text-background" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground mb-1">WebCrawler X</p>
            <p className="text-3xl font-bold text-amber-600 mb-2">2,123,456</p>
            <p className="text-sm text-muted-foreground">3rd Place</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-neon-blue/30 bg-gradient-to-br from-neon-blue/10 to-transparent p-4 flex items-center gap-4">
            <div className="rounded-xl bg-neon-blue/20 p-3">
              <Trophy className="h-5 w-5 text-neon-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">1,247</p>
              <p className="text-xs text-muted-foreground">Total Players</p>
            </div>
          </div>
          <div className="rounded-2xl border border-neon-green/30 bg-gradient-to-br from-neon-green/10 to-transparent p-4 flex items-center gap-4">
            <div className="rounded-xl bg-neon-green/20 p-3">
              <Database className="h-5 w-5 text-neon-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">458 TB</p>
              <p className="text-xs text-muted-foreground">Total Data</p>
            </div>
          </div>
          <div className="rounded-2xl border border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/10 to-transparent p-4 flex items-center gap-4">
            <div className="rounded-xl bg-neon-cyan/20 p-3">
              <Globe className="h-5 w-5 text-neon-cyan" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">89.2M</p>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </div>
          </div>
          <div className="rounded-2xl border border-deep-blue/30 bg-gradient-to-br from-deep-blue/10 to-transparent p-4 flex items-center gap-4">
            <div className="rounded-xl bg-deep-blue/20 p-3">
              <Zap className="h-5 w-5 text-deep-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">97.4%</p>
              <p className="text-xs text-muted-foreground">Avg Success</p>
            </div>
          </div>
        </div>

        {/* Full Leaderboard */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Full Rankings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-5 py-4 text-left text-sm font-medium text-muted-foreground">Rank</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-muted-foreground">User</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-muted-foreground">Score</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-muted-foreground">Requests</th>
                  <th className="px-5 py-4 text-left text-sm font-medium text-muted-foreground">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((user) => (
                  <tr key={user.rank} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {user.badge ? (
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shadow-lg",
                            badgeStyles[user.badge as keyof typeof badgeStyles].bg,
                            badgeStyles[user.badge as keyof typeof badgeStyles].glow
                          )}>
                            <span className="text-sm font-bold text-background">{user.rank}</span>
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-medium text-muted-foreground">{user.rank}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center",
                          user.badge
                            ? `${badgeStyles[user.badge as keyof typeof badgeStyles].bg} shadow-lg ${badgeStyles[user.badge as keyof typeof badgeStyles].glow}`
                            : "bg-gradient-to-br from-neon-blue/20 to-neon-cyan/10"
                        )}>
                          <span className={cn(
                            "text-sm font-bold",
                            user.badge ? "text-background" : "text-neon-cyan"
                          )}>
                            {user.avatar}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "font-bold",
                        user.badge
                          ? badgeStyles[user.badge as keyof typeof badgeStyles].text
                          : "text-foreground"
                      )}>
                        {user.score.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{user.requests}</td>
                    <td className="px-5 py-4">
                      <span className="text-neon-green font-medium">{user.success}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

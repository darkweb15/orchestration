"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Zap,
  Globe,
  Database,
  Clock,
  TrendingUp,
  Award,
  Edit,
  Camera,
  Copy,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

const activityData = [
  { label: "Mon", value: 45 },
  { label: "Tue", value: 72 },
  { label: "Wed", value: 58 },
  { label: "Thu", value: 91 },
  { label: "Fri", value: 84 },
  { label: "Sat", value: 36 },
  { label: "Sun", value: 22 },
]

const achievements = [
  { icon: Award, title: "First Scrape", desc: "Completed first job", color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
  { icon: Zap, title: "Speed Demon", desc: "1000 req/min achieved", color: "text-neon-green", bg: "bg-neon-green/10" },
  { icon: Shield, title: "Proxy Master", desc: "100+ proxies configured", color: "text-neon-blue", bg: "bg-neon-blue/10" },
  { icon: TrendingUp, title: "Data King", desc: "1TB+ data collected", color: "text-deep-blue", bg: "bg-deep-blue/10" },
  { icon: Globe, title: "Global Reach", desc: "50+ countries scraped", color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
  { icon: Clock, title: "Always On", desc: "99.9% uptime", color: "text-neon-green", bg: "bg-neon-green/10" },
]

const recentActivity = [
  { action: "Completed scrape job", target: "E-commerce Monitor", time: "2 min ago", status: "success" },
  { action: "Started new job", target: "Social Analytics", time: "15 min ago", status: "info" },
  { action: "Updated proxy settings", target: "Global Config", time: "1 hour ago", status: "info" },
  { action: "Downloaded data", target: "News Aggregator", time: "3 hours ago", status: "success" },
  { action: "Failed job", target: "Stock Data", time: "5 hours ago", status: "error" },
]

export default function ProfilePage() {
  return (
    <DashboardLayout title="My Profile">
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Avatar */}
            <div className="relative">
              <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-neon-blue via-neon-cyan to-neon-green p-[3px] shadow-lg shadow-neon-cyan/20">
                <div className="h-full w-full rounded-[13px] bg-card flex items-center justify-center">
                  <Globe className="h-16 w-16 text-neon-cyan" />
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <Camera className="h-5 w-5 text-background" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <h2 className="text-2xl font-bold text-foreground">ScraperPro User</h2>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 text-neon-green text-sm font-medium w-fit">
                  Pro Max Plan
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>pro@scraperpro.com</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined January 2024</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-background font-medium hover:opacity-90 transition-all">
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-neon-blue/30 bg-gradient-to-br from-neon-blue/10 to-transparent p-4">
                <Globe className="h-5 w-5 text-neon-blue mb-2" />
                <p className="text-2xl font-bold text-foreground">1,247</p>
                <p className="text-xs text-muted-foreground">Total Jobs</p>
              </div>
              <div className="rounded-2xl border border-neon-green/30 bg-gradient-to-br from-neon-green/10 to-transparent p-4">
                <Database className="h-5 w-5 text-neon-green mb-2" />
                <p className="text-2xl font-bold text-foreground">2.4 TB</p>
                <p className="text-xs text-muted-foreground">Data Scraped</p>
              </div>
              <div className="rounded-2xl border border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/10 to-transparent p-4">
                <Zap className="h-5 w-5 text-neon-cyan mb-2" />
                <p className="text-2xl font-bold text-foreground">94.8%</p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
              <div className="rounded-2xl border border-deep-blue/30 bg-gradient-to-br from-deep-blue/10 to-transparent p-4">
                <Clock className="h-5 w-5 text-deep-blue mb-2" />
                <p className="text-2xl font-bold text-foreground">847h</p>
                <p className="text-xs text-muted-foreground">Runtime</p>
              </div>
            </div>

            {/* Weekly Activity */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Activity</h3>
              <div className="flex items-end justify-between gap-2 h-40">
                {activityData.map((day, i) => (
                  <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-neon-blue to-neon-cyan transition-all hover:opacity-80"
                      style={{ height: `${day.value}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      activity.status === "success" && "bg-neon-green",
                      activity.status === "info" && "bg-neon-blue",
                      activity.status === "error" && "bg-destructive"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        {activity.action} <span className="text-neon-cyan">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* API Key */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">API Key</h3>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 font-mono text-sm">
                <span className="flex-1 text-muted-foreground truncate">sk-pro-****************************</span>
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <button className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all text-sm font-medium">
                <ExternalLink className="h-4 w-4" />
                View API Docs
              </button>
            </div>

            {/* Plan Details */}
            <div className="rounded-2xl border border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/5 to-transparent p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Plan Details</h3>
                <span className="text-xs bg-neon-cyan/20 text-neon-cyan px-2.5 py-1 rounded-full font-medium">Pro Max</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requests/month</span>
                  <span className="text-foreground font-medium">Unlimited</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Concurrent jobs</span>
                  <span className="text-foreground font-medium">50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data retention</span>
                  <span className="text-foreground font-medium">Forever</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority support</span>
                  <span className="text-neon-green font-medium">Enabled</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-background font-medium hover:opacity-90 transition-all">
                Manage Subscription
              </button>
            </div>

            {/* Achievements */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-5">
              <h3 className="text-lg font-semibold text-foreground mb-4">Achievements</h3>
              <div className="grid grid-cols-3 gap-3">
                {achievements.map((achievement, i) => (
                  <div key={i} className="group relative">
                    <div className={cn("rounded-xl p-3 flex items-center justify-center transition-all hover:scale-105", achievement.bg)}>
                      <achievement.icon className={cn("h-6 w-6", achievement.color)} />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <p className="font-medium text-foreground">{achievement.title}</p>
                      <p className="text-muted-foreground">{achievement.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

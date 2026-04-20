"use client"

import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const weeklyData = [
  { day: "Mon", value: 420 },
  { day: "Tue", value: 380 },
  { day: "Wed", value: 520 },
  { day: "Thu", value: 610 },
  { day: "Fri", value: 480 },
  { day: "Sat", value: 320 },
  { day: "Sun", value: 280 },
]

const hourlyData = [
  { hour: "00", value: 120 },
  { hour: "04", value: 80 },
  { hour: "08", value: 340 },
  { hour: "12", value: 520 },
  { hour: "16", value: 480 },
  { hour: "20", value: 360 },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-border bg-card px-2 py-1 text-xs shadow-lg">
        <span className="font-medium text-neon-cyan">{payload[0].value}</span>
      </div>
    )
  }
  return null
}

export function MiniChart({ type = "weekly" }: { type?: "weekly" | "hourly" }) {
  const data = type === "weekly" ? weeklyData : hourlyData
  const dataKey = type === "weekly" ? "day" : "hour"

  return (
    <div className="h-[100px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.7 0.2 230)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="oklch(0.7 0.2 230)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="oklch(0.7 0.2 230)"
            strokeWidth={2}
            fill="url(#miniGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function WeeklyBarChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h4 className="mb-4 text-sm font-medium text-muted-foreground">Weekly Overview</h4>
      <div className="flex h-[140px] items-end justify-between gap-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
          const heights = [60, 45, 75, 90, 70, 40, 35]
          const isHighlight = index === 3 || index === 4

          return (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "w-full rounded-t-md transition-all",
                  isHighlight
                    ? "bg-gradient-to-t from-neon-blue to-neon-cyan"
                    : "bg-gradient-to-t from-muted to-muted-foreground/30"
                )}
                style={{ height: `${heights[index]}%` }}
              />
              <span className="text-xs text-muted-foreground">{day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

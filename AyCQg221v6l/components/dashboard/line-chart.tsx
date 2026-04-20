"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const data = Array.from({ length: 22 }, (_, i) => ({
  day: i + 1,
  requests: Math.floor(Math.random() * 3000) + 1000,
  success: Math.floor(Math.random() * 2500) + 800,
  errors: Math.floor(Math.random() * 300) + 50,
}))

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
        <p className="mb-2 text-sm font-semibold text-foreground">Day {label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function DetailedLineChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Request Analytics</h3>
          <p className="text-sm text-muted-foreground">Daily breakdown of scraping requests</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-neon-green/10 px-3 py-1">
          <span className="text-sm font-medium text-neon-green">+50%</span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 250)" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 11 }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="requests"
              name="Requests"
              stroke="oklch(0.7 0.2 230)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "oklch(0.7 0.2 230)" }}
            />
            <Line
              type="monotone"
              dataKey="success"
              name="Success"
              stroke="oklch(0.7 0.18 165)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "oklch(0.7 0.18 165)" }}
            />
            <Line
              type="monotone"
              dataKey="errors"
              name="Errors"
              stroke="oklch(0.55 0.22 25)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "oklch(0.55 0.22 25)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-neon-blue" />
          <span className="text-sm text-muted-foreground">Total Requests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-neon-green" />
          <span className="text-sm text-muted-foreground">Successful</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-destructive" />
          <span className="text-sm text-muted-foreground">Errors</span>
        </div>
      </div>
    </div>
  )
}

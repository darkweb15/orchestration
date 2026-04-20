"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts"

const data = [
  { month: "Jan", scraped: 4200, success: 3800 },
  { month: "Feb", scraped: 3800, success: 3400 },
  { month: "Mar", scraped: 5200, success: 4800 },
  { month: "Apr", scraped: 4600, success: 4200 },
  { month: "May", scraped: 5800, success: 5200 },
  { month: "Jun", scraped: 6200, success: 5600 },
  { month: "Jul", scraped: 5400, success: 4900 },
  { month: "Aug", scraped: 7200, success: 6800 },
  { month: "Sep", scraped: 6800, success: 6200 },
  { month: "Oct", scraped: 7800, success: 7200 },
  { month: "Nov", scraped: 8200, success: 7600 },
  { month: "Dec", scraped: 9200, success: 8400 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
        <p className="mb-2 font-semibold text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function ScrapingChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Data Analysis</h3>
          <p className="text-sm text-muted-foreground">Monthly scraping overview</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-neon-blue" />
            <span className="text-sm text-muted-foreground">Scraped</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-neon-cyan" />
            <span className="text-sm text-muted-foreground">Success</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 250)" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.65 0.02 250)", fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="scraped"
              name="Scraped"
              fill="url(#blueGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="success"
              name="Success"
              fill="url(#cyanGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Line
              type="monotone"
              dataKey="success"
              stroke="oklch(0.7 0.18 165)"
              strokeWidth={2}
              dot={false}
            />
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.7 0.2 230)" />
                <stop offset="100%" stopColor="oklch(0.5 0.2 250)" />
              </linearGradient>
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.8 0.15 195)" />
                <stop offset="100%" stopColor="oklch(0.6 0.15 200)" />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

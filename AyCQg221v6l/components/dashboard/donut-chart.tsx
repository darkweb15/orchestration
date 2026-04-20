"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface DonutChartProps {
  title: string
  value: number
  data: Array<{ name: string; value: number; color: string }>
  size?: "sm" | "lg"
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm p-3 shadow-xl">
        <p className="text-sm font-medium" style={{ color: payload[0].payload.color }}>
          {payload[0].name}: {payload[0].value}%
        </p>
      </div>
    )
  }
  return null
}

export function DonutChart({ title, value, data, size = "lg" }: DonutChartProps) {
  const chartSize = size === "sm" ? 140 : 200
  const innerRadius = size === "sm" ? 40 : 60
  const outerRadius = size === "sm" ? 60 : 85

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: chartSize, height: chartSize }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} className="transition-all duration-300 hover:opacity-80" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
            {value.toLocaleString()}
          </span>
        </div>
      </div>
      {title && <p className="mt-2 text-sm text-muted-foreground">{title}</p>}
    </div>
  )
}

export function DonutChartCard() {
  const successData = [
    { name: "Success", value: 85, color: "oklch(0.7 0.18 165)" },
    { name: "Failed", value: 10, color: "oklch(0.55 0.22 25)" },
    { name: "Pending", value: 5, color: "oklch(0.75 0.15 85)" },
  ]

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-5 shadow-lg">
      <h4 className="mb-4 text-sm font-semibold text-foreground">Success Rate</h4>
      <DonutChart title="" value={561} data={successData} size="lg" />
      <div className="mt-5 space-y-3">
        {successData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full shadow-lg" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-semibold text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SourcesDonutChart() {
  const sourceData = [
    { name: "E-commerce", value: 35, color: "oklch(0.7 0.2 230)" },
    { name: "Social Media", value: 25, color: "oklch(0.7 0.18 165)" },
    { name: "News Sites", value: 20, color: "oklch(0.8 0.15 195)" },
    { name: "APIs", value: 15, color: "oklch(0.55 0.15 280)" },
    { name: "Other", value: 5, color: "oklch(0.75 0.15 85)" },
  ]

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-5 shadow-lg">
      <h4 className="mb-4 text-sm font-semibold text-foreground">Data Sources</h4>
      <DonutChart title="" value={5371} data={sourceData} size="lg" />
      <div className="mt-5 space-y-2.5">
        {sourceData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full shadow-lg" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-semibold text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

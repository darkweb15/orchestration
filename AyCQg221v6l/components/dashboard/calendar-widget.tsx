"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

const days = ["mo", "tu", "we", "th", "fr", "sa", "su"]
const weeks = [
  [48, 26, 27, 28, 29, 30, 1, 2],
  [49, 3, 4, 5, 6, 7, 8, 9],
  [50, 10, 11, 12, 13, 14, 15, 16],
  [51, 17, 18, 19, 20, 21, 22, 23],
  [52, 24, 25, 26, 27, 28, 29, 30],
  [53, 31, 1, 2, 3, 4, 5, 6],
]

export function CalendarWidget() {
  const highlightedDays = [10, 13, 14, 15, 22, 29]
  const today = 17

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">December 2024</h4>
        <div className="flex items-center gap-1">
          <button className="rounded p-1 hover:bg-muted">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="rounded p-1 hover:bg-muted">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-1 text-center text-xs">
        {/* Week numbers header */}
        <div className="py-1 text-muted-foreground/50" />
        {days.map((day) => (
          <div key={day} className="py-1 font-medium text-muted-foreground uppercase">
            {day}
          </div>
        ))}

        {/* Calendar grid */}
        {weeks.map((week, weekIndex) => (
          <>
            <div key={`week-${weekIndex}`} className="py-1.5 text-muted-foreground/50 text-[10px]">
              {week[0]}
            </div>
            {week.slice(1).map((day, dayIndex) => {
              const isHighlighted = highlightedDays.includes(day)
              const isToday = day === today
              const isOtherMonth = (weekIndex === 0 && day > 20) || (weekIndex === 5 && day < 10)

              return (
                <button
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    "rounded py-1.5 text-sm transition-all",
                    isOtherMonth && "text-muted-foreground/30",
                    isHighlighted && !isToday && "bg-neon-blue/20 text-neon-blue",
                    isToday && "bg-neon-green text-background font-medium",
                    !isHighlighted && !isToday && !isOtherMonth && "text-foreground hover:bg-muted"
                  )}
                >
                  {day}
                </button>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

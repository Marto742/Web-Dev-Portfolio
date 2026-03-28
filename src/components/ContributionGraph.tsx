'use client'

import { useEffect, useState } from 'react'
import { useStaggerReveal } from '@/hooks/useScrollReveal'

interface ContributionDay {
  contributionCount: number
  date: string
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `${MONTHS[month - 1]} ${day}, ${year}`
}

function tooltipLabel(count: number, date: string): string {
  if (count === 0) return `No contributions on ${formatDate(date)}`
  return `${count} contribution${count !== 1 ? 's' : ''} on ${formatDate(date)}`
}

function getColor(count: number): string {
  if (count === 0) return 'bg-bg-card'
  if (count <= 2) return 'bg-amber/20'
  if (count <= 5) return 'bg-amber/50'
  if (count <= 9) return 'bg-amber/80'
  return 'bg-amber'
}

function calculateStreaks(weeks: ContributionWeek[]): { current: number; longest: number } {
  const days = weeks.flatMap(w => w.contributionDays)

  // Longest streak — single forward scan
  let longest = 0
  let run = 0
  for (const day of days) {
    if (day.contributionCount > 0) {
      run++
      if (run > longest) longest = run
    } else {
      run = 0
    }
  }

  // Current streak — walk backwards, skip today if count is 0 (day not over yet)
  let current = 0
  let i = days.length - 1
  if (i >= 0 && days[i].contributionCount === 0) i--
  while (i >= 0 && days[i].contributionCount > 0) {
    current++
    i--
  }

  return { current, longest }
}

function getMonthLabels(weeks: ContributionWeek[]): Record<number, string> {
  const labels: Record<number, string> = {}
  let lastMonth = -1
  weeks.forEach((week, i) => {
    const first = week.contributionDays[0]
    if (first) {
      const month = new Date(first.date).getMonth()
      if (month !== lastMonth) {
        labels[i] = MONTHS[month]
        lastMonth = month
      }
    }
  })
  return labels
}

function GraphSkeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px] min-w-max">
        {Array.from({ length: 52 }, (_, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }, (_, j) => (
              <div key={j} className="w-3 h-3 rounded-sm bg-bg-card animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function GraphLoaded({ data }: { data: ContributionCalendar }) {
  const graphRef = useStaggerReveal<HTMLDivElement>({
    y: 16,
    duration: 0.5,
    stagger: 0.012,
    start: 'top 88%',
  })

  const monthLabels = getMonthLabels(data.weeks)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-1 ml-0">
          {data.weeks.map((_, i) => (
            <div key={i} className="w-3 flex items-end justify-start">
              {monthLabels[i] ? (
                <span className="font-mono text-[9px] text-ink-muted/50 whitespace-nowrap">
                  {monthLabels[i]}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {/* Heatmap — stagger ref on this container, children = week columns */}
        <div ref={graphRef} className="flex gap-[3px]">
          {data.weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.contributionDays.map((day, di) => (
                <div key={di} className="relative group">
                  <div
                    className={`w-3 h-3 rounded-sm transition-colors duration-200 cursor-default ${getColor(day.contributionCount)}`}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-bg-card border border-white/[0.08] rounded pointer-events-none whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <span className="font-mono text-[9px] text-ink-muted">
                      {tooltipLabel(day.contributionCount, day.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface GitHubData {
  calendar: ContributionCalendar
  repos: number
  followers: number
}

export default function ContributionGraph() {
  const [data, setData] = useState<ContributionCalendar | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch('/api/github')
      .then(r => {
        if (!r.ok) throw new Error('fetch failed')
        return r.json() as Promise<GitHubData>
      })
      .then(d => setData(d.calendar))
      .catch(() => setFailed(true))
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink-muted/60">
          Activity
        </p>
        {data && (() => {
          const streaks = calculateStreaks(data.weeks)
          return (
            <div className="flex items-center gap-3">
              {streaks.current > 0 && (
                <span className="font-mono text-[10px] text-amber border border-amber/30 px-2 py-0.5 rounded-sm">
                  {streaks.current}d streak
                </span>
              )}
              {streaks.longest > 0 && (
                <span className="font-mono text-[10px] text-ink-muted/40">
                  best {streaks.longest}d
                </span>
              )}
              <span className="font-mono text-[10px] text-ink-muted/40">
                {data.totalContributions} this year
              </span>
            </div>
          )
        })()}
      </div>

      {/* Graph or skeleton */}
      {data ? <GraphLoaded data={data} /> : <GraphSkeleton />}

      {/* Legend */}
      {!failed && (
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="font-mono text-[9px] text-ink-muted/40">Less</span>
          {['bg-bg-card', 'bg-amber/20', 'bg-amber/50', 'bg-amber/80', 'bg-amber'].map(c => (
            <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span className="font-mono text-[9px] text-ink-muted/40">More</span>
        </div>
      )}
    </div>
  )
}

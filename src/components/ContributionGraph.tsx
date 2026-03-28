'use client'

import { useEffect, useState } from 'react'
import { useStaggerReveal } from '@/hooks/useScrollReveal'
import { playNote } from '@/lib/sound'

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
          <div key={i} className={i < 26 ? 'hidden md:flex flex-col gap-[3px]' : 'flex flex-col gap-[3px]'}>
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
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  const monthLabels = getMonthLabels(data.weeks)
  const mobileOffset = Math.max(0, data.weeks.length - 26)

  // Musical fingerprint — play a note per visible column as the graph animates in
  useEffect(() => {
    const container = graphRef.current
    if (!container) return

    let played = false
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !played) {
          played = true
          data.weeks.forEach((week, wi) => {
            if (wi < mobileOffset) return // skip columns hidden on mobile
            const weekTotal = week.contributionDays.reduce((s, d) => s + d.contributionCount, 0)
            const delay = (wi - mobileOffset) * 12 // 12 ms matches the 0.012s GSAP stagger
            timeouts.push(setTimeout(() => playNote(weekTotal), delay))
          })
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(container)
    return () => {
      observer.disconnect()
      timeouts.forEach(clearTimeout)
    }
  }, [data.weeks, mobileOffset])

  return (
    <div>
      {/* Fixed tooltip — escapes overflow container, follows cursor */}
      {tooltip && (
        <div
          className="fixed px-2 py-1 bg-bg-card border border-white/[0.08] rounded pointer-events-none z-50"
          style={{ left: tooltip.x + 12, top: tooltip.y - 36 }}
        >
          <span className="font-mono text-[9px] text-ink-muted whitespace-nowrap">{tooltip.text}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex gap-[3px] mb-1 ml-0">
            {data.weeks.map((_, i) => (
              <div key={i} className={i < mobileOffset ? 'hidden md:flex w-3 items-end justify-start' : 'flex w-3 items-end justify-start'}>
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
              <div key={wi} className={wi < mobileOffset ? 'hidden md:flex flex-col gap-[3px]' : 'flex flex-col gap-[3px]'}>
                {week.contributionDays.map((day, di) => (
                  <div
                    key={di}
                    className={`w-3 h-3 rounded-sm transition-colors duration-200 cursor-default ${getColor(day.contributionCount)}`}
                    onMouseEnter={() => playNote(day.contributionCount)}
                    onMouseMove={(e) => setTooltip({ text: tooltipLabel(day.contributionCount, day.date), x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
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

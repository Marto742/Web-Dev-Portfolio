# GitHub Contribution Graph — Plan
> Stack: Next.js 16 App Router + TypeScript + Framer Motion + Tailwind | Placement: About section (below stats)

---

## 1. WHAT WE CURRENTLY HAVE

### GitHub Presence
- **Contact section** — static link to `https://github.com` (no username, not personalised)
- **No API calls** — zero GitHub data anywhere in the codebase
- **No contribution graph** — the feature is listed in DIAGNOSIS.md Phase 3 but unimplemented

### About Section Layout
| Element | Description |
|---|---|
| Left column | Intro text, "15+ Projects", "2+ Years", "∞ Coffee", scroll reveal |
| Right column | Portrait placeholder (MP monogram, cinematic border) |
| No data below stats | Empty space below the 3-stat grid — natural insertion point |

### Skills Section Layout
- Desktop: dual concentric orbital rings (Frontend inner, Full-Stack outer)
- Mobile: static two-column grid fallback
- No live data — all skill names are hardcoded in `src/data/portfolio.ts`

---

## 2. WHAT NEEDS IMPLEMENTING (The Task)

### Core — GitHub Contribution Heatmap
- [x] **GitHub username config** — store `GITHUB_USERNAME` in `.env.local` and expose as `NEXT_PUBLIC_GITHUB_USERNAME` (public) or use server-side fetch
- [x] **Fetch contribution data** — use GitHub GraphQL API (`contributionsCollection`) with a personal access token (`GITHUB_TOKEN` in `.env.local`, server-side only). Returns 52 weeks × 7 days of contribution counts.
- [x] **Server component data fetch** — `app/api/github/route.ts` (Route Handler) fetches from GitHub GraphQL and returns sanitised contribution weeks. Cached with `next: { revalidate: 3600 }` (hourly refresh).
- [x] **`ContributionGraph` component** — renders a 52×7 grid of amber-tinted squares. Color intensity scales from `bg-bg-card` (0 contributions) → `bg-amber/20` → `bg-amber/50` → `bg-amber/80` → `bg-amber` (4+ contributions). Month labels above columns.
- [x] **Animate on scroll** — squares reveal left-to-right using GSAP ScrollTrigger stagger (matches existing `useScrollReveal` hook pattern). Or Framer Motion `variants` with staggerChildren.
- [x] **Placement** — add below the stats grid in `src/components/sections/About.tsx`. Section label "Activity" with amber underline, matching existing section label pattern.
- [x] **Fallback** — if API call fails or token is missing, show a skeleton placeholder (same grid dimensions, muted squares) rather than breaking the layout.

### Files to Create / Change
| File | Change |
|---|---|
| `app/api/github/route.ts` | New Route Handler — fetch + cache GitHub GraphQL data |
| `src/components/ContributionGraph.tsx` | New component — renders heatmap grid + month labels |
| `src/components/sections/About.tsx` | Add `<ContributionGraph />` below stats grid |
| `.env.local` | Add `GITHUB_TOKEN` and `NEXT_PUBLIC_GITHUB_USERNAME` |
| `.env.example` | Document the two new env vars |

---

## 3. ADVANCED FEATURES (High Polish)

### Enhanced Stats
- **Live stats row** — pull `publicRepos`, `followers`, `totalContributions` (past year) from the same API call. Display as animated count-up numbers below or beside the graph. Replaces the hardcoded "15+ Projects" stat.
- **Streak counter** — calculate current and longest contribution streaks from the raw day data. Show as "🔥 42-day streak" badge beside the graph.
- **Hover tooltip** — on each square, show a tooltip: "3 contributions on Mar 14, 2025". Use a lightweight Radix UI `Tooltip` or a custom positioned div.
- **Current year selector** — tabs to switch between contribution years (2024, 2025). Re-fetches or pre-fetches year data.

### Visual Improvements
- **Responsive grid** — on mobile, show only the most recent 26 weeks (half the grid) to avoid overflow. Full 52 weeks on desktop.
- **Animated fill on scroll** — instead of instant reveal, each cell fades from `opacity-0` to its final color with a 1ms stagger per column. Creates a "painting" left-to-right wave effect.
- **Month separators** — thin vertical lines between months, like GitHub's own graph.
- **Total count label** — "X contributions in the last year" subtitle below the graph, matching GitHub's UI.

---

## 4. WEB-CHANGING / VIRAL FEATURES

### Real-Time Presence
- **"Last pushed" indicator** — fetch the most recent repo push timestamp and show "Last commit: 2 hours ago" as a live badge in the About section. Proves you're actively shipping.
- **Top language breakdown** — pie or bar chart showing your most-used languages across public repos (GitHub API: `languages` per repo). Animated on scroll, color-coded by language.
- **Pinned repos showcase** — fetch your 6 pinned repos via the GraphQL `pinnedItems` query and render them as mini-cards in the Projects section (replacing or augmenting the hardcoded `content/projects.json`). Stars, forks, language, description — all live.

### Ambient Activity Feed
- **Live commit feed** — a subtle scrolling ticker at the bottom of the About section showing your last 5 commits across all repos: `[repo-name] commit message — 3 hours ago`. Updates every 5 minutes via SWR polling. Shows you're always building.
- **Contribution sound** — when the heatmap animates in on scroll, each square emits a subtle piano note (frequency mapped to contribution count). High-activity days = higher pitch. Creates a musical "fingerprint" of your coding activity. Completely novel interaction.

### GitHub-Powered Projects Section
- **Dynamic project data** — replace `content/projects.json` entirely. Fetch repo metadata (description, stars, topics, homepage URL, last updated) directly from GitHub API. Projects always reflect your latest work without code pushes.
- **Star count live** — show real star counts on project cards, updating hourly. Social proof that auto-updates.

---

## 5. IMPLEMENTATION APPROACH

### GitHub GraphQL Query
```graphql
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}
```

### Route Handler (server-side, token never exposed)
```ts
// app/api/github/route.ts
export async function GET() {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { username: process.env.GITHUB_USERNAME } }),
    next: { revalidate: 3600 },
  })
  const data = await res.json()
  // Return sanitised contribution weeks only
  return Response.json(data.data.user.contributionsCollection.contributionCalendar)
}
```

### Color Scale
```ts
const getColor = (count: number) => {
  if (count === 0) return 'bg-bg-card'
  if (count <= 2) return 'bg-amber/20'
  if (count <= 5) return 'bg-amber/50'
  if (count <= 9) return 'bg-amber/80'
  return 'bg-amber'
}
```

### Key Decisions
- Route Handler keeps `GITHUB_TOKEN` server-side — never in browser bundle
- `revalidate: 3600` means the graph refreshes hourly on Vercel without re-deploying
- Fallback skeleton uses same grid dimensions — layout stable whether API succeeds or fails
- Placement: below stats grid in About, not Skills — About has the right narrative context ("here's my activity")

---

## 6. PRIORITY CHECKLIST

```
Immediate (this session)
  [x] Create app/api/github/route.ts (fetch + cache contribution data)
  [x] Create src/components/ContributionGraph.tsx (heatmap grid)
  [x] Add ContributionGraph to About.tsx below stats
  [x] Add GITHUB_TOKEN + GITHUB_USERNAME to .env.local and .env.example
  [x] Fallback skeleton for API failure

Advanced (future)
  [x] Hover tooltips per cell (date + count)
  [x] Streak counter badge
  [x] Live stats (totalContributions, repos, followers) replacing hardcoded numbers
  [x] Responsive: 26 weeks on mobile

Viral (Phase 4)
  [ ] Pinned repos replacing hardcoded projects.json
  [ ] Live commit feed ticker
  [ ] Contribution sound (musical fingerprint)
```

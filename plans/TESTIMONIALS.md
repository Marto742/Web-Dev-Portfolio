# Testimonials — Real Data, Enhanced Social Proof
> Scope: `src/components/sections/Testimonials.tsx` · `src/data/portfolio.ts` · `src/types/index.ts` | Replace 3 fake placeholder testimonials with real content, fix mobile interaction, and build advanced social-proof features

---

## 1. WHAT WE CURRENTLY HAVE

### Testimonials Component (`src/components/sections/Testimonials.tsx`)

**Layout**
- Horizontal drag-scroll track: `testimonials-track flex gap-5 overflow-x-auto`
- `<canvas>`-width cards: `w-[360px] md:w-[420px]` with `glass-card` styling
- Section label → heading → scroll track → "Drag to explore" hint

**`TestimonialCard` internals**
- Large decorative `&ldquo;` quote mark (amber/10 opacity) top-right
- Quote text: `font-sans text-ink-muted text-[0.95rem]`
- Avatar: initial letter only — `{t.name.charAt(0)}` inside a `w-10 h-10 rounded-full bg-bg-card` circle
- Author line: name + `role — company` in font-mono

**Animations**
- `whileInView` reveal: `opacity: 0, y: 40` → `opacity: 1, y: 0`, staggered at `index * 0.15`
- `whileHover={{ y: -4 }}` lift
- Amber inset border glow on hover via `group-hover:opacity-100`

**Interaction**
- Mouse drag implemented: `onMouseDown` records `startX` + `scrollLeft`, attaches `mousemove` / `mouseup` on `window`
- Cursor toggles `grab` → `grabbing` via `el.style.cursor`
- **No touch events** — `touchstart` / `touchmove` not implemented

**Section placement**
- `id="testimonials"` — accessible via anchor
- **Not in `navLinks`** — About / Work / Skills / Contact only; testimonials is orphaned from nav

### Data (`src/data/portfolio.ts` — lines 79–101)

```ts
export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Alex Mercer',         // ← fake name
    role: 'CTO',
    company: 'Velocity Labs',    // ← fake company
    text: "Martin delivered beyond expectations..."
  },
  {
    id: 2,
    name: 'Sofia Raines',        // ← fake name
    role: 'Product Lead',
    company: 'Horizon Digital',  // ← fake company
    text: "What sets Martin apart is his instinct..."
  },
  {
    id: 3,
    name: 'James Okafor',        // ← fake name
    role: 'Founder',
    company: 'Flux Studio',      // ← fake company
    text: "Martin rewrote our entire frontend..."
  },
]
```

### Type (`src/types/index.ts` — lines 12–18)

```ts
export interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  text: string
  // ← No avatar, no rating, no project link, no date, no LinkedIn
}
```

---

## 2. WHAT'S BROKEN / MISSING

### The Critical Gap — All 3 Testimonials Are Fake

"Alex Mercer at Velocity Labs" is not a real person. Any recruiter or client who checks will find zero results on LinkedIn. Fake testimonials are worse than no testimonials — they signal dishonesty and undermine everything else on the portfolio.

**Who is affected:**
| Scenario | Frequency | Impact |
|---|---|---|
| Recruiter Googles "Velocity Labs" | Very common | Finds nothing, flags as fabricated |
| Client reads carefully before hiring | Common | "James Okafor / Flux Studio" returns no results — loses trust |
| Portfolio shared in Discord/Reddit critique threads | Occasional | Called out as placeholder, hurts credibility |
| Martin applies to senior roles | Common | Empty social proof = can't verify experience |

### Secondary Issues

**Mobile swipe is broken**
The drag handler only attaches `mousemove`/`mouseup`. On touch devices there are no touch equivalents — mobile visitors (likely 50%+ of traffic) cannot scroll the track at all. They see the first card + the edge of the second and have no affordance to continue.

```ts
// Current: mouse only
onMouseDown={e => {
  const onMove = (ev: MouseEvent) => { ... }
  window.addEventListener('mousemove', onMove)   // ← only mouse
  window.addEventListener('mouseup', onUp)        // ← only mouse
}}
// Missing: touchstart / touchmove / touchend equivalents
```

**Type is too thin** — missing fields that every real testimonial needs:
```ts
// Missing from Testimonial interface:
avatar?: string       // photo URL or undefined → show initial fallback
rating: number        // 1–5 stars
project?: string      // which project the collaboration was about
linkedin?: string     // URL for the "verified" badge
```

**No scroll snap** — the track free-scrolls past card boundaries. Cards land at arbitrary offsets between positions, feeling unpolished.

**No edge fade gradients** — nothing visually communicates "more cards to the right." The right edge just clips.

**"Drag to explore"** shows on mobile where dragging doesn't work. Should be device-aware: `Swipe to explore` on touch, `Drag to explore` on pointer.

**Section not in nav** — `#testimonials` is unreachable from the navbar. Recruiters scanning top-level navigation skip it entirely.

---

## 3. IMPLEMENTATION PLAN

### Step 1 — Real (or Credible) Testimonial Strategy

**Option A — Real testimonials (ideal)**
Ask collaborators, classmates, open-source contributors, or even satisfied users of public projects to write 2–3 sentences. A Discord DM template:

> *"Hey [name], I'm updating my portfolio. Would you be willing to write a quick 2–3 sentence testimonial about working with me on [project]? I'll link your LinkedIn."*

**Option B — Credible placeholders while collecting (acceptable)**
If real testimonials aren't ready yet, replace the fake names/companies with:
- Real-sounding but generic attribution: "A Full-Stack Developer I collaborated with" / "Freelance Client, 2024"
- No made-up company names
- Or add a `pending: true` flag and render a blurred/coming-soon card

**Option C — Omit section until real content exists**
Comment out `<Testimonials />` in `App.tsx` and remove from nav until Martin has at least 2 real testimonials. A missing section is better than a fake one.

The plan below implements the data and UI upgrades assuming real testimonials will be provided.

---

### Step 2 — Extend the `Testimonial` Type

```ts
// src/types/index.ts
export interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  text: string
  rating: number        // 1–5; default 5 for existing entries
  avatar?: string       // URL to a photo; falls back to initial letter
  project?: string      // human-readable project name, e.g. "ApexFit SaaS"
  linkedin?: string     // full URL — renders a verified-link icon
}
```

---

### Step 3 — Update the Data

```ts
// src/data/portfolio.ts
export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Real Person Name',
    role: 'Their actual role',
    company: 'Their actual company',
    text: 'Their actual words.',
    rating: 5,
    project: 'ApexFit SaaS',          // optional
    linkedin: 'https://linkedin.com/in/their-slug', // optional
  },
  // ... 2–4 more real entries
]
```

---

### Step 4 — Star Rating in `TestimonialCard`

Add a 5-star row between the quote text and the author line:

```tsx
{/* Stars */}
<div className="flex gap-0.5 mb-6" aria-label={`${t.rating} out of 5 stars`}>
  {Array.from({ length: 5 }, (_, i) => (
    <svg
      key={i}
      width="12" height="12" viewBox="0 0 12 12"
      fill={i < t.rating ? '#F5A623' : 'none'}
      stroke={i < t.rating ? '#F5A623' : '#3a3a3a'}
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M6 1l1.4 2.8 3.1.45-2.25 2.19.53 3.1L6 8.05 3.22 9.54l.53-3.1L1.5 4.25l3.1-.45z" />
    </svg>
  ))}
</div>
```

---

### Step 5 — LinkedIn Verified Badge

```tsx
{/* Author row — add LinkedIn link */}
<div className="flex items-center justify-between border-t border-white/[0.06] pt-5">
  <div className="flex items-center gap-3">
    {/* Avatar (photo or initial fallback) */}
    {t.avatar ? (
      <img
        src={t.avatar}
        alt={t.name}
        className="w-10 h-10 rounded-full object-cover border border-white/[0.1] flex-shrink-0"
      />
    ) : (
      <div className="w-10 h-10 rounded-full bg-bg-card border border-white/[0.1] flex items-center justify-center flex-shrink-0">
        <span className="font-display text-sm font-bold text-amber/60">
          {t.name.charAt(0)}
        </span>
      </div>
    )}
    <div>
      <p className="font-display text-sm font-semibold text-ink">{t.name}</p>
      <p className="font-mono text-[9px] tracking-widest uppercase text-ink-muted/50">
        {t.role} &mdash; {t.company}
      </p>
    </div>
  </div>

  {t.linkedin && (
    <a
      href={t.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ink-muted/30 hover:text-amber/60 transition-colors duration-300 flex-shrink-0"
      aria-label={`View ${t.name} on LinkedIn`}
    >
      {/* LinkedIn "in" icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    </a>
  )}
</div>
```

---

### Step 6 — Touch Support for Drag Track

```tsx
// Replace the onMouseDown-only handler with a unified pointer handler:
onPointerDown={e => {
  const el = trackRef.current
  if (!el) return
  el.setPointerCapture(e.pointerId)
  el.style.cursor = 'grabbing'
  const startX = e.clientX
  const scrollLeft = el.scrollLeft

  const onMove = (ev: PointerEvent) => {
    el.scrollLeft = scrollLeft - (ev.clientX - startX)
  }
  const onUp = () => {
    el.style.cursor = 'grab'
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerup', onUp)
  }
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerup', onUp)
}}
```

`setPointerCapture` handles both mouse and touch in a single event model. Remove the `window.addEventListener` pattern — it leaks if the component unmounts during drag.

---

### Step 7 — Project Context Chip

```tsx
{/* Project chip — show above the quote text when present */}
{t.project && (
  <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase text-amber/50 border border-amber/20 px-2 py-1 rounded mb-5">
    <span className="w-1 h-1 rounded-full bg-amber/50" />
    {t.project}
  </span>
)}
```

---

### Step 8 — Edge Fade Gradients

Add left/right fade overlays to communicate scroll depth:

```tsx
{/* Left fade */}
<div
  className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-bg to-transparent pointer-events-none z-10"
  aria-hidden="true"
/>
{/* Right fade */}
<div
  className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-bg to-transparent pointer-events-none z-10"
  aria-hidden="true"
/>
```

Wrap the track in a `relative` container to position these.

---

### Step 9 — Add to Nav

```ts
// src/data/portfolio.ts
export const navLinks: NavLink[] = [
  { label: 'About',       href: '#about' },
  { label: 'Work',        href: '#projects' },
  { label: 'Skills',      href: '#skills' },
  { label: 'Reviews',     href: '#testimonials' },  // ← add
  { label: 'Contact',     href: '#contact' },
]
```

---

### Files to Create / Change

| File | Change |
|---|---|
| `src/types/index.ts` | Updated — add `rating`, `avatar?`, `project?`, `linkedin?` to `Testimonial` |
| `src/data/portfolio.ts` | Updated — replace 3 fake entries with real testimonials; add `navLinks` entry |
| `src/components/sections/Testimonials.tsx` | Updated — stars, avatar photo fallback, LinkedIn badge, project chip, edge fades, pointer events |

---

## 4. ADVANCED FEATURES

### Auto-Scroll Infinite Marquee

Replace the manual drag track with a CSS-animated infinite marquee (like Linear, Figma, Vercel social proof sections). Two copies of the testimonial list play end-to-end, creating a seamless loop.

```tsx
// Duplicate the list for seamless infinite loop
const doubled = [...testimonials, ...testimonials]

// Animate with CSS keyframes
<style>{`
  @keyframes marquee {
    0%   { transform: translateX(0) }
    100% { transform: translateX(-50%) }
  }
  .marquee-inner { animation: marquee 30s linear infinite; }
  .marquee-inner:hover { animation-play-state: paused; }
`}</style>

<div className="overflow-hidden -mx-6">
  <div className="marquee-inner flex gap-5 w-max">
    {doubled.map((t, i) => <TestimonialCard key={`${t.id}-${i}`} t={t} index={0} />)}
  </div>
</div>
```

- `prefers-reduced-motion` guard: `animation: none` when reduced motion is set
- Hover pauses the scroll — visitors can read without it running away

---

### Summary Stats Bar

A `<div>` row above the testimonial track showing aggregate social proof:

```
★★★★★  5.0 average  ·  12 clients  ·  100% would recommend
```

```tsx
<div className="flex items-center gap-8 mb-12">
  <div>
    <span className="font-display text-5xl font-bold text-ink">5.0</span>
    <span className="font-mono text-xs text-amber ml-2">★★★★★</span>
  </div>
  <div className="h-12 w-px bg-white/[0.06]" />
  <div>
    <p className="font-display text-2xl font-bold text-ink">12</p>
    <p className="font-mono text-[9px] tracking-widest uppercase text-ink-muted/50">Clients</p>
  </div>
  <div className="h-12 w-px bg-white/[0.06]" />
  <div>
    <p className="font-display text-2xl font-bold text-ink">100%</p>
    <p className="font-mono text-[9px] tracking-widest uppercase text-ink-muted/50">Would recommend</p>
  </div>
</div>
```

Numbers can be driven from the data: `testimonials.length`, `avg(t.rating)`.

---

### Featured Hero Testimonial

One standout testimonial rendered large above the scroll track — full-width card with larger text, photo, and a pull-quote treatment:

```tsx
// Mark one testimonial as featured in data:
{ id: 1, ..., featured: true }

// In Testimonials.tsx:
const featured = testimonials.find(t => t.featured)
const rest = testimonials.filter(t => !t.featured)

// Render featured separately in a wide card before the track
```

This gives the section visual weight before the small card row.

---

### Dot Pagination Indicator

A row of dots below the track showing how many cards exist and which are visible, updating as the user scrolls:

```tsx
const [activeDot, setActiveDot] = useState(0)

// On scroll:
trackRef.current.addEventListener('scroll', () => {
  const cardWidth = 420 + 20 // width + gap
  setActiveDot(Math.round(el.scrollLeft / cardWidth))
})

// JSX:
<div className="flex justify-center gap-2 mt-4">
  {testimonials.map((_, i) => (
    <button
      key={i}
      className={`w-1 h-1 rounded-full transition-all duration-300 ${
        i === activeDot ? 'w-4 bg-amber/60' : 'bg-white/20'
      }`}
      onClick={() => trackRef.current?.scrollTo({ left: i * cardWidth, behavior: 'smooth' })}
      aria-label={`Go to testimonial ${i + 1}`}
    />
  ))}
</div>
```

---

### "Request a Testimonial" CTA

After the last card, add an end card styled differently — a call to action for collaborators:

```tsx
// After the cards in the track:
<motion.div className="flex-shrink-0 w-[360px] md:w-[420px] glass-card p-8 flex flex-col items-center justify-center gap-4 border border-dashed border-amber/20">
  <span className="font-mono text-[9px] tracking-widest uppercase text-ink-muted/30">
    Worked with Martin?
  </span>
  <MagneticButton
    onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
    className="font-mono text-xs tracking-widest uppercase text-amber border border-amber/30 px-6 py-3 hover:border-amber transition-colors duration-300"
  >
    Leave a review
  </MagneticButton>
</motion.div>
```

Drives more testimonials organically. The dashed amber border makes it visually distinct from real testimonials.

---

## 5. WEB-CHANGING / VIRAL IDEAS

### Video Testimonial Cards

A card variant that renders a video embed (YouTube or Loom) instead of text — the thumbnail shows, click expands an iframe overlay. Video testimonials convert at 4× the rate of text.

```ts
// Extend type:
videoUrl?: string  // YouTube/Loom embed URL

// In TestimonialCard: if videoUrl exists, render a thumbnail
// with play button; clicking sets a state that shows the iframe
```

---

### Animated Number Counter

The stats bar numbers count up from 0 when the section scrolls into view — `0 → 5.0`, `0 → 12`, etc. Uses a simple `useEffect` + `requestAnimationFrame` easing loop. Creates the impression of live data loading.

---

### "As seen at" Logo Strip

Below the testimonials, a row of logos for companies/projects that have used Martin's work. Greyscale by default, full colour on hover. Even a couple of recognisable logos (open-source projects, frameworks contributed to) dramatically increase perceived credibility.

---

### LinkedIn Endorsements Pull

A small badge on each LinkedIn-linked card: "LinkedIn Verified" — links to Martin's actual LinkedIn profile where the recommendation exists. Even without an API, manually copying endorsements from LinkedIn and linking back provides verifiable social proof that recruiters can check with one click.

---

## 6. PRIORITY ORDER

```
Immediate (removes the fake data problem)
  [x] Martin fills in real testimonial content (names, companies, quotes) in portfolio.ts
  [ ] Extend Testimonial interface — add rating, avatar?, project?, linkedin?
  [ ] Add star rating row to TestimonialCard
  [ ] Add LinkedIn badge + avatar photo support
  [ ] Replace mouse drag with unified pointer events (fixes mobile swipe)

Short-term (polish)
  [ ] Add project context chip
  [ ] Add left/right edge fade gradients
  [ ] Add section to navLinks as "Reviews"
  [ ] Add scroll snap to the track (scroll-snap-type: x mandatory)
  [ ] Make "Drag to explore" hint device-aware (swipe vs drag)

Advanced (wow factor)
  [ ] Summary stats bar (avg rating · client count · recommendation %)
  [ ] Dot pagination indicator
  [ ] Featured hero testimonial (large card above the track)
  [ ] "Leave a review" CTA end-card

Viral
  [ ] Auto-scroll infinite marquee with hover-pause
  [ ] Animated number counter on stats bar
  [ ] Video testimonial card variant
  [ ] "As seen at" company logo strip
```

---

## 7. QUICK REFERENCE — KEY CODE

```ts
// Extended type — src/types/index.ts
export interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  text: string
  rating: number          // 1–5; all current entries → 5
  avatar?: string         // photo URL; undefined → initial fallback
  project?: string        // "ApexFit SaaS", "E-Commerce Platform", etc.
  linkedin?: string       // full LinkedIn profile URL
  featured?: boolean      // one card gets the large hero treatment
  videoUrl?: string       // YouTube/Loom embed URL (future)
}
```

```tsx
// Pointer-based drag (replaces mouse-only) — Testimonials.tsx
onPointerDown={e => {
  const el = trackRef.current
  if (!el) return
  el.setPointerCapture(e.pointerId)
  el.style.cursor = 'grabbing'
  const startX = e.clientX
  const scrollLeft = el.scrollLeft
  const onMove = (ev: PointerEvent) => {
    el.scrollLeft = scrollLeft - (ev.clientX - startX)
  }
  const onUp = () => {
    el.style.cursor = 'grab'
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerup', onUp)
  }
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerup', onUp)
}}
```

```tsx
// Star rating row — inside TestimonialCard, before the quote text
<div className="flex gap-0.5 mb-5" aria-label={`${t.rating} out of 5 stars`}>
  {Array.from({ length: 5 }, (_, i) => (
    <svg key={i} width="11" height="11" viewBox="0 0 12 12"
      fill={i < t.rating ? '#F5A623' : 'none'}
      stroke={i < t.rating ? '#F5A623' : '#3a3a3a'}
      strokeWidth="1" aria-hidden="true"
    >
      <path d="M6 1l1.4 2.8 3.1.45-2.25 2.19.53 3.1L6 8.05 3.22 9.54l.53-3.1L1.5 4.25l3.1-.45z" />
    </svg>
  ))}
</div>
```

# Next.js 14 Migration — Vite SPA → App Router
> Scope: entire project | Replace Vite + React SPA with Next.js 14 App Router for SSR, native metadata, font optimisation, and a cleaner API layer

---

## 1. WHAT WE CURRENTLY HAVE

### Build Stack

- **Bundler:** Vite 5 + `@vitejs/plugin-react`
- **Entry:** `index.html` → `src/main.tsx` → `ReactDOM.createRoot` → `<App />`
- **Framework:** Plain React 18 SPA — no routing library, no SSR
- **Deploy:** Vercel (auto-detected as Vite project)

### Routing

Zero react-router-dom. Single-page application with **hash anchor navigation** (`#about`, `#projects`, `#skills`, `#contact`). The "404" is a manual runtime check:

```ts
// src/App.tsx — lines 41–43
if (typeof window !== 'undefined' && window.location.pathname !== '/') {
  return <NotFound />
}
```

This fires client-side after JS loads — Googlebot and social preview scrapers receive a 200 with empty HTML before React hydrates.

### SEO / Meta Tags

`react-helmet-async` (`src/components/SEO.tsx`) renders `<meta>` tags into the document head from inside React. Works in the browser but:
- Server-side crawlers get **no meta tags** in the initial HTML payload (SPA renders blank `<div id="root">` first)
- OG images, Twitter cards, and LinkedIn previews depend on JS execution — most social crawlers don't execute JS

### API Layer

`/api/contact.ts` — Vercel serverless function using `VercelRequest` / `VercelResponse` types:

```ts
// /api/contact.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  // ... validation + resend.emails.send()
}
```

### Font Loading

`@fontsource-variable` packages imported at the top of `src/index.css`:

```css
@import '@fontsource-variable/inter';
@import '@fontsource-variable/jetbrains-mono';
@import '@fontsource-variable/playfair-display';
@import '@fontsource-variable/playfair-display/wght-italic.css';
```

These are bundled into the CSS output — no subset optimisation, no preload hints, no `font-display: swap`.

### Component Inventory

All components currently assume a browser environment:

| Component | Browser APIs used |
|---|---|
| `CustomCursor` | `mousemove`, `useRef`, `useEffect` |
| `FilmGrain` | `useEffect`, CSS animation |
| `Navbar` | `scroll` event, `useState`, `useEffect` |
| `ScrollProgress` | `useScroll` (Framer Motion), `useTransform` |
| `HeroWebGL` | `WebGLRenderer`, `requestAnimationFrame`, `getUserMedia`, async import |
| `HeroFallback` | `useScroll`, `useTransform`, `useTypewriter` |
| `About` | GSAP `ScrollTrigger`, `useScrollReveal`, `useStaggerReveal` |
| `Projects` | GSAP, `IntersectionObserver`, `useState` |
| `Skills` | GSAP, `orbital rings`, `useState` |
| `Contact` | `fetch`, `useState`, form state |
| `MagneticButton` | `mousemove`, `useRef`, `useEffect` |

---

## 2. WHAT'S BROKEN / MISSING

### The Critical Gap — No Server-Side HTML

```html
<!-- What Googlebot / LinkedIn / Twitter scrapers receive today -->
<!doctype html>
<html lang="en">
  <head>
    <title>Martin Petrov — Frontend & Full-Stack Developer</title>
    <!-- No OG tags in initial HTML — react-helmet hasn't run yet -->
  </head>
  <body>
    <div id="root"></div> <!-- ← completely empty -->
    <script src="/assets/index-abc123.js"></script>
  </body>
</html>
```

**Who is affected:**
| Scenario | Frequency | Impact |
|---|---|---|
| Recruiter shares portfolio link on LinkedIn | Very common | No OG preview image or title — shows blank card |
| Google indexes the portfolio | Always | Crawls empty HTML first pass; may rank poorly |
| Twitter/X link preview | Common | No card, no image, just raw URL |
| WhatsApp / Slack link unfurl | Common | No preview — link looks dead |
| Google PageSpeed / Core Web Vitals | Always | FCP delayed until JS bundle parses (300–600ms extra) |

### Secondary Issues

**`react-helmet-async` is a workaround, not a solution**
`HelmetProvider` wraps the entire app (`main.tsx`). Adding it to Next.js is possible but redundant — Next.js has a first-class `Metadata` API that writes directly to the server-rendered HTML.

**`/api/contact.ts` uses legacy Vercel handler syntax**
`VercelRequest` / `VercelResponse` are the old Express-style Node.js handlers. Next.js 14 Route Handlers (`Request` / `Response` Web API) are the current standard — simpler, edge-runtime compatible, no extra `@vercel/node` devDependency.

**Client-side 404 is fragile**
`window.location.pathname !== '/'` fires after JS loads. Direct navigation to `/anything` gets a 200 with the portfolio HTML, then swaps to `<NotFound />` — bad for SEO and confusing for monitoring tools expecting real 404 status codes.

**Font loading has no optimisation**
`@fontsource-variable` CSS imports load the full variable font range. `next/font` automatically:
- Subsets to only the characters actually used
- Adds `font-display: swap`
- Inlines critical font CSS into `<head>` at build time
- Generates preload hints for the woff2 files

**No `vercel.json`** — currently relies on Vite auto-detection. Next.js auto-detection on Vercel is equally seamless, so this is fine, but the explicit config gives more control.

**Exposed `.env` key**
The real Resend key is committed to the repo. This should be revoked and regenerated in the Resend dashboard before migration (and put in `.env.local` which is `.gitignore`-d by Next.js by default).

---

## 3. IMPLEMENTATION PLAN

### New File Structure

```
portfolio/
├── app/
│   ├── layout.tsx          ← Root layout: html/body, fonts, global providers, metadata
│   ├── page.tsx            ← Home page: renders all sections
│   ├── not-found.tsx       ← Next.js 404 — real HTTP 404 status
│   ├── globals.css         ← Renamed from src/index.css
│   └── api/
│       └── contact/
│           └── route.ts    ← Route Handler (replaces /api/contact.ts)
├── src/
│   ├── components/         ← All existing components — mostly unchanged
│   ├── hooks/              ← All existing hooks — unchanged
│   ├── data/               ← portfolio.ts — unchanged
│   ├── lib/                ← utils.ts — unchanged
│   └── types/              ← index.ts — unchanged
├── public/                 ← Static assets (favicon.svg, og-image.png)
├── next.config.ts          ← New
├── tailwind.config.js      ← Update content paths
├── tsconfig.json           ← Replace with Next.js config
└── package.json            ← Swap vite deps for next
```

**Files deleted:**
- `src/main.tsx`
- `src/App.tsx`
- `src/components/SEO.tsx`
- `index.html`
- `vite.config.ts`
- `tsconfig.app.json` / `tsconfig.node.json` (merged into single tsconfig)
- `/api/contact.ts` (replaced by `app/api/contact/route.ts`)

---

### `package.json` Changes

```json
// Remove:
"vite": "^5.3.4",
"@vitejs/plugin-react": "^4.3.1",
"react-helmet-async": "^3.0.0",
"@vercel/node": "^5.6.22",

// Add:
"next": "^14.2.0",

// Scripts replace:
"dev":   "next dev",
"build": "next build",
"start": "next start"
```

---

### `next.config.ts`

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Transpile Three.js for proper tree-shaking
  transpilePackages: ['three'],
}

export default config
```

---

### `tsconfig.json` — Replace with Next.js Config

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### `tailwind.config.js` — Update Content Paths

```js
// Change:
content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
// To:
content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
```

---

### `app/layout.tsx` — Root Layout

Replaces `index.html` + `main.tsx` + `src/components/SEO.tsx`. This is a **Server Component** — no `'use client'`.

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// OR keep @fontsource-variable — see font strategy below
import './globals.css'

export const metadata: Metadata = {
  title: 'Martin Petrov — Frontend & Full-Stack Developer',
  description:
    'Frontend & Full-Stack Developer crafting cinematic digital experiences. React, TypeScript, Node.js, Three.js.',
  metadataBase: new URL('https://martinpetrov.dev'),
  openGraph: {
    title: 'Martin Petrov — Frontend & Full-Stack Developer',
    description:
      'Frontend & Full-Stack Developer crafting cinematic digital experiences.',
    url: 'https://martinpetrov.dev',
    siteName: 'Martin Petrov',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Martin Petrov — Frontend & Full-Stack Developer',
    description: 'Frontend & Full-Stack Developer crafting cinematic digital experiences.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  authors: [{ name: 'Martin Petrov' }],
  themeColor: '#090909',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ background: '#090909' }}>
      <body>{children}</body>
    </html>
  )
}
```

---

### `app/page.tsx` — Home Page

Replaces `src/App.tsx`. This can be a **Server Component** — it just renders sections. All interactivity lives inside the section components themselves.

```tsx
import ClientShell from '@/components/ClientShell'

// Sections are rendered via ClientShell which handles
// the motion.main wrapper and global overlays
export default function HomePage() {
  return <ClientShell />
}
```

`ClientShell` is a `'use client'` component that holds everything that was in `App.tsx`'s return:

```tsx
// src/components/ClientShell.tsx
'use client'
import { motion } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import CustomCursor from './CustomCursor'
import FilmGrain from './FilmGrain'
import Navbar from './Navbar'
import ScrollProgress from './ScrollProgress'
import Hero from './sections/Hero'
import About from './sections/About'
import Projects from './sections/Projects'
import Skills from './sections/Skills'
import Contact from './sections/Contact'
import Footer from './Footer'

export default function ClientShell() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <ScrollProgress />
      <CustomCursor />
      <FilmGrain />
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
        <Footer />
      </motion.main>
    </>
  )
}
```

---

### `app/not-found.tsx` — Real 404

Replaces the `window.location.pathname` check in `App.tsx`. Next.js automatically serves this with **HTTP 404 status**:

```tsx
// app/not-found.tsx
// This is a Server Component — no 'use client' needed
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-amber mb-4">404</p>
        <h1 className="font-display text-6xl font-bold text-ink mb-6">Page not found.</h1>
        <Link
          href="/"
          className="font-mono text-sm tracking-widest uppercase text-amber/60 hover:text-amber transition-colors duration-300"
        >
          ← Back home
        </Link>
      </div>
    </main>
  )
}
```

---

### `app/api/contact/route.ts` — Route Handler

Replaces `/api/contact.ts`. Uses Web Standard `Request` / `Response` — works on Edge runtime or Node runtime:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const TO = process.env.CONTACT_EMAIL ?? 'bgm89044@gmail.com'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json() as {
    name?: string
    email?: string
    message?: string
  }

  if (!name || name.trim().length < 2)
    return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 })
  if (!email || !isValidEmail(email))
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  if (!message || message.trim().length < 10)
    return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 })

  try {
    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: TO,
      replyTo: email.trim(),
      subject: `New message from ${name.trim()}`,
      html: `<!-- same HTML template as before -->`,
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}

// Only POST is allowed — GET returns 405 automatically (Next.js handles it)
```

---

### `'use client'` Additions

Every component that uses browser APIs, React hooks that use browser state, or third-party libraries that access `window`/`document` needs the directive at the top:

```ts
// Add to the top of these files:
'use client'
```

| File | Reason |
|---|---|
| `src/components/ClientShell.tsx` | New — Framer Motion `motion.main`, Analytics |
| `src/components/CustomCursor.tsx` | `mousemove` event, `useRef`, `useEffect` |
| `src/components/FilmGrain.tsx` | `useEffect`, animation |
| `src/components/Navbar.tsx` | `scroll` event, `useState`, `useEffect` |
| `src/components/ScrollProgress.tsx` | `useScroll` (Framer Motion) |
| `src/components/NotFound.tsx` | *(can stay server — no hooks)* |
| `src/components/ui/MagneticButton.tsx` | `mousemove`, `useRef`, `useEffect` |
| `src/components/sections/Hero.tsx` | `useWebGL`, `React.lazy`, `Suspense` |
| `src/components/sections/HeroWebGL.tsx` | Three.js, `useEffect`, `useState`, WebGPU |
| `src/components/sections/HeroFallback.tsx` | `useScroll`, `useTypewriter` |
| `src/components/sections/About.tsx` | GSAP `ScrollTrigger`, `useScrollReveal` |
| `src/components/sections/Projects.tsx` | GSAP, `IntersectionObserver`, `useState` |
| `src/components/sections/Skills.tsx` | GSAP, `useState` |
| `src/components/sections/Contact.tsx` | `fetch`, `useState`, form refs |
| `src/hooks/useScrollReveal.ts` | GSAP `ScrollTrigger` (browser-only) |
| `src/hooks/useTypewriter.ts` | `useEffect`, `useState` |
| `src/hooks/useWebGL.ts` | `useMemo`, `document.createElement` |
| `src/hooks/useReducedMotion.ts` | `window.matchMedia` |

**Note:** Hooks don't get `'use client'` — only components do. Hooks are automatically client-only when called from a client component. The directive is file-level and applies to components only.

---

### Font Strategy — Two Options

**Option A — Keep `@fontsource-variable` (minimal change)**

Move the CSS imports from `src/index.css` into `app/globals.css`. Works identically. No optimisation gain but zero refactoring risk.

**Option B — Switch to `next/font/local` (recommended)**

```tsx
// app/layout.tsx
import localFont from 'next/font/local'

const inter = localFont({
  src: '../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  variable: '--font-inter',
  display: 'swap',
})
const jetbrains = localFont({
  src: '../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  variable: '--font-jetbrains',
  display: 'swap',
})
const playfair = localFont({
  src: [
    { path: '../node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2', style: 'normal' },
    { path: '../node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-italic.woff2', style: 'italic' },
  ],
  variable: '--font-playfair',
  display: 'swap',
})

// Apply to <html>:
<html className={`${inter.variable} ${jetbrains.variable} ${playfair.variable}`}>
```

Next.js automatically generates `<link rel="preload">` for the woff2 files and inlines the `@font-face` declarations into the initial HTML.

---

### Files to Create / Change

| File | Change |
|---|---|
| `app/layout.tsx` | **New** — Root layout, Metadata API, font loading, `html`+`body` |
| `app/page.tsx` | **New** — Home page Server Component, renders `<ClientShell />` |
| `app/not-found.tsx` | **New** — Real HTTP 404 page, replaces `NotFound.tsx` component |
| `app/globals.css` | **New** — Copy of `src/index.css` (rename + move) |
| `app/api/contact/route.ts` | **New** — Route Handler replacing `/api/contact.ts` |
| `src/components/ClientShell.tsx` | **New** — `'use client'` wrapper, extracted from `App.tsx` |
| `package.json` | **Updated** — swap vite→next, remove react-helmet-async, @vercel/node |
| `next.config.ts` | **New** — transpilePackages: ['three'] |
| `tsconfig.json` | **Replaced** — Next.js config (replaces app+node split) |
| `tailwind.config.js` | **Updated** — content paths include `app/` |
| `src/components/CustomCursor.tsx` | **Add** `'use client'` |
| `src/components/FilmGrain.tsx` | **Add** `'use client'` |
| `src/components/Navbar.tsx` | **Add** `'use client'` |
| `src/components/ScrollProgress.tsx` | **Add** `'use client'` |
| `src/components/ui/MagneticButton.tsx` | **Add** `'use client'` |
| `src/components/sections/Hero.tsx` | **Add** `'use client'` |
| `src/components/sections/HeroWebGL.tsx` | **Add** `'use client'` |
| `src/components/sections/HeroFallback.tsx` | **Add** `'use client'` |
| `src/components/sections/About.tsx` | **Add** `'use client'` |
| `src/components/sections/Projects.tsx` | **Add** `'use client'` |
| `src/components/sections/Skills.tsx` | **Add** `'use client'` |
| `src/components/sections/Contact.tsx` | **Add** `'use client'` |
| **Delete:** `src/main.tsx` | Entry point removed |
| **Delete:** `src/App.tsx` | Replaced by layout + ClientShell |
| **Delete:** `src/components/SEO.tsx` | Replaced by Metadata API |
| **Delete:** `index.html` | Replaced by Next.js HTML shell |
| **Delete:** `vite.config.ts` | Replaced by next.config.ts |
| **Delete:** `tsconfig.app.json` / `tsconfig.node.json` | Merged into single tsconfig.json |
| **Delete:** `/api/contact.ts` | Replaced by app/api/contact/route.ts |

---

## 4. ADVANCED FEATURES

### `next/font` Subset Optimisation

`next/font/local` with the `@fontsource-variable` woff2 files gives automatic preloading at zero extra config. The font CSS is inlined into `<head>` at build time — no render-blocking font stylesheets.

---

### Server Actions — Contact Form Without an API Route

Next.js 14 Server Actions let you call server-side code directly from a form, eliminating the `/api/contact/route.ts` entirely:

```tsx
// app/actions.ts
'use server'
import { Resend } from 'resend'

export async function sendContact(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string
  // ... validation + resend call
}

// Contact.tsx:
import { sendContact } from '@/app/actions'
<form action={sendContact}>...</form>
```

No `fetch('/api/contact')` in the client. The network round-trip is handled by Next.js's built-in RPC layer. Works without JavaScript (progressive enhancement).

---

### Dynamic OG Image Generation

`@vercel/og` generates a real `og-image.png` at request time using React JSX:

```ts
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div style={{ background: '#090909', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#F5A623', fontFamily: 'serif', fontSize: 72 }}>Martin Petrov</h1>
        <p style={{ color: '#6B6B6B', fontSize: 28 }}>Frontend & Full-Stack Developer</p>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

Update `layout.tsx` metadata `images` to point to `/api/og`. Every link preview now shows a generated branded image.

---

### Edge Runtime for Contact API

Add one line to `app/api/contact/route.ts`:

```ts
export const runtime = 'edge'
```

The contact form handler runs in Vercel's Edge Network (globally distributed, ~0ms cold start) instead of a serverless function (~200ms cold start). For a contact form, this is the difference between instant response and noticeable delay.

---

### Streaming + Suspense for Above-the-Fold

With Server Components, heavy sections (About, Projects) can stream in after the hero renders, improving Largest Contentful Paint:

```tsx
// app/page.tsx
import { Suspense } from 'react'

export default function HomePage() {
  return (
    <ClientShell>
      <Hero />                              {/* Streams first */}
      <Suspense fallback={<div />}>
        <About />                           {/* Streams when ready */}
        <Projects />
      </Suspense>
    </ClientShell>
  )
}
```

---

## 5. WEB-CHANGING / GAME-CHANGING IDEAS

### Auto-Generated Case Study Pages

```
/work/apexfit-saas
/work/local-business-os
/work/e-commerce-platform
```

With Next.js App Router, each project gets its own statically generated page from `src/data/portfolio.ts`:

```ts
// app/work/[slug]/page.tsx
export async function generateStaticParams() {
  return projects.map(p => ({ slug: slugify(p.title) }))
}
```

Each case study: hero screenshot, tech breakdown, live demo embed, before/after code snippets. **Dramatically improves SEO** — each page indexes independently for its tech stack keywords ("React Three.js portfolio", "Next.js Stripe e-commerce"). Individual pages can be shared on LinkedIn as standalone case studies.

---

### Sitemap + Robots.txt — Zero Config

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://martinpetrov.dev', lastModified: new Date(), priority: 1 },
    { url: 'https://martinpetrov.dev/work/apexfit-saas', priority: 0.8 },
    // ... one per project
  ]
}
```

Auto-generates `/sitemap.xml` and `/robots.txt` at build time. Google discovers and indexes all pages on the first crawl.

---

### Blog / Writing Section

A `app/blog/[slug]/page.tsx` with MDX support (`@next/mdx`):

```
/blog/how-i-built-the-hero-particle-system
/blog/webgpu-in-2025-what-actually-works
/blog/building-a-saas-solo
```

Each article: statically generated, full OG image, structured data for Google Rich Results. Technical writing about projects done builds **domain authority** for "React Three.js developer", "WebGL portfolio" keywords. Portfolio visitors who stay to read an article are 10× more likely to reach out. A blog is also a living proof of depth that no project card can replicate.

---

### Project-Specific OG Images

Generate a unique OG image per project using the project title + tech stack:

```ts
// app/api/og/work/[slug]/route.tsx
export function GET(req: Request, { params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug)
  return new ImageResponse(
    <div>
      <h1>{project.title}</h1>
      <div>{project.tech.join(' · ')}</div>
    </div>
  )
}
```

When shared on LinkedIn, each case study link shows a custom branded preview instead of the generic portfolio OG image.

---

## 6. PRIORITY ORDER

```
Immediate (working Next.js build)
  [x] Install next, uninstall vite + react-helmet-async + @vercel/node
  [x] Create next.config.ts
  [x] Replace tsconfig.json with Next.js config
  [x] Update tailwind.config.js content paths
  [x] Move src/index.css → app/globals.css; update font import strategy
  [x] Create app/layout.tsx with Metadata API (replaces SEO.tsx + index.html)
  [x] Create src/components/ClientShell.tsx (extracted from App.tsx)
  [x] Create app/page.tsx rendering ClientShell
  [x] Create app/not-found.tsx (replaces window.location check)
  [x] Create app/api/contact/route.ts (replaces /api/contact.ts)
  [x] Add 'use client' to all browser-dependent components
  [x] Delete: main.tsx, App.tsx, SEO.tsx, index.html, vite.config.ts, tsconfig.app.json, tsconfig.node.json, /api/contact.ts
  [x] Revoke exposed Resend API key; add new key to .env.local

Short-term (polish + optimisation)
  [x] Switch fonts to next/font/local (preload + swap)
  [x] Add dynamic OG image via app/api/og/route.tsx
  [x] Add runtime: 'edge' to contact route handler
  [x] Add app/sitemap.ts + app/robots.ts

Advanced (SEO + career impact)
  [x] Generate static case study pages (/work/[slug])
  [x] Project-specific OG images per case study
  [x] Replace /api/contact route with Server Action

Game-changing
  [x] Add blog/writing section with MDX (/blog/[slug])
  [x] Structured data (JSON-LD) on homepage + case study pages
  [x] Per-article OG image generation
```

---

## 7. QUICK REFERENCE — KEY CODE

```ts
// next.config.ts
import type { NextConfig } from 'next'
const config: NextConfig = { transpilePackages: ['three'] }
export default config
```

```tsx
// app/layout.tsx — Metadata (replaces react-helmet-async entirely)
export const metadata: Metadata = {
  metadataBase: new URL('https://martinpetrov.dev'),
  title: 'Martin Petrov — Frontend & Full-Stack Developer',
  description: '...',
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
}
```

```tsx
// app/api/contact/route.ts — Route Handler (replaces VercelRequest/Response)
import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  const body = await req.json()
  // ... same logic, cleaner types
}
```

```tsx
// src/components/ClientShell.tsx — the 'use client' boundary
'use client'
// All Framer Motion, Analytics, global overlays, sections live here
// app/page.tsx stays a Server Component and just renders <ClientShell />
```

```ts
// 'use client' — add this ONE line at the top of every interactive component:
'use client'
import { useEffect, useRef } from 'react'
// ... rest of component unchanged
```

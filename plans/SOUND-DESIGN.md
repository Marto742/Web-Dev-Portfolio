# Sound Design Toggle — Plan
> Stack: Web Audio API + React (no audio files) | Placement: Navbar beside ThemeToggle

---

## 1. WHAT WE CURRENTLY HAVE

### Navbar
- `src/components/Navbar.tsx` — fixed header with logo, nav links, Resume button
- **ThemeToggle** sits at desktop nav (line 85) and mobile nav (line 91) — icon button, `w-8 h-8`, `text-ink-muted hover:text-amber`, Framer Motion AnimatePresence icon swap
- `src/components/ThemeToggle.tsx` — uses `useTheme()` from `next-themes`, persists in localStorage automatically, toggles `dark`/`light`

### Existing Audio Code
- `src/components/sections/HeroWebGL.tsx` — microphone input only (`getUserMedia`, `AnalyserNode`, `getByteFrequencyData`). Not reusable. No sound output anywhere.

### Hooks
- `src/hooks/useReducedMotion.ts` — exports `prefersReducedMotion(): boolean` (synchronous, reads `prefers-reduced-motion` media query). **Must check this before playing any sound.**
- No sound hook exists.

### Theme Persistence Pattern
```ts
// ThemeToggle.tsx
const { theme, setTheme } = useTheme()  // next-themes handles localStorage
onClick={() => setTheme(isDark ? 'light' : 'dark')}
```
Sound toggle will mirror this: `localStorage.getItem('soundEnabled')`, defaulting to `'true'`.

---

## 2. WHAT'S MISSING

### No Sound System
The portfolio has zero sound output. No AudioContext, no synthesized tones, no UI feedback sounds. The DIAGNOSIS.md Phase 3 item `[ ] Sound design toggle` is completely unimplemented.

**Why it matters:**
| Scenario | Impact |
|---|---|
| Recruiter hovers nav links | No feedback — feels like a static page |
| User submits contact form | No success/failure audio cue |
| Contribution graph animates in | Silent — misses the "musical fingerprint" viral feature |

### Secondary Issues
- No global opt-out — if we add sounds without a toggle, it'll annoy users
- Must default to **off** or respect `prefers-reduced-motion` to avoid accessibility complaints
- `AudioContext` must be created **after a user gesture** (browser autoplay policy) — lazy init required

---

## 3. IMPLEMENTATION PLAN

### Architecture — Module Singleton + Custom Event

No new Context or Provider needed. A module-level singleton holds the `AudioContext`. `SoundToggle` writes to `localStorage` and dispatches a `sound-toggle` CustomEvent so any component can react without prop drilling.

```ts
// src/lib/sound.ts — module singleton
let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('soundEnabled') !== 'false'
}

export function setSoundEnabled(val: boolean): void {
  localStorage.setItem('soundEnabled', String(val))
  window.dispatchEvent(new Event('sound-toggle'))
}
```

Sound functions check `isSoundEnabled()` + `prefersReducedMotion()` before playing — always a no-op if either says no.

### Sound Synthesis — Web Audio API Oscillator + Gain Envelope

All sounds are synthesized — no `.mp3` files needed. Pattern: create oscillator → connect to gain node → connect to `ctx.destination` → schedule attack/decay → `.start()` / `.stop()`.

```ts
function playTone(freq: number, duration: number, gain: number, type: OscillatorType = 'sine') {
  if (!isSoundEnabled() || prefersReducedMotion()) return
  const ctx = getCtx()
  if (ctx.state === 'suspended') ctx.resume()

  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.connect(g)
  g.connect(ctx.destination)

  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)

  // Envelope: fast attack, exponential decay
  g.gain.setValueAtTime(0, ctx.currentTime)
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + duration)
}
```

### Sound Event Palette

| Event | Function | Freq | Duration | Gain | Trigger |
|---|---|---|---|---|---|
| Nav hover | `playHover()` | 1200 Hz | 0.04s | 0.04 | `[data-hover]` mouseenter |
| Button click | `playClick()` | 700 Hz | 0.08s | 0.06 | any `<button>` onClick |
| Form success | `playSuccess()` | C4→E4→G4 chord | 0.5s | 0.05 | contact form sent |
| Form error | `playError()` | 200 Hz sawtooth | 0.15s | 0.04 | form validation fail |
| Graph cell | `playNote(count)` | 220+(count×88) Hz | 0.12s | 0.03 | graph scroll-in stagger |

### SoundToggle Component

Mirrors `ThemeToggle.tsx` exactly — same size, same classes, same AnimatePresence icon swap pattern. Icon: speaker wave (sound on) / speaker mute (sound off).

```tsx
// src/components/SoundToggle.tsx
'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { isSoundEnabled, setSoundEnabled } from '@/lib/sound'

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(false) // default off until mounted

  useEffect(() => {
    setEnabled(isSoundEnabled())
    const handler = () => setEnabled(isSoundEnabled())
    window.addEventListener('sound-toggle', handler)
    return () => window.removeEventListener('sound-toggle', handler)
  }, [])

  const toggle = () => setSoundEnabled(!enabled)

  return (
    <button
      onClick={toggle}
      className="relative w-8 h-8 flex items-center justify-center text-ink-muted hover:text-amber transition-colors duration-300"
      aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {enabled ? <SpeakerOnIcon key="on" /> : <SpeakerOffIcon key="off" />}
      </AnimatePresence>
    </button>
  )
}
```

### Navbar Integration

Add `<SoundToggle />` directly beside `<ThemeToggle />` in both desktop and mobile positions. No layout changes needed — same flex row.

```tsx
// Navbar.tsx — desktop (beside ThemeToggle, line ~85)
<SoundToggle />
<ThemeToggle />

// Navbar.tsx — mobile (beside ThemeToggle, line ~91)
<SoundToggle />
<ThemeToggle />
```

### Wiring Sounds to UI Events

**Nav hover** — add `onMouseEnter={playHover}` to each `<a>` link in Navbar. The links already have `data-hover` for the cursor system, so add the sound alongside.

**Contact form** — in `src/components/sections/Contact.tsx`, call `playSuccess()` in the `.then()` of the form submit and `playError()` on validation failure.

**Contribution graph** — in `GraphLoaded` (`src/components/ContributionGraph.tsx`), pass a `playNote(count)` call into the `useStaggerReveal` stagger callback, or trigger it inside `onMouseEnter` per cell (simpler: just on hover, not on scroll-in).

### Files to Create / Change

| File | Change |
|---|---|
| `src/lib/sound.ts` | New — AudioContext singleton, `isSoundEnabled`, `setSoundEnabled`, `playHover`, `playClick`, `playSuccess`, `playError`, `playNote` |
| `src/components/SoundToggle.tsx` | New — icon toggle button, mirrors ThemeToggle pattern |
| `src/components/Navbar.tsx` | Updated — import SoundToggle, add beside ThemeToggle in both desktop + mobile |
| `src/components/sections/Contact.tsx` | Updated — `playSuccess()` on send, `playError()` on fail |
| `src/components/ContributionGraph.tsx` | Updated — `playNote(count)` on cell hover |

---

## 4. ADVANCED FEATURES

### Contribution Graph Musical Fingerprint
- On scroll-in, each week column plays a note as it animates: frequency mapped to that week's total contributions
- Creates a unique audio signature of your coding activity
- Implementation: hook into `useStaggerReveal`'s stagger timing with `setTimeout` per column index

### Ambient Mode (Off by Default)
- Very low-volume ambient drone (40 Hz sine, gain 0.01) that fades in when user is idle for 5s
- Fades out on interaction
- Gate behind a separate `ambientEnabled` flag

### Sound Themes
- Toggle between two palettes: `'crystal'` (sine waves, high freq) and `'deep'` (triangle waves, lower freq)
- Stored as `localStorage.getItem('soundTheme')`

---

## 5. PRIORITY ORDER

```
Immediate
  [x] Create src/lib/sound.ts (AudioContext singleton + playHover, playClick, playSuccess, playError, playNote)
  [x] Create src/components/SoundToggle.tsx (speaker on/off icon toggle)
  [x] Add SoundToggle to Navbar.tsx (desktop + mobile, beside ThemeToggle)
  [x] Wire playHover() to nav link mouseenter in Navbar.tsx

Polish
  [x] Wire playSuccess() / playError() to Contact form submit
  [x] Wire playNote(count) to ContributionGraph cell hover

Advanced
  [x] Contribution graph scroll-in musical fingerprint (staggered playNote per column)
  [x] Ambient drone mode
```

---

## 6. QUICK REFERENCE — KEY CODE

### src/lib/sound.ts — Full Skeleton

```ts
import { prefersReducedMotion } from '@/hooks/useReducedMotion'

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('soundEnabled') !== 'false'
}

export function setSoundEnabled(val: boolean): void {
  localStorage.setItem('soundEnabled', String(val))
  window.dispatchEvent(new Event('sound-toggle'))
}

function playTone(freq: number, duration: number, gain: number, type: OscillatorType = 'sine'): void {
  if (!isSoundEnabled() || prefersReducedMotion()) return
  const c = getCtx()
  if (c.state === 'suspended') c.resume()
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.connect(g)
  g.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime)
  g.gain.setValueAtTime(0, c.currentTime)
  g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.01)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + duration)
}

export const playHover   = () => playTone(1200, 0.04, 0.04)
export const playClick   = () => playTone(700,  0.08, 0.06)
export const playError   = () => playTone(200,  0.15, 0.04, 'sawtooth')
export const playNote    = (count: number) => playTone(220 + count * 88, 0.12, 0.03)

export function playSuccess(): void {
  [261.63, 329.63, 392.00].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.4, 0.05), i * 80)
  })
}
```

### Default State
- `localStorage.getItem('soundEnabled')` returns `null` on first visit → `isSoundEnabled()` returns `true` (opt-in by default)
- Consider defaulting to **`false`** (opt-out) by changing the check to `=== 'true'` — less surprising for users on shared computers or public contexts
- Recommended: **default off** — change `!== 'false'` to `=== 'true'`

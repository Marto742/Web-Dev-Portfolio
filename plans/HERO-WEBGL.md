# Hero WebGL — Full Feature Audit
> Scope: `src/components/sections/Hero.tsx` | Three.js particle system + fallback strategy

---

## 1. WHAT WE CURRENTLY HAVE

### The Three.js Particle System

**Setup**
- `1,800` particles in a spherical formation using spherical coordinates
- `WebGLRenderer` with `alpha: true`, `antialias: true`
- Pixel ratio capped at `2` for performance
- Camera: `PerspectiveCamera(70)` at `z = 55`
- Geometry: `BufferGeometry` with `DynamicDrawUsage` position + color attributes
- Material: `PointsMaterial` with `AdditiveBlending`, `sizeAttenuation`, `depthWrite: false`

**Particle Behavior**
- **Float animation** — each particle drifts using `sin/cos` on a per-particle phase offset, creating organic movement
- **Mouse repulsion** — 9-unit radius in world space; particles flee the cursor and turn amber on proximity
- **Slow rotation** — `points.rotation.y = t * 0.015`, `points.rotation.x = sin(t * 0.008) * 0.06`
- **Color interpolation** — particles ease back to their base color (amber 12%, dim 18%, white 70%) after cursor leaves
- **Parallax on scroll** — `useScroll` + `useTransform` moves the content layer upward as you scroll

**Text Layer**
- Letter-by-letter name reveal via Framer Motion `custom` + staggered delay
- Typewriter subtitle via `useTypewriter` hook (character-by-character)
- Kicker label, magnetic CTA button, animated scroll indicator

**What's Already Fixed**
- `prefers-reduced-motion` guard — skips rotation + float, keeps mouse repulsion
- Mouse/touch: touch devices get the full visual (canvas renders) but no mouse events fire

---

## 2. WHAT'S BROKEN / MISSING

### The Critical Gap — Zero WebGL Detection

```ts
// Current code — no guard at all:
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
// If WebGL is unavailable, this throws and the entire Hero is blank
```

**Who is affected:**
| Scenario | Frequency | Impact |
|---|---|---|
| Old Android WebView (in-app browser) | Common | Blank hero |
| LinkedIn / Instagram in-app browser | Very common for portfolio sharing | Blank hero |
| Corporate proxy with WebGL blocked | Occasional | Blank hero |
| Low-power GPU with WebGL disabled | Rare | Blank hero |
| Safari Private Browsing (some iOS) | Occasional | Degraded |

**The current failure mode:** `renderer` throws, the `useEffect` crashes silently, the `<canvas>` is invisible, the hero section shows only the dark background. The text layer still renders but without the particle atmosphere the section looks broken and empty.

### Secondary Issues
- **Bundle cost** — Three.js is `~580KB` minified. It's loaded unconditionally, even on devices that can't use it.
- **No loading shimmer** — canvas starts invisible and pops in after JS parses + Three.js initialises (~200–400ms on fast connections, 1–2s on slow ones)
- **Memory leak risk** — `renderer.dispose()` and `geo.dispose()` exist in cleanup but `ScrollTrigger` instances from GSAP are not cleaned up if Hero unmounts mid-scroll
- **No resize debounce** — `handleResize` fires on every pixel of window resize, triggering expensive `renderer.setSize` calls

---

## 3. FALLBACK IMPLEMENTATION PLAN

### Detection Strategy

```ts
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}
```

Check once at mount — not reactive (WebGL support doesn't change mid-session).

### Fallback Tier Structure

```
Tier 1 — Full WebGL (current)
  └─ Three.js particles, mouse repulsion, rotation
     → Condition: WebGL available + NOT reduced motion on low-end

Tier 2 — CSS Particle Fallback
  └─ Pure CSS animated dots, no JS animation loop
     → Condition: WebGL unavailable OR low-end GPU

Tier 3 — Static Ambient
  └─ Radial gradient glow, film grain, no motion
     → Condition: prefers-reduced-motion + no WebGL
```

### Tier 2 — CSS Fallback Design

**What it looks like:**

```
┌─────────────────────────────────────────┐
│  [dark #090909 background]              │
│                                         │
│  · ·  ·    ·    ·  ·    ·   ·          │
│    ·    ·       ·      ·  ·    ·        │
│  ·    ·   ·  ·    ·  ·       ·   ·     │
│                                         │
│       Martin Petrov.                   │
│       Frontend & Full-Stack Developer   │
│                                         │
│  ·  ·    ·    ·    ·  ·   ·  ·         │
│    ·   ·    ·    ·    ·     ·   ·       │
└─────────────────────────────────────────┘
```

**Implementation approach:**
- 60–80 `<span>` dots positioned absolutely via inline style with `left/top` as percentages
- Each dot gets a randomised `animation-delay` and `animation-duration` for the float keyframe
- 12% of dots are amber (`#F5A623`), 18% dim (`#3a3a3a`), 70% white
- Uses existing `float` keyframe already in `index.css`
- `@media (prefers-reduced-motion: reduce)` suppresses the float — dots become static
- Zero JS after mount (no rAF loop)

**Component structure:**

```tsx
// src/components/sections/HeroFallback.tsx
// Receives the same props/layout as Hero
// Pure CSS — no Three.js import, no rAF loop
// Drops into Hero.tsx via conditional render
```

### Files to Create / Change

| File | Change |
|---|---|
| `src/hooks/useWebGL.ts` | New — `isWebGLAvailable()` detection hook, memoised |
| `src/components/sections/HeroFallback.tsx` | New — CSS-only particle layer, same text content |
| `src/components/sections/Hero.tsx` | Updated — import hook + conditionally render fallback |

### Bundle Optimisation (bonus)

Since Three.js is `~580KB`, lazy-load it only when WebGL is confirmed available:

```ts
// Hero.tsx
const webgl = useWebGL()

useEffect(() => {
  if (!webgl) return // skip — fallback is rendering
  // dynamic import so Three.js isn't in the initial bundle
  import('three').then(THREE => { /* setup */ })
}, [webgl])
```

This saves ~580KB from the initial parse on all fallback devices.

---

## 4. ADVANCED FEATURES

### Performance Improvements (Realistic)

**Adaptive particle count by device tier**
```ts
const PARTICLE_COUNT = (() => {
  const cores = navigator.hardwareConcurrency ?? 4
  if (cores <= 2) return 600     // low-end
  if (cores <= 4) return 1200    // mid-range
  return 1800                    // high-end (current)
})()
```
Keeps the effect on more devices at appropriate quality.

**Resize debounce**
```ts
// Replace raw handleResize with:
const handleResize = debounce(() => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}, 150)
```

**Visibility pause**
```ts
// Pause the rAF loop when tab is hidden — saves GPU on background tabs
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(raf)
  else animate()
})
```

**Intersection pause**
```ts
// Pause when hero is scrolled out of view
const observer = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) cancelAnimationFrame(raf)
  else animate()
})
observer.observe(canvas)
```

### Visual Enhancements

**Depth fog effect**
Particles closer to camera are brighter; far particles fade. Creates genuine 3D depth perception without adding geometry.
```ts
// In the color interpolation loop:
const depthFactor = Math.max(0, (wz + 35) / 70) // normalize z to 0-1
mat.opacity = 0.4 + depthFactor * 0.35
```

**Particle size variation**
```ts
const sizes = new Float32Array(PARTICLE_COUNT)
for (let i = 0; i < PARTICLE_COUNT; i++) {
  sizes[i] = 0.1 + Math.random() * 0.3 // varied, not uniform 0.22
}
// Use ShaderMaterial instead of PointsMaterial to read sizes attribute
```

**Mouse attraction mode toggle**
Currently only repulsion. Toggle on click between repel ↔ attract — particles swarm to the cursor like a magnet. Dramatic visual shift, memorable interaction.

**Scroll-driven particle density**
As the user scrolls past the hero, particles dissolve: opacity driven by `scrollYProgress` so the transition into the About section feels intentional rather than a hard cut.

---

## 5. WEB-CHANGING / VIRAL IDEAS

### Generative Daily Formation
The particle cloud forms a different shape every day based on a date seed — a seeded PRNG (`seedrandom` or a simple LCG) picks from 6–8 presets:
- Day 0: current spherical cloud
- Day 1: your initials "MP" in 3D dot-matrix
- Day 2: DNA double helix
- Day 3: galaxy spiral
- Day 4: dodecahedron wireframe
- Day 5: waveform / audio visualiser shape
- Day 6: infinite torus knot

Each formation morphs using GSAP `gsap.to(posAttr.array, ...)` — smooth transition between shapes on load. Visitors who return on different days see something new. **The kind of thing people screenshot and share.**

```ts
const seed = new Date().toDateString() // changes daily
const formation = FORMATIONS[hashSeed(seed) % FORMATIONS.length]
```

---

### "MP" Particle Sculpture
On page load, particles begin scattered then flow into forming the letters **M** and **P** in 3D space — a particle morph animation. After 2 seconds they explode outward back into the cloud. Uses `Three.js` `CSS3DRenderer` or pre-calculated target positions for each letter glyph sampled from a canvas `fillText` call.

This is the signature moment — it identifies the portfolio owner and shows off Three.js mastery simultaneously.

---

### Interactive Particle Painting
Hold mouse button down: the repulsion radius expands 3× and particles can't return to their base positions while held — you can "paint" the field into formations. Release and they flow back. Like finger-painting with light.

**Why it's viral:** Every visitor's experience is physically unique. People will hold the button and drag across the screen. It's tactile. It ends up in "coolest portfolio interactions" lists.

---

### Audio Reactive Mode
A small microphone icon in the corner. Click to enable mic. Particle density and repulsion radius pulse to the amplitude of ambient audio — music, voice, background sound. Works via `Web Audio API` `AnalyserNode`.

Portfolio visitors who put on music while browsing will discover the hero responds to it. The kind of Easter egg that gets shared in developer Discord servers.

---

### WebGPU Upgrade Path (Future)
Three.js `r163+` ships experimental `WebGPURenderer`. Upgrading from `WebGLRenderer` → `WebGPURenderer` with a capability check enables:
- `100,000+` particles at 60fps (vs 1,800 current)
- Compute shaders for physics (real collision, flocking behaviour)
- HDR rendering with true bloom

**When:** WebGPU is supported in Chrome 113+, Edge 113+. Safari shipped it in 18.2. Firefox is in progress. By late 2026 it's a safe progressive enhancement.

```ts
const renderer = await (
  isWebGPUAvailable()
    ? new THREE.WebGPURenderer({ canvas })  // 100k particles
    : new THREE.WebGLRenderer({ canvas })   // 1,800 particles
)
```

---

## 6. PRIORITY ORDER

```
Immediate (fixes the bug)
  [x] Add isWebGLAvailable() detection hook
  [x] Create HeroFallback.tsx — CSS particle layer
  [x] Update Hero.tsx to conditionally render fallback
  [x] Lazy-load Three.js (remove from initial bundle)

Short-term (polish)
  [x] Add resize debounce
  [x] Add visibility + intersection pause
  [x] Adaptive particle count by device tier
  [x] Scroll-driven particle dissolve on section exit

Advanced (wow factor)
  [x] Mouse attract/repel toggle
  [x] Depth fog effect
  [x] Particle size variation (ShaderMaterial)
  [x] Daily generative formation (seedrandom)

Viral
  [x] "MP" particle sculpture on load
  [x] Interactive particle painting (hold to paint)
  [x] Audio reactive mode (Web Audio API)
  [x] WebGPU upgrade path (100k particles)
```

---

## 7. QUICK REFERENCE — DETECTION CODE

```ts
// src/hooks/useWebGL.ts
import { useMemo } from 'react'

export function useWebGL(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined') return false
    try {
      const canvas = document.createElement('canvas')
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      )
    } catch {
      return false
    }
  }, [])
}
```

```tsx
// Hero.tsx — drop-in guard
const webgl = useWebGL()
if (!webgl) return <HeroFallback />
// ... rest of Three.js setup unchanged
```

Two lines of change to the existing Hero.tsx. Everything else is additive.

# Cursor Trail Particles — Plan
> Stack: React 18 + TypeScript + Framer Motion + Tailwind | Component: `src/components/CustomCursor.tsx`

---

## 1. WHAT WE CURRENTLY HAVE

### CustomCursor Architecture
| Element | Description | Spring Config |
|---|---|---|
| Core dot | 5px amber circle, snaps fast to cursor | `stiffness: 600, damping: 45, mass: 0.5` |
| Trail ring | 28px amber border circle, lags behind | `stiffness: 120, damping: 28, mass: 0.8` |

### Behaviour
- Expands on hover over `a, button, [data-hover], input, textarea, label, [role="button"]`
- Fades out when cursor leaves viewport
- Disabled entirely on touch devices via `window.matchMedia('(pointer: coarse)')` guard
- Mount guard prevents SSR hydration mismatch (`useState(false)` + `useEffect`)

### CSS Context
- `html { cursor: none }` — hides system cursor globally
- `a, button, [role="button"], input, textarea, select { cursor: none }` — hides on interactives
- Amber: `#F5A623` (DEFAULT), `#FFD060` (light), `#D4881A` (dark)

---

## 2. WHAT NEEDS IMPLEMENTING (The Task)

### Core Trail Particles — Immediate
- [x] **Emit 5 fading amber dots behind the cursor** — each dot spawns at the cursor's current position and fades out over ~600ms while drifting slightly. Creates a comet-tail effect.
- [x] **Stagger the particle opacity/scale decay** — particle 1 is brightest/largest, particle 5 is faintest/smallest. Smooth gradient of fade from newest to oldest.
- [x] **Store last N positions in a ref** — use a circular buffer of 5 positions, updated every `mousemove`. Each position renders as a particle at a fixed index.
- [x] **No new dependencies** — implement entirely with Framer Motion `motion.div` + `useMotionValue`/`useSpring`, matching the existing cursor architecture.
- [x] **Performance: use `pointer-events: none`** — particles must never intercept mouse events.
- [x] **Reduced motion: skip particles** — wrap in `useReducedMotion()` check, return null if user prefers reduced motion.

### Files to Change
| File | Change |
|---|---|
| `src/components/CustomCursor.tsx` | Add `TrailParticles` sub-component inside `CursorInner` |

---

## 3. ADVANCED FEATURES (High Polish)

### Particle Behaviour Variants
- [x] **Velocity-based sizing** — faster mouse movement = larger, more spread-out particles. Slow movement = tiny tight cluster. Calculate velocity from delta between last two positions.
- [x] **Burst on click** — when the user clicks, emit 8–12 particles that explode outward in a radial pattern before fading. Uses `mousedown` event.
- **Hover-state colour shift** — particles turn `amber-light` (#FFD060) when hovering over interactive elements, matching the ring expansion.
- **Particle shape variants** — switch between circle dots (default), tiny `+` crosshairs, or diamond shapes based on what's being hovered (link vs button vs input).

### Performance Improvements
- [x] **Canvas renderer** — replace `motion.div` particles with a `<canvas>` overlay drawn with `requestAnimationFrame`. Zero DOM nodes, handles 50+ particles at 60fps without reflows.
- **Throttle position updates** — cap `mousemove` updates to 60fps with `requestAnimationFrame` to avoid excessive renders on high-refresh displays.

---

## 4. WEB-CHANGING / VIRAL FEATURES

### Particle System Upgrade
- **Magnetic trail** — particles don't just follow the cursor path; they orbit the cursor position in a tight cluster, like electrons around a nucleus. Each particle has its own angular velocity. Surreal, hypnotic.
- **Context-aware trail** — the trail morphs based on what section the cursor is in:
  - Hero: amber sparks (current)
  - Projects: tiny code brackets `{ }` that orbit
  - Skills: orbital dots matching the Skills section's concentric ring aesthetic
  - Contact: paper plane emoji particles that drift upward
- **Trail that reacts to scroll speed** — fast scrolling stretches the particles into vertical streaks; slow scrolling returns them to tight dots. Uses scroll velocity from GSAP or a custom `useScrollVelocity` hook.
- **WebGL particle trail** — render the cursor trail in the existing Three.js scene (Hero section only) as a 3D ribbon that bends in Z-space as the cursor moves. The ribbon dissipates into the particle field.
- **Color gradient trail** — trail cycles through a slow amber→white→amber gradient over time, like a living flame. Achieved with CSS `hsl()` + time-based animation offset per particle index.

---

## 5. IMPLEMENTATION APPROACH

### Recommended: Position Buffer with Framer Motion

```tsx
// Inside CursorInner — add alongside existing trail ring + core dot
const TRAIL_COUNT = 5

function TrailParticles({ mouseX, mouseY }: { mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  const positions = useRef<Array<{ x: number; y: number }>>([])
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([])

  useEffect(() => {
    return mouseX.on('change', () => {
      const x = mouseX.get()
      const y = mouseY.get()
      positions.current = [{ x, y }, ...positions.current].slice(0, TRAIL_COUNT)
      setTrail(positions.current.map((p, i) => ({ ...p, id: i })))
    })
  }, [mouseX, mouseY])

  return (
    <>
      {trail.map((pos, i) => (
        <motion.div
          key={pos.id}
          className="fixed top-0 left-0 pointer-events-none z-[9997] rounded-full bg-amber"
          style={{ x: pos.x, y: pos.y, translateX: '-50%', translateY: '-50%' }}
          animate={{ opacity: 0, scale: 0 }}
          initial={{ opacity: (TRAIL_COUNT - i) / TRAIL_COUNT * 0.6, scale: (TRAIL_COUNT - i) / TRAIL_COUNT }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}
```

> **Note:** The snippet above is a reference implementation. Read the current `CustomCursor.tsx` before writing anything and adapt to match the actual code structure.

### Key Decisions
- `z-[9997]` — particles sit below the trail ring (`9998`) and core dot (`9999`)
- Size: start at ~6px for newest particle, scale down to ~2px for oldest
- Opacity: `0.6` at newest, near-zero at oldest — subtle, not distracting
- The `mouseX.on('change')` subscriber avoids the `mousemove` event listener duplication

---

## 6. PRIORITY CHECKLIST

```
Immediate (this session)
  [x] Add TrailParticles sub-component to CustomCursor.tsx
  [x] 5 fading amber dots with staggered opacity/scale decay
  [x] Reduced motion guard
  [x] Verify no performance regression on mobile (particles are already disabled on touch)

Advanced (future)
  [x] Velocity-based particle sizing
  [x] Click burst effect
  [x] Canvas renderer for 50+ particle count

Viral (Phase 4)
  [ ] Context-aware trail morphing per section
  [ ] WebGL trail ribbon in Three.js scene
```

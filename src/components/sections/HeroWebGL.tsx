'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { motion, useScroll, useTransform } from 'framer-motion'
import MagneticButton from '@/components/ui/MagneticButton'
import { useTypewriter } from '@/hooks/useTypewriter'
import { prefersReducedMotion } from '@/hooks/useReducedMotion'
import { isWebGPUAvailable } from '@/hooks/useWebGL'

const PARTICLE_COUNT = (() => {
  const cores = navigator.hardwareConcurrency ?? 4
  if (cores <= 2) return 600
  if (cores <= 4) return 1200
  return 1800
})()

const AMBER = new THREE.Color('#F5A623')
const WHITE = new THREE.Color('#ffffff')
const DIM = new THREE.Color('#3a3a3a')

const nameLetters = 'Martin Petrov'.split('')

const letterVariants = {
  hidden: { y: 90, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      delay: 0.3 + i * 0.045,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
}

// ── Seeded PRNG (LCG — Knuth) ─────────────────────────────────────────────
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 0x5bd1e995)
    h ^= h >>> 15
  }
  return h >>> 0
}

function makePRNG(seed: number): () => number {
  let s = seed
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) & 0xffffffff
    return (s >>> 0) / 4294967296
  }
}

const DAY_SEED = hashString(new Date().toDateString())
const DAY_INDEX = DAY_SEED % 7

// ── Formation generators (one per day of the week) ────────────────────────
type FormFn = (i: number, rand: () => number, total: number) => [number, number, number]

const FORMATIONS: FormFn[] = [
  // 0 — Spherical cloud (current default)
  (_i, rand) => {
    const phi = Math.acos(2 * rand() - 1)
    const theta = rand() * Math.PI * 2
    const r = 25 + rand() * 45
    return [
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta) * 0.65,
      r * Math.cos(phi) - 10,
    ]
  },
  // 1 — DNA double helix
  (i, rand, total) => {
    const strand = i % 2 === 0 ? 0 : Math.PI
    const progress = i / total
    const twist = progress * Math.PI * 16
    const radius = 12 + rand() * 4
    const height = (progress - 0.5) * 80
    return [
      Math.cos(twist + strand) * radius + (rand() - 0.5) * 3,
      height + (rand() - 0.5) * 2,
      Math.sin(twist + strand) * radius + (rand() - 0.5) * 3,
    ]
  },
  // 2 — Galaxy spiral (3 arms)
  (i, rand) => {
    const arm = i % 3
    const armAngle = (arm / 3) * Math.PI * 2
    const r = 5 + rand() * 55
    const angle = armAngle + r * 0.08 + rand() * 0.4
    const height = (rand() - 0.5) * (r * 0.15 + 4)
    return [Math.cos(angle) * r, height, Math.sin(angle) * r]
  },
  // 3 — Torus
  (_i, rand) => {
    const theta = rand() * Math.PI * 2
    const phi = rand() * Math.PI * 2
    const R = 28
    const r = 10 + rand() * 6
    return [
      (R + r * Math.cos(phi)) * Math.cos(theta),
      r * Math.sin(phi) * 0.6,
      (R + r * Math.cos(phi)) * Math.sin(theta),
    ]
  },
  // 4 — Box shell
  (_i, rand) => {
    const face = Math.floor(rand() * 6)
    const u = (rand() - 0.5) * 60
    const v = (rand() - 0.5) * 60
    const d = rand() * 4
    const faces: [number, number, number][] = [
      [30 + d, u, v * 0.5], [-30 - d, u, v * 0.5],
      [u, 28 + d, v * 0.5], [u, -28 - d, v * 0.5],
      [u, v * 0.5, 30 + d], [u, v * 0.5, -30 - d],
    ]
    return faces[face]
  },
  // 5 — Sine wave field
  (_i, rand) => {
    const x = (rand() - 0.5) * 120
    const z = (rand() - 0.5) * 80
    const y = Math.sin(x * 0.1) * Math.cos(z * 0.12) * 18 + (rand() - 0.5) * 4
    return [x, y, z]
  },
  // 6 — Flat ring (Saturn-style)
  (_i, rand) => {
    const theta = rand() * Math.PI * 2
    const r = 18 + rand() * 42
    const h = (rand() - 0.5) * (3 + (r - 18) * 0.06)
    return [Math.cos(theta) * r, h, Math.sin(theta) * r]
  },
]

// ── MP glyph sampler ──────────────────────────────────────────────────────
function easeInOut(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}

function sampleMPGlyph(count: number): Float32Array {
  const cvs = document.createElement('canvas')
  cvs.width = 300
  cvs.height = 110
  const ctx = cvs.getContext('2d')
  if (!ctx) return new Float32Array(count * 3)

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, cvs.width, cvs.height)
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 96px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('MP', 150, 55)

  const { data } = ctx.getImageData(0, 0, cvs.width, cvs.height)
  const pixels: [number, number][] = []
  for (let py = 0; py < cvs.height; py++) {
    for (let px = 0; px < cvs.width; px++) {
      if (data[(py * cvs.width + px) * 4] > 128) pixels.push([px, py])
    }
  }

  if (pixels.length === 0) return new Float32Array(count * 3)

  // Map canvas pixels → world space (camera at z=55, fov=70 → ±38 world units tall)
  const scaleX = 44 / cvs.width
  const scaleY = 20 / cvs.height
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const [px, py] = pixels[Math.floor(Math.random() * pixels.length)]
    out[i * 3] = (px - cvs.width / 2) * scaleX
    out[i * 3 + 1] = -(py - cvs.height / 2) * scaleY // flip Y (canvas Y down, world Y up)
    out[i * 3 + 2] = (Math.random() - 0.5) * 3       // slight Z spread for 3D depth
  }
  return out
}

// ── GLSL shaders ──────────────────────────────────────────────────────────
const VERT = /* glsl */`
  attribute vec3 color;
  attribute float aSize;
  uniform float uScale;
  varying vec3 vColor;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const FRAG = /* glsl */`
  varying vec3 vColor;
  uniform float uOpacity;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = (1.0 - smoothstep(0.3, 0.5, d)) * uOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`

export default function HeroWebGL() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseWorldRef = useRef(new THREE.Vector3())
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollY } = useScroll()
  const parallaxY = useTransform(scrollY, [0, 600], [0, -80])
  const indicatorOpacity = useTransform(scrollY, [0, 200], [1, 0])

  const subtitle = useTypewriter('Frontend & Full-Stack Developer', 55, 1800)
  const [attractMode, setAttractMode] = useState(false)
  const [micState, setMicState] = useState<'idle' | 'active' | 'denied'>('idle')

  // Audio reactive refs — shared between toggleMic (user gesture) and rAF loop
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioAmplRef = useRef(0)
  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    let cancelled = false
    // Holds the teardown logic built inside the async setup.
    // The synchronous return below calls this once setup completes.
    let teardown: (() => void) | undefined

    const setup = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      // ── Particle count ──────────────────────────────────────────────────
      // Scale up on WebGPU-capable hardware for a denser field. ShaderMaterial
      // is not compatible with WebGPURenderer's WGSL transpiler in Three.js
      // r167, so we always use WebGLRenderer — the count gate is still useful
      // as a proxy for GPU tier.
      const count = isWebGPUAvailable() ? Math.min(PARTICLE_COUNT * 5, 9000) : PARTICLE_COUNT

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200)
    camera.position.z = 55

    // ── Renderer ────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    // Geometry — seeded so the whole cloud is reproducible per day
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const basePos = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    const sizes = new Float32Array(count)
    const isAmber = new Uint8Array(count)

    const rand = makePRNG(DAY_SEED)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const [x, y, z] = FORMATIONS[DAY_INDEX](i, rand, count)

      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z
      basePos[i3] = x
      basePos[i3 + 1] = y
      basePos[i3 + 2] = z

      phases[i] = rand() * Math.PI * 2
      sizes[i] = 0.1 + rand() * 0.3

      const roll = rand()
      isAmber[i] = roll < 0.12 ? 1 : roll < 0.3 ? 2 : 0 // 1=amber, 2=dim, 0=white

      const c = isAmber[i] === 1 ? AMBER : isAmber[i] === 2 ? DIM : WHITE
      colors[i3] = c.r
      colors[i3 + 1] = c.g
      colors[i3 + 2] = c.b
    }

    // paintPos: paintable anchor positions; copy of basePos, diverges during
    // painting and lerps back on release
    const paintPos = new Float32Array(basePos)

    const geo = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(positions, 3)
    const colAttr = new THREE.BufferAttribute(colors, 3)
    const sizeAttr = new THREE.BufferAttribute(sizes, 1)
    posAttr.setUsage(THREE.DynamicDrawUsage)
    colAttr.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('position', posAttr)
    geo.setAttribute('color', colAttr)
    geo.setAttribute('aSize', sizeAttr)

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uScale: { value: window.innerHeight / 2 },
        uOpacity: { value: 0.75 },
      },
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    })

    const points = new THREE.Points(geo, mat)
    scene.add(points)

    // Mouse → world
    const handleMouseMove = (e: MouseEvent) => {
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1
      const vec = new THREE.Vector3(ndcX, ndcY, 0.5)
      vec.unproject(camera)
      vec.sub(camera.position).normalize()
      const t = -camera.position.z / vec.z
      mouseWorldRef.current.copy(camera.position).addScaledVector(vec, t)
    }

    let resizeTimer: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        mat.uniforms.uScale.value = window.innerHeight / 2
      }, 150)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)

    let raf = 0
    let t = 0
    let attract = false
    let isPainting = false
    let pressStart = 0
    const reduced = prefersReducedMotion()

    // Short press (<200 ms) → toggle attract/repel; long press → painting mode
    const handleMouseDown = () => {
      isPainting = true
      pressStart = performance.now()
    }
    const handleMouseUp = () => {
      isPainting = false
      if (performance.now() - pressStart < 200) {
        attract = !attract
        setAttractMode(attract)
      }
    }
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    // ── MP particle sculpture ─────────────────────────────────────────────
    // Sample glyph positions and morph particles into "MP" on load, then
    // explode them back to the daily formation cloud. Skipped when
    // prefers-reduced-motion is set.
    const mpTargets = reduced ? null : sampleMPGlyph(count)
    const MORPH_FORM_MS = 1200
    const MORPH_HOLD_MS = 800
    const MORPH_EXPLODE_MS = 1200
    const MORPH_TOTAL_MS = MORPH_FORM_MS + MORPH_HOLD_MS + MORPH_EXPLODE_MS
    const morphStart = performance.now()

    // Pre-allocated frequency buffer — avoids GC every frame
    // analyser.fftSize = 256 → frequencyBinCount = 128
    const audioFreqData = new Uint8Array(128)

    const animate = () => {
      raf = requestAnimationFrame(animate)

      // Skip autonomous motion when reduced motion is preferred
      if (!reduced) {
        t += 0.006
        points.rotation.y = t * 0.015
        points.rotation.x = Math.sin(t * 0.008) * 0.06
      }

      // Compute morph weight: 0 = cloud positions, 1 = MP sculpture
      let morphT = 0
      if (mpTargets) {
        const elapsed = performance.now() - morphStart
        if (elapsed < MORPH_FORM_MS) {
          morphT = easeInOut(elapsed / MORPH_FORM_MS)
        } else if (elapsed < MORPH_FORM_MS + MORPH_HOLD_MS) {
          morphT = 1
        } else if (elapsed < MORPH_TOTAL_MS) {
          morphT = 1 - easeInOut((elapsed - MORPH_FORM_MS - MORPH_HOLD_MS) / MORPH_EXPLODE_MS)
        }
      }

      // Audio amplitude — smoothed to avoid jitter (lerp factor 0.15 per frame)
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(audioFreqData)
        let sum = 0
        for (let j = 0; j < audioFreqData.length; j++) sum += audioFreqData[j]
        const avg = sum / audioFreqData.length
        audioAmplRef.current += ((avg / 255) - audioAmplRef.current) * 0.15
      }
      const ampl = audioAmplRef.current

      const mx = mouseWorldRef.current.x
      const my = mouseWorldRef.current.y
      // Painting expands the interaction radius 3×; audio expands it further with amplitude
      const REPEL_RADIUS = isPainting ? 27 : 9 + ampl * 18
      const pushMult = isPainting ? 8 : 4

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const bx = basePos[i3]
        const by = basePos[i3 + 1]
        const bz = basePos[i3 + 2]
        // Use paintPos as the float anchor — it diverges from basePos during
        // painting and lerps back to basePos after release
        const px = paintPos[i3]
        const py = paintPos[i3 + 1]
        const pz = paintPos[i3 + 2]
        const ph = phases[i]

        // Static positions when reduced motion; float only when full motion
        const wx = reduced ? px : px + Math.sin(t * 0.7 + ph) * 0.6
        const wy = reduced ? py : py + Math.cos(t * 0.5 + ph + 1.2) * 0.5
        const wz = reduced ? pz : pz + Math.sin(t * 0.3 + ph + 2.4) * 0.3

        // Apply MP morph interpolation (0 = float pos, 1 = glyph target)
        const fx = morphT > 0 && mpTargets ? wx + (mpTargets[i3] - wx) * morphT : wx
        const fy = morphT > 0 && mpTargets ? wy + (mpTargets[i3 + 1] - wy) * morphT : wy
        const fz = morphT > 0 && mpTargets ? wz + (mpTargets[i3 + 2] - wz) * morphT : wz

        const dx = fx - mx
        const dy = fy - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < REPEL_RADIUS) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS
          // attract pulls toward cursor; repel pushes away
          const dir = attract ? -1 : 1
          const newX = fx + (dx / dist) * dir * force * pushMult
          const newY = fy + (dy / dist) * dir * force * pushMult
          posAttr.setXYZ(i, newX, newY, fz)
          colAttr.setXYZ(i, AMBER.r, AMBER.g, AMBER.b)
          // Painting: lock displaced position as new anchor so particles stay
          if (isPainting) {
            paintPos[i3]     = newX - Math.sin(t * 0.7 + ph) * 0.6
            paintPos[i3 + 1] = newY - Math.cos(t * 0.5 + ph + 1.2) * 0.5
          }
        } else {
          posAttr.setXYZ(i, fx, fy, fz)
          // Flow back toward basePos when not painting
          if (!isPainting) {
            paintPos[i3]     += (bx - paintPos[i3])     * 0.015
            paintPos[i3 + 1] += (by - paintPos[i3 + 1]) * 0.015
            paintPos[i3 + 2] += (bz - paintPos[i3 + 2]) * 0.015
          }
          // During morph, blend particle colors toward amber for dramatic effect
          const base = isAmber[i] === 1 ? AMBER : isAmber[i] === 2 ? DIM : WHITE
          const tr = base.r + (AMBER.r - base.r) * morphT
          const tg = base.g + (AMBER.g - base.g) * morphT
          const tb = base.b + (AMBER.b - base.b) * morphT
          // Depth fog: particles further from camera are dimmer
          const depthFactor = Math.max(0.15, Math.min(1, (fz + 35) / 70))
          const cr = colAttr.getX(i)
          const cg = colAttr.getY(i)
          const cb = colAttr.getZ(i)
          colAttr.setXYZ(
            i,
            cr + (tr * depthFactor - cr) * 0.04,
            cg + (tg * depthFactor - cg) * 0.04,
            cb + (tb * depthFactor - cb) * 0.04
          )
        }
      }

      posAttr.needsUpdate = true
      colAttr.needsUpdate = true

      // Scroll-driven dissolve, boosted by audio amplitude (peaks at +25% opacity)
      mat.uniforms.uOpacity.value = (0.75 + ampl * 0.25) * Math.max(0, 1 - scrollY.get() / 600)

      renderer.render(scene, camera)
    }

    animate()

    // Pause rAF when tab is hidden — saves GPU on background tabs
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else if (raf === 0) {
        animate()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Pause rAF when hero is scrolled out of view
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        cancelAnimationFrame(raf)
        raf = 0
      } else if (raf === 0) {
        animate()
      }
    })
    observer.observe(canvas)

      // Capture teardown so the synchronous useEffect return can call it
      // even though setup was async.
      if (!cancelled) {
        teardown = () => {
          cancelAnimationFrame(raf)
          clearTimeout(resizeTimer)
          window.removeEventListener('mousemove', handleMouseMove)
          window.removeEventListener('resize', handleResize)
          document.removeEventListener('visibilitychange', handleVisibility)
          canvas.removeEventListener('mousedown', handleMouseDown)
          window.removeEventListener('mouseup', handleMouseUp)
          observer.disconnect()
          renderer.dispose()
          geo.dispose()
          mat.dispose()
          // Stop mic if active when hero unmounts
          streamRef.current?.getTracks().forEach(t => t.stop())
          audioCtxRef.current?.close()
        }
      }
    } // ─── end setup() ───────────────────────────────────────────────────

    setup()

    return () => {
      cancelled = true
      teardown?.()
    }
  }, [])

  // Toggle microphone access for audio reactive mode
  const toggleMic = async () => {
    if (micState === 'active') {
      streamRef.current?.getTracks().forEach(t => t.stop())
      audioCtxRef.current?.close()
      analyserRef.current = null
      streamRef.current = null
      audioCtxRef.current = null
      audioAmplRef.current = 0
      setMicState('idle')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      streamRef.current = stream
      audioCtxRef.current = ctx
      analyserRef.current = analyser
      setMicState('active')
    } catch {
      setMicState('denied')
    }
  }

  const scrollToWork = () => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-bg"
    >
      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, #090909 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        style={{ y: parallaxY }}
      >
        {/* Kicker */}
        <motion.p
          className="section-label mb-8 tracking-[0.5em]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Available for freelance &amp; roles
        </motion.p>

        {/* Name — letter-by-letter reveal */}
        <h1
          className="font-display font-black leading-none tracking-tight mb-8 overflow-hidden"
          style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)' }}
          aria-label="Martin Petrov"
        >
          <span className="flex flex-wrap justify-center gap-x-[0.07em]">
            {nameLetters.map((char, i) =>
              char === ' ' ? (
                <span key={`space-${i}`} className="w-[0.25em]" />
              ) : (
                <div key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
                  <motion.span
                    custom={i}
                    variants={letterVariants}
                    initial="hidden"
                    animate="visible"
                    className="inline-block text-gradient"
                  >
                    {char}
                  </motion.span>
                </div>
              )
            )}
          </span>
        </h1>

        {/* Subtitle — typewriter */}
        <div className="h-8 mb-12 flex items-center justify-center">
          <motion.p
            className={`font-mono text-lg md:text-xl text-ink-muted tracking-wider ${
              subtitle.length < 34 ? 'typewriter-cursor' : ''
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.3 }}
          >
            {subtitle}
          </motion.p>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <MagneticButton
            onClick={scrollToWork}
            className="group relative font-mono text-sm tracking-[0.2em] uppercase text-amber border border-amber/50 px-10 py-4 hover:bg-amber/8 hover:border-amber transition-all duration-400 overflow-hidden"
          >
            <span className="relative z-10">View My Work</span>
            <span className="absolute inset-0 bg-amber/5 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Audio reactive mic toggle — bottom-left */}
      <motion.button
        className={`absolute bottom-10 left-8 flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase select-none cursor-pointer transition-colors duration-300 ${
          micState === 'active'
            ? 'text-amber/60'
            : micState === 'denied'
            ? 'text-red-500/40'
            : 'text-ink-muted/30 hover:text-amber/50'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 0.8 }}
        onClick={toggleMic}
        aria-label={micState === 'active' ? 'Disable audio reactive mode' : 'Enable audio reactive mode'}
      >
        {/* Mic icon */}
        <svg width="10" height="13" viewBox="0 0 10 13" fill="none" aria-hidden="true">
          <rect x="3" y="0" width="4" height="7" rx="2" fill="currentColor" />
          <path d="M1 5.5C1 8.26 2.79 10.5 5 10.5S9 8.26 9 5.5" stroke="currentColor" strokeWidth="1.2" />
          <line x1="5" y1="10.5" x2="5" y2="12.5" stroke="currentColor" strokeWidth="1.2" />
          <line x1="2.5" y1="12.5" x2="7.5" y2="12.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        {micState === 'active' && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber/80 animate-pulse" />
        )}
        <span>
          {micState === 'active' ? 'listening' : micState === 'denied' ? 'denied' : 'audio'}
        </span>
      </motion.button>

      {/* Attract / repel mode hint */}
      <motion.div
        className="absolute bottom-10 right-8 font-mono text-[10px] tracking-[0.3em] uppercase text-ink-muted/30 select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 0.8 }}
        aria-hidden="true"
      >
        click · {attractMode ? 'attract' : 'repel'}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: indicatorOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 0.8 }}
        aria-hidden="true"
      >
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-ink-muted/50">
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-amber/40 to-transparent animate-pulse" />
      </motion.div>
    </section>
  )
}

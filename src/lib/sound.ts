let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

// --- Ambient drone state ---
const DRONE_FREQ = 40   // Hz — deep sub-bass sine
const DRONE_GAIN = 0.01 // very low volume
const IDLE_DELAY = 5000 // ms before drone fades in
const FADE_IN_S  = 2    // seconds to fade in
const FADE_OUT_S = 1    // seconds to fade out

let ambientOsc: OscillatorNode | null = null
let ambientGain: GainNode | null = null
let idleTimer: ReturnType<typeof setTimeout> | null = null

/** Returns true if the user has opted in to sounds. Defaults to false (opt-in). */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('soundEnabled') === 'true'
}

/** Persist preference and broadcast to all listeners. */
export function setSoundEnabled(val: boolean): void {
  localStorage.setItem('soundEnabled', String(val))
  // Prime AudioContext during the click (user gesture) so it starts in 'running' state
  if (val) void getCtx().resume()
  window.dispatchEvent(new Event('sound-toggle'))
}

function playTone(
  freq: number,
  duration: number,
  gain: number,
  type: OscillatorType = 'sine',
): void {
  if (!isSoundEnabled()) return
  const c = getCtx()

  // Schedule tone inside .then() so it runs after the context is definitely running
  void c.resume().then(() => {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.connect(g)
    g.connect(c.destination)

    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime)

    // Fast attack → exponential decay envelope
    g.gain.setValueAtTime(0, c.currentTime)
    g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)

    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration)
  })
}

export const playHover = (): void => playTone(1200, 0.06, 0.08)
export const playClick = (): void => playTone(700,  0.10, 0.18)
export const playError = (): void => playTone(200,  0.20, 0.14, 'sawtooth')
export const playNote  = (count: number): void => playTone(220 + count * 88, 0.15, 0.07)

/** Returns true if ambient drone is enabled. Defaults to false — opt-in only. */
export function isAmbientEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('ambientEnabled') === 'true'
}

export function setAmbientEnabled(val: boolean): void {
  localStorage.setItem('ambientEnabled', String(val))
  if (!val) fadeOutDrone()
  window.dispatchEvent(new Event('ambient-toggle'))
}

function fadeInDrone(): void {
  if (!isSoundEnabled() || !isAmbientEnabled()) return
  const c = getCtx()
  if (c.state === 'suspended') void c.resume()

  if (!ambientOsc) {
    ambientOsc = c.createOscillator()
    ambientGain = c.createGain()
    ambientOsc.connect(ambientGain)
    ambientGain.connect(c.destination)
    ambientOsc.type = 'sine'
    ambientOsc.frequency.setValueAtTime(DRONE_FREQ, c.currentTime)
    ambientGain.gain.setValueAtTime(0, c.currentTime)
    ambientOsc.start()
  }

  const g = ambientGain!
  g.gain.cancelScheduledValues(c.currentTime)
  g.gain.setValueAtTime(g.gain.value, c.currentTime)
  g.gain.linearRampToValueAtTime(DRONE_GAIN, c.currentTime + FADE_IN_S)
}

function fadeOutDrone(): void {
  if (!ambientGain) return
  const c = getCtx()
  const g = ambientGain
  g.gain.cancelScheduledValues(c.currentTime)
  g.gain.setValueAtTime(g.gain.value, c.currentTime)
  g.gain.linearRampToValueAtTime(0, c.currentTime + FADE_OUT_S)
}

function resetIdleTimer(): void {
  fadeOutDrone()
  if (idleTimer !== null) clearTimeout(idleTimer)
  idleTimer = setTimeout(fadeInDrone, IDLE_DELAY)
}

const INTERACTION_EVENTS = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'] as const

/**
 * Start ambient idle detection. Call once on app mount.
 * Returns a cleanup function for unmount.
 */
export function startAmbientMode(): () => void {
  const handler = () => resetIdleTimer()
  INTERACTION_EVENTS.forEach(e => window.addEventListener(e, handler, { passive: true }))
  resetIdleTimer()

  return () => {
    INTERACTION_EVENTS.forEach(e => window.removeEventListener(e, handler))
    if (idleTimer !== null) clearTimeout(idleTimer)
    fadeOutDrone()
  }
}

export function playSuccess(): void {
  ;[261.63, 329.63, 392.0].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.5, 0.22), i * 80)
  })
}

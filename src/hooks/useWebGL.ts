import { useMemo } from 'react'

/**
 * Plain utility — safe to call inside useEffect or outside React.
 * Returns true when WebGL is available in the current environment.
 */
export function isWebGLAvailable(): boolean {
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
}

/**
 * React hook — memoised so the canvas probe runs only once per mount.
 * Use at the top of a component to conditionally render a WebGL fallback.
 *
 * @example
 * const webgl = useWebGL()
 * if (!webgl) return <HeroFallback />
 */
export function useWebGL(): boolean {
  return useMemo(() => isWebGLAvailable(), [])
}

/**
 * Checks for WebGPU availability once synchronously.
 * `navigator.gpu` is present in Chrome 113+, Edge 113+, Safari 18.2+.
 * Does NOT await `navigator.gpu.requestAdapter()` — a device may still
 * be unavailable, but this is sufficient for a capability gate.
 */
export function isWebGPUAvailable(): boolean {
  if (typeof window === 'undefined') return false
  return 'gpu' in navigator
}

'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { isWebGLAvailable } from '@/hooks/useWebGL'
import HeroFallback from '@/components/sections/HeroFallback'

const HeroWebGL = lazy(() => import('@/components/sections/HeroWebGL'))

export default function Hero() {
  const [webgl, setWebgl] = useState(false)
  useEffect(() => { setWebgl(isWebGLAvailable()) }, [])
  if (!webgl) return <HeroFallback />
  return (
    <Suspense fallback={<HeroFallback />}>
      <HeroWebGL />
    </Suspense>
  )
}

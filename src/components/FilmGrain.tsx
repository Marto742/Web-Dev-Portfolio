'use client'

import { useState, useEffect } from 'react'

export default function FilmGrain() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return <div className="grain-overlay" aria-hidden="true" />
}

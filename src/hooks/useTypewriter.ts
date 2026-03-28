import { useState, useEffect } from 'react'

export function useTypewriter(text: string, speed = 55, delay = 0): string {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    const startTimer = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) clearInterval(interval)
      }, speed)
      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [text, speed, delay])

  return displayed
}

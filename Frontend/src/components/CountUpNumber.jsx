import { useEffect, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'

/**
 * CountUpNumber
 * Milestone 3 - Day 8
 *
 * Use on Practice.jsx's accuracy score reveal, e.g.:
 *   <CountUpNumber value={accuracy} suffix="%" />
 *
 * Respects prefers-reduced-motion via Framer Motion's own hook — same
 * mechanism your global CSS reduced-motion query already relies on.
 */

export default function CountUpNumber({ value, suffix = '', durationSec = 0.8 }) {
  const prefersReducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(prefersReducedMotion ? value : 0)

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, {
      duration: durationSec,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [value, durationSec, prefersReducedMotion])

  return (
    <span className="tabular-nums" aria-label={`${value}${suffix}`}>
      {display}
      {suffix}
    </span>
  )
}

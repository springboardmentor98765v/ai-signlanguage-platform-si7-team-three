import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Flame, Lock } from 'lucide-react'
import { gamificationApi } from '../services/api'
import GlassCard from './GlassCard'

/**
 * BadgesStreaks
 * Milestone 3 - Day 3
 *
 * Drop into Dashboard.jsx as its own section, e.g. below the weekly
 * progress chart:
 *   <BadgesStreaks />
 *
 * Uses gamificationApi (services/api.js) — mock data while USE_MOCKS is true.
 */

export default function BadgesStreaks({ delay = 0 }) {
  const [badges, setBadges] = useState([])
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 })
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    gamificationApi.getBadgesAndStreak().then(({ badges, streak }) => {
      setBadges(badges)
      setStreak(streak)
    })
  }, [])

  return (
    <GlassCard delay={delay} className="p-6" aria-labelledby="badges-streaks-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="badges-streaks-heading" className="font-display text-lg font-semibold text-mist-100">
          Badges &amp; Streaks
        </h2>
        <div className="flex items-center gap-1.5 rounded-full bg-signal-amber/10 px-3 py-1 text-sm font-medium text-signal-amber">
          <Flame size={16} aria-hidden="true" />
          <span>{streak.currentStreak} days in a row</span>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {badges.map((badge, i) => (
          <li
            key={badge.id}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center ${
              badge.unlocked ? 'border-signal-teal/30 bg-signal-teal/5' : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            <motion.div
              initial={badge.unlocked && !prefersReducedMotion ? { scale: 0.6, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.34, 1.56, 0.64, 1] }}
              className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                badge.unlocked ? 'bg-night-800' : 'bg-white/5 opacity-50 grayscale'
              }`}
              aria-hidden="true"
            >
              {badge.unlocked ? badge.emoji : <Lock size={18} className="text-mist-500" />}
            </motion.div>
            <span className={`text-sm font-medium ${badge.unlocked ? 'text-mist-100' : 'text-mist-500'}`}>
              {badge.name}
            </span>
            <span className="text-xs text-mist-500">{badge.description}</span>
            <span className="sr-only">{badge.unlocked ? 'Unlocked' : 'Locked'}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  )
}

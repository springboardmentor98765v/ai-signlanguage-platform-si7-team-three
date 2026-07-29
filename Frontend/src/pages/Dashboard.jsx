import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, BookOpenCheck, Clock, Flame, ArrowRight, TrendingUp } from 'lucide-react'
import AppShell from '../components/AppShell'
import GlassCard from '../components/GlassCard'
import { analyticsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

const STAT_CONFIG = [
  { key: 'accuracy', label: 'Avg. Accuracy', icon: Target, suffix: '%', color: 'text-signal-teal' },
  { key: 'lessonsCompleted', label: 'Lessons Completed', icon: BookOpenCheck, suffix: '', color: 'text-signal-coral' },
  { key: 'practiceHours', label: 'Practice Hours', icon: Clock, suffix: 'h', color: 'text-signal-amber' },
  { key: 'streakDays', label: 'Day Streak', icon: Flame, suffix: '🔥', color: 'text-violet-400' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    analyticsApi.getSummary().then(setStats)
  }, [])

  return (
    <AppShell
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Learner'}`}
      subtitle="Here's how your practice is going."
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CONFIG.map(({ key, label, icon: Icon, suffix, color }, i) => (
          <GlassCard key={key} delay={i * 0.06} className="p-5">
            <div className={`mb-3 inline-flex rounded-xl bg-white/[0.06] p-2.5 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="font-display text-2xl font-bold md:text-3xl">
              {stats ? stats[key] : '–'}
              <span className="ml-0.5 text-lg text-mist-500">{suffix}</span>
            </p>
            <p className="mt-1 text-xs text-mist-500">{label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Continue learning CTA */}
        <GlassCard delay={0.2} strong className="relative overflow-hidden p-8 lg:col-span-2">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-signal-teal/20 blur-3xl" />
          <p className="label-eyebrow mb-2">Continue learning</p>
          <h3 className="font-display text-2xl font-bold">Pick up your next lesson</h3>
          <p className="mt-2 max-w-md text-sm text-mist-500">
            You're closest to finishing <span className="text-mist-100">Letters F – J</span>.
            Jump back in and keep your streak alive.
          </p>
          <Link to="/lessons" className="btn-primary mt-6 inline-flex w-fit">
            Go to lessons <ArrowRight size={18} />
          </Link>
        </GlassCard>

        {/* Weak letters */}
        <GlassCard delay={0.26} className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-signal-coral" />
            <h3 className="font-display font-semibold">Needs practice</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(stats?.weakLetters || []).map((letter) => (
              <span
                key={letter}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-signal-coral/30 bg-signal-coral/10 font-display text-lg font-bold text-signal-coral"
              >
                {letter}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-mist-500">
            Based on your lowest confidence scores over the last 5 sessions.
          </p>
        </GlassCard>
      </div>

      {/* Recent activity */}
      <GlassCard delay={0.32} className="mt-6 p-6">
        <h3 className="mb-4 font-display font-semibold">Recent activity</h3>
        <div className="divide-y divide-white/10">
          {(stats?.recentActivity || []).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-mist-500">{item.time}</p>
              </div>
              <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-signal-teal">
                {item.result}
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </AppShell>
  )
}

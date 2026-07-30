import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, BookOpenCheck, Clock, Flame, ArrowRight, TrendingUp, Video, Award, Calendar } from 'lucide-react'
import AppShell from '../components/AppShell'
import GlassCard from '../components/GlassCard'
import StatCard from '../components/StatCard'
import AccuracyChart from '../charts/AccuracyChart'
import EmptyState from '../components/EmptyState'
import { SkeletonStatRow, SkeletonCard } from '../components/Skeleton'
import { analyticsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

const STAT_CONFIG = [
  { key: 'accuracy', label: 'Avg. Accuracy', icon: Target, suffix: '%', color: 'text-signal-teal' },
  { key: 'lessonsCompleted', label: 'Lessons Completed', icon: BookOpenCheck, suffix: '', color: 'text-signal-coral' },
  { key: 'practiceHours', label: 'Practice Hours', icon: Clock, suffix: 'h', color: 'text-signal-amber' },
  { key: 'streakDays', label: 'Day Streak', icon: Flame, suffix: '🔥', color: 'text-violet-400' },
]

const QUICK_ACTIONS = [
  { to: '/practice', label: 'Start practice', icon: Video, color: 'from-signal-teal to-violet-500' },
  { to: '/lessons', label: 'Browse lessons', icon: BookOpenCheck, color: 'from-signal-coral to-signal-amber' },
  { to: '/certificate', label: 'View certificate', icon: Award, color: 'from-violet-500 to-signal-coral' },
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
      {!stats ? (
        <SkeletonStatRow />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STAT_CONFIG.map(({ key, label, icon, suffix, color }, i) => (
            <StatCard key={key} icon={icon} label={label} value={stats[key]} suffix={suffix} color={color} delay={i * 0.06} />
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly progress chart */}
        <GlassCard delay={0.2} className="p-6 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-display font-semibold">Weekly progress</h3>
            <span className="flex items-center gap-1 text-xs text-signal-teal">
              <TrendingUp size={13} /> Trending up
            </span>
          </div>
          {stats ? (
            <AccuracyChart labels={stats.weeklyProgress.labels} data={stats.weeklyProgress.data} />
          ) : (
            <SkeletonCard className="h-[220px]" />
          )}
        </GlassCard>

        {/* Weak letters */}
        <GlassCard delay={0.26} className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Target size={18} className="text-signal-coral" />
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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <GlassCard delay={0.3} className="p-6">
          <h3 className="mb-4 font-display font-semibold">Quick actions</h3>
          <div className="space-y-2.5">
            {QUICK_ACTIONS.map(({ to, label, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium transition hover:bg-white/[0.07]"
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-night-950`}>
                  <Icon size={15} />
                </span>
                {label}
                <ArrowRight size={14} className="ml-auto text-mist-500" />
              </Link>
            ))}
          </div>
        </GlassCard>

        {/* Upcoming lessons */}
        <GlassCard delay={0.36} className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-signal-teal" />
            <h3 className="font-display font-semibold">Upcoming lessons</h3>
          </div>
          {stats?.upcomingLessons?.length ? (
            <div className="space-y-3">
              {stats.upcomingLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  to={`/practice?lesson=${lesson.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm transition hover:bg-white/[0.07]"
                >
                  <div>
                    <p className="font-medium">{lesson.title}</p>
                    <p className="text-xs text-mist-500">{lesson.level}</p>
                  </div>
                  <ArrowRight size={14} className="text-mist-500" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={Calendar} title="You're all caught up" description="No upcoming lessons queued right now." />
          )}
        </GlassCard>

        {/* Recent activity */}
        <GlassCard delay={0.42} className="p-6">
          <h3 className="mb-4 font-display font-semibold">Recent activity</h3>
          {stats?.recentActivity?.length ? (
            <div className="divide-y divide-white/10">
              {stats.recentActivity.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
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
          ) : (
            <EmptyState icon={Clock} title="No activity yet" description="Start a practice session to see it here." />
          )}
        </GlassCard>
      </div>
    </AppShell>
  )
}

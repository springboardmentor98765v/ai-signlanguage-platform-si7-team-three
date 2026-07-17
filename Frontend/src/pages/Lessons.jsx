import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'
import AppShell from '../components/AppShell'
import GlassCard from '../components/GlassCard'
import { courseApi } from '../services/api'

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function Lessons() {
  const [lessons, setLessons] = useState([])
  const [level, setLevel] = useState('All')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    courseApi.getLessons().then((data) => {
      setLessons(data)
      setLoading(false)
    })
  }, [])

  const filtered = level === 'All' ? lessons : lessons.filter((l) => l.level === level)

  return (
    <AppShell title="Lessons" subtitle="Seeded alphabet lessons — pick a set of letters to practice.">
      {/* Level filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition
              ${level === l
                ? 'bg-gradient-to-r from-signal-coral to-signal-amber text-night-950'
                : 'glass text-mist-500 hover:text-mist-100'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card h-52 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lesson, i) => (
            <GlassCard key={lesson.id} delay={i * 0.05} className="flex flex-col p-6">
              <div className="mb-4 flex items-start justify-between">
                <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-medium text-mist-300">
                  {lesson.level}
                </span>
                <div className="flex -space-x-2">
                  {lesson.letters.slice(0, 3).map((letter, idx) => (
                    <span
                      key={idx}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-night-800 font-display text-xs font-bold text-signal-teal"
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              </div>

              <h3 className="font-display text-lg font-bold">{lesson.title}</h3>
              <p className="mt-1 flex-1 text-sm text-mist-500">{lesson.description}</p>

              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs text-mist-500">
                  <span>Progress</span>
                  <span>{lesson.progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-signal-teal to-signal-coral transition-all"
                    style={{ width: `${lesson.progress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => navigate(`/practice?lesson=${lesson.id}`)}
                className="btn-ghost mt-5 w-full hover:border-signal-teal/40"
              >
                <PlayCircle size={18} />
                {lesson.progress > 0 ? 'Continue' : 'Start lesson'}
              </button>
            </GlassCard>
          ))}
        </div>
      )}
    </AppShell>
  )
}

import { Download, Award, CheckCircle2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import GlassCard from '../components/GlassCard'
import HandSkeleton from '../components/HandSkeleton'
import { useAuth } from '../context/AuthContext'

const BADGES = [
  { label: 'Vowels A–E', earned: true },
  { label: 'Letters F–J', earned: false },
  { label: '5-Day Streak', earned: true },
  { label: 'Perfect Score', earned: false },
]

export default function Reports() {
  const { user } = useAuth()

  return (
    <AppShell title="Reports" subtitle="Static in Milestone 1 — full PDF export and history arrive in a later milestone.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.9fr]">
        {/* Certificate mockup */}
        <GlassCard strong className="relative overflow-hidden p-10">
          <HandSkeleton className="absolute -bottom-12 -right-12 h-56 w-56 text-signal-teal/15" animated={false} />
          <div className="relative">
            <div className="mb-6 flex items-center gap-2">
              <Award className="text-signal-amber" size={22} />
              <span className="label-eyebrow">Certificate of progress</span>
            </div>
            <h2 className="font-display text-3xl font-bold">{user?.name || 'Learner'}</h2>
            <p className="mt-2 max-w-md text-sm text-mist-500">
              has completed the <span className="text-mist-100">Vowels A–E</span> module with an
              average accuracy of <span className="text-signal-teal">85%</span>.
            </p>

            <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
              <div className="flex items-center gap-2 text-xs text-mist-500">
                <div className="h-px w-16 bg-mist-500/40" />
                Instructor signature
              </div>
              <div className="ml-auto flex items-center gap-2 text-xs text-mist-500">
                <div className="h-px w-16 bg-mist-500/40" />
                Date
              </div>
            </div>

            <button className="btn-ghost mt-8" disabled title="Enabled in a later milestone">
              <Download size={16} /> Download PDF
            </button>
          </div>
        </GlassCard>

        {/* Badges + progress summary */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6">
            <h3 className="mb-4 font-display font-semibold">Badges</h3>
            <div className="grid grid-cols-2 gap-3">
              {BADGES.map((badge) => (
                <div
                  key={badge.label}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center text-xs font-medium
                    ${badge.earned
                      ? 'border-signal-teal/30 bg-signal-teal/10 text-signal-teal'
                      : 'border-white/10 bg-white/[0.03] text-mist-500'}`}
                >
                  {badge.earned ? <CheckCircle2 size={20} /> : <Award size={20} className="opacity-40" />}
                  {badge.label}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="mb-4 font-display font-semibold">Milestone 1 scope note</h3>
            <p className="text-sm text-mist-500">
              Certificate generation, full analytics history, and downloadable
              reports are explicitly deferred past Milestone 1 per the SRS. This
              screen shows the intended layout with mock data so the Business
              Logic and Data layers have a clear target to integrate against.
            </p>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  )
}

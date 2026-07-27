import { useState } from 'react'
import { Eye, Volume2, Sparkles, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import GlassCard from '../components/GlassCard'

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-signal-teal' : 'bg-white/[0.15]'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

// Note: identity fields (name, DOB, avatar) and password changes moved to
// Profile.jsx, so Settings focuses purely on preferences — no duplicate
// forms editing the same account data in two places.
export default function Settings() {
  const [captions, setCaptions] = useState(true)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [soundCues, setSoundCues] = useState(true)

  return (
    <AppShell title="Settings" subtitle="Accessibility and practice preferences.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Accessibility & preferences — relevant given the platform's hearing-impaired audience */}
        <GlassCard className="h-fit p-6 md:p-8">
          <h3 className="mb-6 font-display font-semibold">Accessibility & preferences</h3>
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <Eye size={18} className="mt-0.5 text-signal-teal" />
                <div>
                  <p className="text-sm font-medium">Captions on feedback</p>
                  <p className="text-xs text-mist-500">Show written feedback alongside every practice result.</p>
                </div>
              </div>
              <Toggle checked={captions} onChange={setCaptions} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <Sparkles size={18} className="mt-0.5 text-signal-teal" />
                <div>
                  <p className="text-sm font-medium">High contrast mode</p>
                  <p className="text-xs text-mist-500">Increase text and border contrast across the app.</p>
                </div>
              </div>
              <Toggle checked={highContrast} onChange={setHighContrast} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <Volume2 size={18} className="mt-0.5 text-signal-teal" />
                <div>
                  <p className="text-sm font-medium">Sound cues</p>
                  <p className="text-xs text-mist-500">Play a chime when a practice attempt scores above 90%.</p>
                </div>
              </div>
              <Toggle checked={soundCues} onChange={setSoundCues} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <Sparkles size={18} className="mt-0.5 text-signal-teal" />
                <div>
                  <p className="text-sm font-medium">Reduce motion</p>
                  <p className="text-xs text-mist-500">Turn off background drift and card animations.</p>
                </div>
              </div>
              <Toggle checked={reducedMotion} onChange={setReducedMotion} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="h-fit p-6 md:p-8">
          <div className="mb-2 flex items-center gap-2">
            <Info size={18} className="text-signal-teal" />
            <h3 className="font-display font-semibold">About these settings</h3>
          </div>
          <p className="text-sm text-mist-500">
            Looking to change your name, photo, date of birth, or password? Those live on your{' '}
            <Link to="/profile" className="text-signal-teal hover:underline">
              Profile
            </Link>{' '}
            page instead — this page is just for accessibility and practice preferences.
          </p>
          <p className="mt-4 text-xs text-mist-500">
            These preferences are stored locally in Milestone 1. Persisting them per-account is a
            Milestone 2 backend task (Intern 2/5).
          </p>
        </GlassCard>
      </div>
    </AppShell>
  )
}

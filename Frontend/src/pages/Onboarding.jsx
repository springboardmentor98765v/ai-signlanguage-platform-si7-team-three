import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, AlertCircle } from 'lucide-react'
import AuroraBackground from '../components/AuroraBackground'
import GlassCard from '../components/GlassCard'
import HandSkeleton from '../components/HandSkeleton'
import AvatarPicker from '../components/AvatarPicker'
import { useAuth } from '../context/AuthContext'

function calculateAge(dob) {
  const birth = new Date(dob)
  const diff = Date.now() - birth.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

export default function Onboarding() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [dob, setDob] = useState(user?.dob || '')
  const [avatar, setAvatar] = useState(user?.avatar || null)
  const [avatarColor, setAvatarColor] = useState('from-signal-teal to-violet-500')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!dob) {
      setError('Please enter your date of birth.')
      return
    }
    if (new Date(dob) > new Date()) {
      setError('Date of birth cannot be in the future.')
      return
    }
    if (calculateAge(dob) < 5) {
      setError('Please double check your date of birth.')
      return
    }

    setSubmitting(true)
    try {
      await updateProfile({ name: name.trim(), dob, avatar, avatarColor, profileComplete: true })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Could not save your details. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AuroraBackground />

      <GlassCard strong className="w-full max-w-md p-8 md:p-10">
        <div className="mb-6 flex items-center gap-2">
          <HandSkeleton className="h-7 w-7 text-signal-teal" animated={false} />
          <span className="font-display font-semibold">SignalPath</span>
        </div>

        <p className="label-eyebrow mb-2">One last step</p>
        <h1 className="font-display text-2xl font-bold">Tell us a bit about you</h1>
        <p className="mt-1 mb-8 text-sm text-mist-500">
          This personalizes your dashboard and certificates. You can change it later in Settings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AvatarPicker
            name={name}
            avatar={avatar}
            color={avatarColor}
            onChange={setAvatar}
            onColorChange={setAvatarColor}
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist-500">Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              className="glass-input"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-mist-500">Date of birth</label>
            <input
              type="date"
              required
              value={dob}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDob(e.target.value)}
              className="glass-input"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-signal-coral/30 bg-signal-coral/10 px-4 py-3 text-sm text-signal-coral">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saving…' : 'Continue to dashboard'}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>
      </GlassCard>
    </div>
  )
}

import { useState } from 'react'
import { Check, AlertCircle, Eye, Volume2, Sparkles } from 'lucide-react'
import AppShell from '../components/AppShell'
import GlassCard from '../components/GlassCard'
import AvatarPicker from '../components/AvatarPicker'
import { useAuth } from '../context/AuthContext'

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

export default function Settings() {
  const { user, updateProfile } = useAuth()

  const [name, setName] = useState(user?.name || '')
  const [dob, setDob] = useState(user?.dob || '')
  const [avatar, setAvatar] = useState(user?.avatar || null)
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || 'from-signal-teal to-violet-500')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [captions, setCaptions] = useState(true)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [soundCues, setSoundCues] = useState(true)

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)

  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileError('')
    setProfileSaved(false)
    if (!name.trim() || !dob) {
      setProfileError('Name and date of birth are required.')
      return
    }
    setSavingProfile(true)
    try {
      await updateProfile({ name: name.trim(), dob, avatar, avatarColor })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    } catch (err) {
      setProfileError(err.message || 'Could not save changes.')
    } finally {
      setSavingProfile(false)
    }
  }

  function handlePasswordSave(e) {
    e.preventDefault()
    setPwError('')
    setPwSaved(false)
    if (pwForm.next.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match.')
      return
    }
    // Wire to PATCH /users/me/password on Intern 2's User Service.
    setPwSaved(true)
    setPwForm({ current: '', next: '', confirm: '' })
    setTimeout(() => setPwSaved(false), 3000)
  }

  return (
    <AppShell title="Settings" subtitle="Manage your profile, security, and accessibility preferences.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          {/* Profile */}
          <GlassCard className="p-6 md:p-8">
            <h3 className="mb-6 font-display font-semibold">Profile</h3>
            <form onSubmit={handleProfileSave} className="space-y-6">
              <AvatarPicker
                name={name}
                avatar={avatar}
                color={avatarColor}
                onChange={setAvatar}
                onColorChange={setAvatarColor}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-mist-500">Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="glass-input" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-mist-500">Date of birth</label>
                  <input
                    type="date"
                    value={dob}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDob(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-mist-500">Email</label>
                  <input value={user?.email || ''} disabled className="glass-input opacity-60" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-mist-500">Role</label>
                  <input value={user?.role || ''} disabled className="glass-input opacity-60" />
                </div>
              </div>

              {profileError && (
                <div className="flex items-start gap-2 rounded-xl border border-signal-coral/30 bg-signal-coral/10 px-4 py-3 text-sm text-signal-coral">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {profileError}
                </div>
              )}

              <button type="submit" disabled={savingProfile} className="btn-primary">
                {profileSaved ? <Check size={18} /> : null}
                {savingProfile ? 'Saving…' : profileSaved ? 'Saved' : 'Save changes'}
              </button>
            </form>
          </GlassCard>

          {/* Security */}
          <GlassCard className="p-6 md:p-8">
            <h3 className="mb-6 font-display font-semibold">Password</h3>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-mist-500">Current password</label>
                <input
                  type="password"
                  value={pwForm.current}
                  onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                  className="glass-input"
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-mist-500">New password</label>
                  <input
                    type="password"
                    value={pwForm.next}
                    onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                    className="glass-input"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-mist-500">Confirm</label>
                  <input
                    type="password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    className="glass-input"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {pwError && (
                <div className="flex items-start gap-2 rounded-xl border border-signal-coral/30 bg-signal-coral/10 px-4 py-3 text-sm text-signal-coral">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {pwError}
                </div>
              )}

              <button type="submit" className="btn-ghost">
                {pwSaved ? <Check size={16} className="text-signal-teal" /> : null}
                {pwSaved ? 'Password updated' : 'Update password'}
              </button>
            </form>
          </GlassCard>
        </div>

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
          <p className="mt-6 text-xs text-mist-500">
            These preferences are stored locally in Milestone 1. Persisting them per-account is a
            Milestone 2 backend task (Intern 2/5).
          </p>
        </GlassCard>
      </div>
    </AppShell>
  )
}

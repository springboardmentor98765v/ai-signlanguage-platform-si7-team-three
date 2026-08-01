import { useState } from 'react'
import { Check, AlertCircle, User, Mail, Shield, Lock } from 'lucide-react'
import AppShell from '../components/AppShell'
import GlassCard from '../components/GlassCard'
import AvatarPicker from '../components/AvatarPicker'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../services/api'
import { useToast } from '../context/ToastContext'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name || '')
  const [avatar, setAvatar] = useState(user?.avatar || null)
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || 'from-signal-teal to-violet-500')
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoError, setInfoError] = useState('')

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  async function handleInfoSave(e) {
    e.preventDefault()
    setInfoError('')
    if (!name.trim()) {
      setInfoError('Name cannot be empty.')
      return
    }
    setSavingInfo(true)
    try {
      await updateProfile({ name: name.trim(), avatar, avatarColor })
      toast('Profile updated successfully.', 'success')
    } catch (err) {
      setInfoError(err.message || 'Could not save changes.')
      toast('Failed to update profile.', 'error')
    } finally {
      setSavingInfo(false)
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault()
    setPwError('')

    if (!pwForm.current) {
      setPwError('Please enter your current password.')
      return
    }
    if (pwForm.next.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New password and confirmation do not match.')
      return
    }

    setSavingPw(true)
    try {
      await userApi.changePassword(pwForm.current, pwForm.next)
      toast('Password changed successfully.', 'success')
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      setPwError(err.message || 'Could not change password.')
      toast('Failed to change password.', 'error')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <AppShell title="Profile" subtitle="Your account identity and security.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Identity */}
        <GlassCard className="p-6 md:p-8">
          <h3 className="mb-6 flex items-center gap-2 font-display font-semibold">
            <User size={18} className="text-signal-teal" /> Account information
          </h3>

          <form onSubmit={handleInfoSave} className="space-y-6">
            <AvatarPicker
              name={name}
              avatar={avatar}
              color={avatarColor}
              onChange={setAvatar}
              onColorChange={setAvatarColor}
            />

            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist-500">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="glass-input" />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-mist-500">
                <Mail size={12} /> Email
              </label>
              <input value={user?.email || ''} disabled className="glass-input opacity-60" />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-mist-500">
                <Shield size={12} /> Role
              </label>
              <input value={user?.role || ''} disabled className="glass-input opacity-60" />
            </div>

            {infoError && (
              <div className="flex items-start gap-2 rounded-xl border border-signal-coral/30 bg-signal-coral/10 px-4 py-3 text-sm text-signal-coral">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {infoError}
              </div>
            )}

            <button type="submit" disabled={savingInfo} className="btn-primary">
              {savingInfo ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </GlassCard>

        {/* Password */}
        <GlassCard className="h-fit p-6 md:p-8">
          <h3 className="mb-6 flex items-center gap-2 font-display font-semibold">
            <Lock size={18} className="text-signal-teal" /> Change password
          </h3>

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
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist-500">New password</label>
              <input
                type="password"
                value={pwForm.next}
                onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                className="glass-input"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist-500">Confirm new password</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                className="glass-input"
                placeholder="Re-enter new password"
              />
            </div>

            {pwError && (
              <div className="flex items-start gap-2 rounded-xl border border-signal-coral/30 bg-signal-coral/10 px-4 py-3 text-sm text-signal-coral">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {pwError}
              </div>
            )}

            <button type="submit" disabled={savingPw} className="btn-primary">
              {savingPw ? <Check size={16} className="animate-pulse" /> : null}
              {savingPw ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </GlassCard>
      </div>
    </AppShell>
  )
}

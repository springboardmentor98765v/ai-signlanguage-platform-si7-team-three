import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import AuroraBackground from '../components/AuroraBackground'
import GlassCard from '../components/GlassCard'
import HandSkeleton from '../components/HandSkeleton'
import OAuthButtons from '../components/OAuthButtons'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// NOTE: In production, Admin accounts should never be self-service —
// they'd be provisioned by an existing Admin. Included here as a selectable
// role purely so the Admin Dashboard is reachable for demo/testing.
const ROLES = ['Learner', 'Instructor', 'Trainer', 'Admin']

export default function Register() {
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'Learner' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)
    try {
      await register(form)
      toast('Account created — welcome to SignalPath!', 'success')
      navigate('/')
    } catch (err) {
      setError(err.message || 'Could not create your account. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AuroraBackground />

      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[2rem] md:grid-cols-2 md:shadow-glass">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-strong relative hidden flex-col justify-between overflow-hidden rounded-l-[2rem] p-10 md:flex"
        >
          <div className="flex items-center gap-2">
            <HandSkeleton className="h-8 w-8 text-signal-teal" animated={false} />
            <span className="font-display font-semibold">SignalPath</span>
          </div>

          <div className="relative">
            <HandSkeleton className="absolute -bottom-10 -right-10 h-64 w-64 text-signal-coral/40" />
            <p className="label-eyebrow mb-3">Get started</p>
            <h1 className="font-display text-4xl font-bold leading-tight">
              One hand shape<br />at a time.
            </h1>
            <p className="mt-4 max-w-sm text-mist-500">
              Create an account to track your accuracy, unlock new lessons, and get
              instant feedback from the webcam.
            </p>
          </div>

          <p className="text-xs text-mist-500">Milestone 1 · AI-Powered Sign Language Platform</p>
        </motion.div>

        <GlassCard strong className="flex flex-col justify-center rounded-[2rem] p-8 md:rounded-l-none md:p-12">
          <div className="mb-6 flex items-center gap-2 md:hidden">
            <HandSkeleton className="h-7 w-7 text-signal-teal" animated={false} />
            <span className="font-display font-semibold">SignalPath</span>
          </div>

          <h2 className="font-display text-2xl font-bold">Create account</h2>
          <p className="mt-1 mb-6 text-sm text-mist-500">
            Already registered?{' '}
            <Link to="/login" className="text-signal-teal hover:underline">
              Log in
            </Link>
          </p>

          <OAuthButtons
            onSuccess={() => navigate('/')}
            onError={setError}
          />

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-mist-500">or sign up with email</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist-500">Full name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" size={18} />
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex Rivera"
                  className="glass-input pl-11"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-mist-500">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" size={18} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="glass-input pl-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-mist-500">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" size={18} />
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="glass-input pl-11"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-mist-500">Confirm</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" size={18} />
                  <input
                    type="password"
                    required
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    placeholder="••••••••"
                    className="glass-input pl-11"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-mist-500">I am a…</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ROLES.map((role) => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => setForm({ ...form, role })}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition
                      ${form.role === role
                        ? 'border-signal-teal/60 bg-signal-teal/15 text-signal-teal'
                        : 'border-white/[0.14] bg-white/[0.04] text-mist-500 hover:bg-white/[0.08]'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-signal-coral/30 bg-signal-coral/10 px-4 py-3 text-sm text-signal-coral">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full">
              {submitting ? 'Creating account…' : 'Create account'}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}

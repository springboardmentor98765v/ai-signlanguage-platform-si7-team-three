import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  )
}

// Plain inline mark instead of lucide-react's Github icon — newer
// lucide-react releases dropped brand/logo icons, so importing { Github }
// from 'lucide-react' fails on current versions.
function GithubMark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .5C5.73.5.98 5.24.98 11.52c0 5.02 3.26 9.28 7.77 10.78.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.16a10.9 10.9 0 0 1 5.74 0c2.19-1.47 3.15-1.16 3.15-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.18 5.59.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.65.79.54A11.03 11.03 0 0 0 23.02 11.5C23.02 5.24 18.27.5 12 .5z" />
    </svg>
  )
}

export default function OAuthButtons({ onSuccess, onError }) {
  const { loginWithOAuth } = useAuth()
  const [pending, setPending] = useState('')

  async function handleClick(provider) {
    setPending(provider)
    try {
      const user = await loginWithOAuth(provider)
      onSuccess?.(user)
    } catch (err) {
      onError?.(err.message || `Could not sign in with ${provider}.`)
    } finally {
      setPending('')
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => handleClick('google')}
        disabled={!!pending}
        className="btn-ghost gap-2 disabled:opacity-60"
      >
        {pending === 'google' ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-mist-500 border-t-transparent" /> : <GoogleMark />}
        Google
      </button>
      <button
        type="button"
        onClick={() => handleClick('github')}
        disabled={!!pending}
        className="btn-ghost gap-2 disabled:opacity-60"
      >
        {pending === 'github' ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-mist-500 border-t-transparent" /> : <GithubMark size={16} />}
        GitHub
      </button>
    </div>
  )
}
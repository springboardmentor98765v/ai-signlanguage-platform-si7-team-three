import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, needsOnboarding } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-mist-500">
        Loading…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Send incomplete profiles (fresh registrations, first-time OAuth users)
  // to onboarding before they can reach the rest of the app.
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

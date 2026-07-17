import { createContext, useContext, useEffect, useState } from 'react'
import { authApi, userApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sl_token')
    const savedUser = localStorage.getItem('sl_user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  function persist(nextUser, token) {
    if (token) localStorage.setItem('sl_token', token)
    localStorage.setItem('sl_user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  async function login(email, password) {
    const { token, user: loggedInUser } = await authApi.login(email, password)
    persist(loggedInUser, token)
    return loggedInUser
  }

  async function register(payload) {
    const { token, user: newUser } = await authApi.register(payload)
    persist(newUser, token)
    return newUser
  }

  // provider: 'google' | 'github'. Real wiring notes live in services/api.js.
  async function loginWithOAuth(provider) {
    const { token, user: oauthUser } = await authApi.oauthLogin(provider)
    persist(oauthUser, token)
    return oauthUser
  }

  async function updateProfile(updates) {
    const updatedUser = await userApi.updateProfile(updates)
    persist(updatedUser)
    return updatedUser
  }

  function logout() {
    localStorage.removeItem('sl_token')
    localStorage.removeItem('sl_user')
    setUser(null)
  }

  // A profile is "incomplete" until name + date of birth are on file —
  // true for fresh registrations and first-time OAuth sign-ins.
  const needsOnboarding = !!user && !user.profileComplete

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithOAuth, updateProfile, logout, needsOnboarding }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

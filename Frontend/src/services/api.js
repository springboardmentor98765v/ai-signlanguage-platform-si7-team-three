import axios from 'axios'
import { mockLessons, mockDashboard } from '../data/mockData'

// ---------------------------------------------------------------------------
// Base axios client. Point VITE_API_URL at Intern 2's FastAPI gateway once
// the real Auth/Course endpoints are live (Day 6 in the SRS plan).
// ---------------------------------------------------------------------------
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sl_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Toggle this off once the backend is reachable. While true, every call
// below resolves against local mock data instead of hitting the network.
const USE_MOCKS = false

function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Auth — Intern 2's User Service (FR-2)
// ---------------------------------------------------------------------------
export const authApi = {
  async login(email, password) {
    if (USE_MOCKS) {
      await delay()
      if (!email || !password) throw new Error('Email and password are required.')
      return {
        token: 'mock-jwt-token',
        // Existing accounts are assumed to already have a complete profile.
        user: {
          id: 'u1',
          name: email.split('@')[0],
          email,
          role: 'Learner',
          dob: '2000-01-01',
          avatar: null,
          profileComplete: true,
        },
      }
    }
    const { data } = await client.post('/auth/login', { email, password })
    return data
  },

  async register({ name, email, password, role }) {
    if (USE_MOCKS) {
      await delay()
      return {
        token: 'mock-jwt-token',
        // profileComplete is false until onboarding collects DOB (and,
        // optionally, an avatar) — see Onboarding.jsx.
        user: { id: 'u1', name, email, role, dob: null, avatar: null, profileComplete: false },
      }
    }
    const { data } = await client.post('/auth/register', { 
      full_name : name, email, password, role })
    return data
  },

  // --------------------------------------------------------------------
  // OAuth sign-in. In mock mode this simulates the redirect/popup round
  // trip. For a REAL integration:
  //   1. Frontend gets an id_token/auth code from the provider (e.g. via
  //      @react-oauth/google for Google, or a redirect to
  //      github.com/login/oauth/authorize for GitHub).
  //   2. Frontend sends that token to the backend — never the client
  //      secret, and never issue your own JWT from the frontend.
  //   3. Backend (Intern 2's User Service) verifies the token with the
  //      provider, creates/looks up the user, and returns your app's own
  //      JWT — exactly like the /auth/login response below.
  // This keeps OAuth secrets server-side, which the SRS's security NFR
  // (protected routes require a valid JWT; nothing sensitive in the
  // frontend) already assumes.
  // --------------------------------------------------------------------
  async oauthLogin(provider) {
    if (USE_MOCKS) {
      await delay(700)
      const isNewUser = !localStorage.getItem(`sl_oauth_${provider}_seen`)
      localStorage.setItem(`sl_oauth_${provider}_seen`, '1')
      return {
        token: 'mock-jwt-token',
        user: {
          id: `${provider}-u1`,
          name: provider === 'google' ? 'Alex Rivera' : 'alex-dev',
          email: `alex@${provider}.example`,
          role: 'Learner',
          dob: isNewUser ? null : '2000-01-01',
          avatar: null,
          profileComplete: !isNewUser,
          provider,
        },
      }
    }
    // Real flow: POST the provider token you obtained on the client to
    // your backend, e.g. { idToken } for Google or { code } for GitHub.
    const { data } = await client.post(`/auth/oauth/${provider}`, {})
    return data
  },
}

// ---------------------------------------------------------------------------
// User profile — avatar, name, DOB updates from Settings/Onboarding.
// ---------------------------------------------------------------------------
export const userApi = {
  async updateProfile(updates) {
    if (USE_MOCKS) {
      await delay(500)
      const current = JSON.parse(localStorage.getItem('sl_user') || '{}')
      return { ...current, ...updates }
    }
    const { data } = await client.patch('/users/me', updates)
    return data
  },
}

// ---------------------------------------------------------------------------
// Courses / Lessons — Intern 2's Course Service (FR-2)
// ---------------------------------------------------------------------------
export const courseApi = {
  async getLessons() {
    if (USE_MOCKS) {
      await delay(400)
      return mockLessons
    }
    const { data } = await client.get('/lessons')
    return data
  },
}

// ---------------------------------------------------------------------------
// Dashboard / Analytics — Intern 4's Analytics Service (FR-4)
// ---------------------------------------------------------------------------
export const analyticsApi = {
  async getSummary() {
    if (USE_MOCKS) {
      await delay(400)
      return mockDashboard
    }
    const { data } = await client.get('/analytics/summary')
    return data
  },
}

// ---------------------------------------------------------------------------
// Practice / AI Prediction — Intern 3's AI service + Intern 4's Assessment
// and Feedback services (FR-3, FR-4). This is the join point described in
// Section 5 of the SRS: predicted_sign + confidence feed the scoring engine.
// ---------------------------------------------------------------------------
export const practiceApi = {
  async startSession(lessonId) {
    if (USE_MOCKS) {
      await delay(200)
      return { sessionId: `sess-${Date.now()}`, lessonId }
    }
    const { data } = await client.post('/practice/start', { lessonId })
    return data
  },

  // frameBlob: a captured webcam frame (image/jpeg blob). In mock mode we
  // simulate the AI/CV + Assessment + Feedback chain end to end.
  async submitAttempt(sessionId, targetLetter, _frameBlob) {
    if (USE_MOCKS) {
      await delay(900)
      const confidence = Math.round((0.55 + Math.random() * 0.44) * 100) / 100
      const accuracy = Math.round(confidence * 100)
      const feedbackBank = [
        'Extend your fingers a little further apart for a cleaner shape.',
        'Nice hand shape — keep your wrist steadier next time.',
        'Try rotating your palm slightly outward to match the reference.',
        'Great form! Hold the position a beat longer for full marks.',
      ]
      return {
        predictedSign: targetLetter,
        confidence,
        accuracy,
        feedback: feedbackBank[Math.floor(Math.random() * feedbackBank.length)],
      }
    }
    const form = new FormData()
    form.append('frame', _frameBlob, 'frame.jpg')
    form.append('sessionId', sessionId)
    form.append('targetLetter', targetLetter)
    const { data } = await client.post('/practice/attempt', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}

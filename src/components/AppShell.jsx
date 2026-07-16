import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Video, Award, Settings as SettingsIcon, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import HandSkeleton from './HandSkeleton'
import AuroraBackground from './AuroraBackground'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/lessons', label: 'Lessons', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: Video },
  { to: '/reports', label: 'Reports', icon: Award },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function AppShell({ children, title, subtitle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="relative min-h-screen font-body">
      <AuroraBackground />

      {/* Mobile top bar */}
      <div className="flex items-center justify-between px-4 py-4 md:hidden">
        <div className="flex items-center gap-2">
          <HandSkeleton className="h-8 w-8 text-signal-teal" animated={false} />
          <span className="font-display font-semibold">SignalPath</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="glass rounded-lg p-2"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 pb-10 md:px-8">
        {/* Sidebar */}
        <aside
          className={`glass-strong fixed left-4 top-4 z-40 w-64 flex-col rounded-3xl p-6 transition-transform
            ${mobileOpen ? 'flex translate-x-0' : 'hidden -translate-x-[120%] md:flex'}
            md:translate-x-0 md:h-[calc(100vh-2rem)] md:overflow-y-auto`}
        >
          <div className="mb-10 flex items-center gap-3">
            <HandSkeleton className="h-9 w-9 text-signal-teal" />
            <div>
              <p className="font-display text-lg font-bold leading-tight">SignalPath</p>
              <p className="text-xs text-mist-500">Sign Language Lab</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition
                  ${isActive
                    ? 'bg-white/[0.12] text-white shadow-glass-inset'
                    : 'text-mist-500 hover:bg-white/[0.06] hover:text-mist-100'}`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="mb-3 flex items-center gap-3 rounded-xl px-2 py-2">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="h-9 w-9 rounded-full border border-white/20 object-cover"
                />
              ) : (
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br font-display font-bold text-night-950 ${user?.avatarColor || 'from-signal-coral to-signal-amber'}`}
                >
                  {user?.name?.[0]?.toUpperCase() || 'L'}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user?.name || 'Learner'}</p>
                <p className="truncate text-xs text-mist-500">{user?.role || 'Learner'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-mist-500 transition hover:bg-white/[0.06] hover:text-signal-coral"
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 pt-4 pl-0 md:pl-0 md:pt-10 md:ml-72">


          {(title || subtitle) && (
            <header className="mb-8">
              {title && <h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>}
              {subtitle && <p className="mt-2 text-mist-500">{subtitle}</p>}
            </header>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}

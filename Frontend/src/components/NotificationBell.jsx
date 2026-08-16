import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { notificationApi } from '../services/api'

/**
 * NotificationBell
 * Milestone 3 - Day 2
 *
 * Already wired into AppShell.jsx (mobile top bar + desktop top-right).
 * Uses notificationApi (services/api.js) — resolves against mock data
 * while USE_MOCKS is true, same pattern as authApi/courseApi/etc.
 */

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const containerRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    notificationApi.getNotifications().then(setNotifications)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && open) {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  async function handleMarkAsRead(id) {
    await notificationApi.markAsRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  async function handleMarkAllAsRead() {
    await notificationApi.markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        className="glass relative flex h-10 w-10 items-center justify-center rounded-full text-mist-500 transition hover:text-mist-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-teal"
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-signal-coral px-1 text-[10px] font-semibold leading-none text-white"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="glass-strong absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-3xl shadow-glass-inset"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 className="font-display text-sm font-semibold text-mist-100">Notifications</h2>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium text-signal-teal hover:underline focus:outline-none"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <ul className="max-h-80 divide-y divide-white/5 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-mist-500">No notifications yet.</li>
              ) : (
                notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition hover:bg-white/[0.06] focus:outline-none ${
                        n.read ? '' : 'bg-signal-teal/5'
                      }`}
                    >
                      <div className="flex w-full items-center gap-2">
                        {!n.read && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal-teal" aria-hidden="true" />
                        )}
                        <span className="text-sm font-medium text-mist-100">{n.title}</span>
                      </div>
                      <p className="pl-3.5 text-xs text-mist-500">{n.body}</p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

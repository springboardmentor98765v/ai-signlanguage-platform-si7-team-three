import { useState, useEffect } from 'react'
import { Trophy } from 'lucide-react'
import { gamificationApi } from '../services/api'
import AppShell from '../components/AppShell'
import GlassCard from '../components/GlassCard'
import EmptyState from '../components/EmptyState'

/**
 * Leaderboard
 * Milestone 3 - Day 4
 *
 * Register in App.jsx next to /reports:
 *   <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
 *
 * Uses gamificationApi (services/api.js) — mock data while USE_MOCKS is true.
 */

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)
  const [sortBy, setSortBy] = useState('accuracy') // 'accuracy' | 'streak'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    gamificationApi.getLeaderboard(sortBy).then(({ entries, currentUserId }) => {
      setEntries(entries)
      setCurrentUserId(currentUserId)
      setLoading(false)
    })
  }, [sortBy])

  return (
    <AppShell title="Leaderboard" subtitle="See how you stack up against your class.">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-end">
          <div role="group" aria-label="Sort leaderboard by" className="glass flex rounded-xl p-1">
            {[
              { key: 'accuracy', label: 'By Accuracy' },
              { key: 'streak', label: 'By Streak' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                aria-pressed={sortBy === opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-signal-teal ${
                  sortBy === opt.key ? 'bg-signal-teal text-night-950' : 'text-mist-500 hover:text-mist-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {!loading && entries.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No leaderboard data yet"
            description="Complete a lesson to see where you rank in your class."
          />
        ) : (
          <GlassCard strong className="overflow-hidden p-0">
            <table className="w-full text-left">
              <caption className="sr-only">
                Class leaderboard ranked by {sortBy === 'accuracy' ? 'accuracy' : 'streak'}
              </caption>
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-mist-500">
                <tr>
                  <th scope="col" className="px-4 py-3">Rank</th>
                  <th scope="col" className="px-4 py-3">Name</th>
                  <th scope="col" className="px-4 py-3 text-right">
                    {sortBy === 'accuracy' ? 'Accuracy' : 'Streak'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {entries.map((entry, index) => {
                  const isCurrentUser = entry.id === currentUserId
                  return (
                    <tr key={entry.id} className={isCurrentUser ? 'bg-signal-teal/5' : undefined}>
                      <td className="px-4 py-3 font-medium text-mist-500">#{index + 1}</td>
                      <td className="px-4 py-3">
                        <span className={isCurrentUser ? 'font-semibold text-signal-teal' : 'text-mist-100'}>
                          {entry.name}
                        </span>
                        {isCurrentUser && (
                          <span className="ml-2 rounded-full bg-signal-teal/10 px-2 py-0.5 text-[11px] font-medium text-signal-teal">
                            You
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-mist-300">
                        {sortBy === 'accuracy' ? `${entry.accuracy}%` : `${entry.streak}d`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </GlassCard>
        )}
      </div>
    </AppShell>
  )
}

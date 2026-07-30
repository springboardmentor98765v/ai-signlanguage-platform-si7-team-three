import { useEffect, useState } from 'react'
import { Users, GraduationCap, Activity, BookOpen } from 'lucide-react'
import AppShell from '../components/AppShell'
import GlassCard from '../components/GlassCard'
import StatCard from '../components/StatCard'
import SearchableTable from '../components/SearchableTable'
import DistributionChart from '../charts/DistributionChart'
import { SkeletonStatRow } from '../components/Skeleton'
import { adminApi } from '../services/api'
import { useToast } from '../context/ToastContext'

const ROLE_OPTIONS = ['All', 'Learner', 'Instructor', 'Trainer', 'Admin']
const STATUS_OPTIONS = ['All', 'Active', 'Inactive']

export default function AdminDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.getUsers()]).then(([statsData, usersData]) => {
      setStats(statsData)
      setUsers(usersData)
      setLoading(false)
    })
  }, [])

  async function toggleStatus(user) {
    const next = user.status === 'Active' ? 'Inactive' : 'Active'
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: next } : u)))
    await adminApi.setUserStatus(user.id, next)
    toast(`${user.name} is now ${next.toLowerCase()}.`, next === 'Active' ? 'success' : 'info')
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-xs font-medium text-mist-300">{row.role}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleStatus(row)
          }}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
            row.status === 'Active'
              ? 'bg-signal-teal/15 text-signal-teal hover:bg-signal-teal/25'
              : 'bg-white/[0.06] text-mist-500 hover:bg-white/[0.1]'
          }`}
        >
          {row.status}
        </button>
      ),
    },
    { key: 'joined', label: 'Joined' },
  ]

  return (
    <AppShell title="Admin Dashboard" subtitle="Platform-wide users, roles, and activity.">
      {loading ? (
        <SkeletonStatRow />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Users} label="Total users" value={stats.totalUsers} color="text-signal-teal" />
          <StatCard icon={GraduationCap} label="Instructors" value={stats.totalInstructors} color="text-violet-400" delay={0.05} />
          <StatCard icon={Activity} label="Active learners" value={stats.activeLearners} color="text-signal-coral" delay={0.1} />
          <StatCard icon={BookOpen} label="Lessons" value={stats.totalLessons} color="text-signal-amber" delay={0.15} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard delay={0.2} className="p-6 lg:col-span-1">
          <h3 className="mb-2 font-display font-semibold">Role distribution</h3>
          {!loading && (
            <DistributionChart labels={stats.roleDistribution.labels} data={stats.roleDistribution.data} />
          )}
        </GlassCard>

        <GlassCard delay={0.26} className="p-6 lg:col-span-2">
          <h3 className="mb-4 font-display font-semibold">Recent registrations</h3>
          <div className="divide-y divide-white/10">
            {!loading &&
              stats.recentRegistrations.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-mist-500">{r.time}</p>
                  </div>
                  <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-signal-teal">
                    {r.role}
                  </span>
                </div>
              ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6">
        <h3 className="mb-4 font-display font-semibold">User management</h3>
        <SearchableTable
          columns={columns}
          rows={users}
          loading={loading}
          searchKeys={['name', 'email']}
          filters={[
            { key: 'role', label: 'Role', options: ROLE_OPTIONS },
            { key: 'status', label: 'Status', options: STATUS_OPTIONS },
          ]}
          emptyTitle="No users found"
          emptyDescription="Try a different search term or filter."
        />
      </div>
    </AppShell>
  )
}

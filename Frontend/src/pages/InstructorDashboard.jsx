import { useEffect, useState } from 'react'
import { Users, TrendingUp, BookOpenCheck, Award } from 'lucide-react'
import AppShell from '../components/AppShell'
import GlassCard from '../components/GlassCard'
import StatCard from '../components/StatCard'
import ProgressBar from '../components/ProgressBar'
import SearchableTable from '../components/SearchableTable'
import Modal from '../components/Modal'
import AccuracyChart from '../charts/AccuracyChart'
import { SkeletonStatRow } from '../components/Skeleton'
import { instructorApi } from '../services/api'

const LEVEL_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function InstructorDashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    instructorApi.getStudents().then((data) => {
      setStudents(data)
      setLoading(false)
    })
  }, [])

  const avgAccuracy = students.length
    ? Math.round(students.reduce((sum, s) => sum + s.accuracy, 0) / students.length)
    : 0
  const totalLessons = students.reduce((sum, s) => sum + s.lessonsCompleted, 0)
  const topPerformer = students.slice().sort((a, b) => b.accuracy - a.accuracy)[0]

  const columns = [
    { key: 'name', label: 'Student' },
    { key: 'level', label: 'Level' },
    {
      key: 'accuracy',
      label: 'Accuracy',
      render: (row) => <ProgressBar value={row.accuracy} showPercent size="sm" />,
    },
    { key: 'lessonsCompleted', label: 'Lessons' },
    { key: 'lastActive', label: 'Last active' },
  ]

  return (
    <AppShell title="Instructor Dashboard" subtitle="Track your learners' progress at a glance.">
      {loading ? (
        <SkeletonStatRow />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Users} label="Total students" value={students.length} color="text-signal-teal" />
          <StatCard icon={TrendingUp} label="Avg. accuracy" value={avgAccuracy} suffix="%" color="text-signal-coral" delay={0.05} />
          <StatCard icon={BookOpenCheck} label="Lessons completed" value={totalLessons} color="text-signal-amber" delay={0.1} />
          <StatCard icon={Award} label="Top performer" value={topPerformer?.name?.split(' ')[0] || '–'} color="text-violet-400" delay={0.15} />
        </div>
      )}

      <GlassCard delay={0.2} className="mt-6 p-6">
        <h3 className="mb-4 font-display font-semibold">Class accuracy trend</h3>
        <AccuracyChart labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']} data={[55, 61, 66, 70, 74, avgAccuracy]} />
      </GlassCard>

      <div className="mt-6">
        <h3 className="mb-4 font-display font-semibold">Students</h3>
        <SearchableTable
          columns={columns}
          rows={students}
          loading={loading}
          searchKeys={['name', 'email']}
          filters={[{ key: 'level', label: 'Level', options: LEVEL_OPTIONS }]}
          onRowClick={setSelected}
          emptyTitle="No students found"
          emptyDescription="Try a different search term or level filter."
        />
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-mist-500">Email</p>
                <p className="font-medium">{selected.email}</p>
              </div>
              <div>
                <p className="text-mist-500">Level</p>
                <p className="font-medium">{selected.level}</p>
              </div>
              <div>
                <p className="text-mist-500">Lessons completed</p>
                <p className="font-medium">{selected.lessonsCompleted}</p>
              </div>
              <div>
                <p className="text-mist-500">Last active</p>
                <p className="font-medium">{selected.lastActive}</p>
              </div>
            </div>
            <ProgressBar value={selected.accuracy} label="Overall accuracy" size="lg" />
            <AccuracyChart
              labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']}
              data={[
                Math.max(0, selected.accuracy - 18),
                Math.max(0, selected.accuracy - 10),
                Math.max(0, selected.accuracy - 4),
                selected.accuracy,
              ]}
              height={160}
            />
          </div>
        )}
      </Modal>
    </AppShell>
  )
}

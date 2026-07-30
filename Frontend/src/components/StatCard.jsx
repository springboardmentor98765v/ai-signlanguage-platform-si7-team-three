import GlassCard from './GlassCard'

/**
 * Generic KPI card: icon + value + label, optional trend indicator.
 * Used on Dashboard, InstructorDashboard, and AdminDashboard so those
 * pages stay visually consistent without duplicating markup.
 */
export default function StatCard({ icon: Icon, label, value, suffix = '', trend, color = 'text-signal-teal', delay = 0 }) {
  return (
    <GlassCard delay={delay} className="p-5">
      <div className={`mb-3 inline-flex rounded-xl bg-white/[0.06] p-2.5 ${color}`}>
        <Icon size={20} />
      </div>
      <p className="font-display text-2xl font-bold md:text-3xl">
        {value}
        {suffix && <span className="ml-0.5 text-lg text-mist-500">{suffix}</span>}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-xs text-mist-500">{label}</p>
        {trend != null && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-signal-teal' : 'text-signal-coral'}`}>
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
    </GlassCard>
  )
}

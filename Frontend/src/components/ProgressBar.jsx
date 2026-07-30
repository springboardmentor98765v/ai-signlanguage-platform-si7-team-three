export default function ProgressBar({ value, label, showPercent = true, size = 'md', color = 'from-signal-teal to-signal-amber' }) {
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-2.5' : 'h-2'
  return (
    <div>
      {(label || showPercent) && (
        <div className="mb-1.5 flex justify-between text-xs text-mist-500">
          <span>{label}</span>
          {showPercent && <span>{value}%</span>}
        </div>
      )}
      <div className={`${height} overflow-hidden rounded-full bg-white/[0.08]`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}

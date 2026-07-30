export function SkeletonCard({ className = 'h-32' }) {
  return <div className={`glass-card animate-pulse ${className}`} />
}

export function SkeletonText({ width = 'w-full', className = '' }) {
  return <div className={`h-3 ${width} animate-pulse rounded-full bg-white/[0.08] ${className}`} />
}

export function SkeletonRow({ columns = 4 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonText width={i === 0 ? 'w-32' : 'w-16'} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonStatRow({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className="h-28" />
      ))}
    </div>
  )
}

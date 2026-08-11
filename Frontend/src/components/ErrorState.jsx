import { AlertTriangle } from 'lucide-react'

/**
 * ErrorState
 * Milestone 3 - Day 7
 *
 * Deliberately mirrors the prop shape of the existing EmptyState.jsx
 * (icon, title, description, action) so the two are interchangeable in
 * call sites — just swap which one renders based on your fetch state.
 *
 * Usage:
 *   {error ? (
 *     <ErrorState
 *       title="Something went wrong"
 *       description="We couldn't load your dashboard."
 *       action={<button onClick={refetch} className="btn-primary">Try Again</button>}
 *     />
 *   ) : data.length === 0 ? (
 *     <EmptyState title="No lessons yet" ... />
 *   ) : (
 *     ...
 *   )}
 */

export default function ErrorState({ icon: Icon = AlertTriangle, title = 'Something went wrong', description, action }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-signal-coral/30 px-6 py-14 text-center"
    >
      <div className="mb-4 inline-flex rounded-2xl bg-signal-coral/10 p-3 text-signal-coral">
        <Icon size={26} />
      </div>
      <p className="font-display font-semibold text-mist-100">{title}</p>
      {description && <p className="mt-1.5 max-w-xs text-sm text-mist-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

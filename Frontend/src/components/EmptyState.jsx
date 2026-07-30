export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.14] px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 inline-flex rounded-2xl bg-white/[0.06] p-3 text-mist-500">
          <Icon size={26} />
        </div>
      )}
      <p className="font-display font-semibold text-mist-100">{title}</p>
      {description && <p className="mt-1.5 max-w-xs text-sm text-mist-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

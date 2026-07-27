import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import EmptyState from './EmptyState'
import { SkeletonRow } from './Skeleton'

/**
 * columns: [{ key, label, render?(row) }]
 * rows: array of data objects
 * filters: optional [{ key, label, options: ['All', ...] }] rendered as pill filters
 * searchKeys: which row fields free-text search matches against
 */
export default function SearchableTable({
  columns,
  rows,
  searchKeys = [],
  filters = [],
  loading = false,
  emptyTitle = 'No results',
  emptyDescription = 'Try adjusting your search or filters.',
  onRowClick,
}) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({})

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesQuery =
        !query ||
        searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(query.toLowerCase()))
      const matchesFilters = filters.every(({ key }) => {
        const active = activeFilters[key]
        return !active || active === 'All' || row[key] === active
      })
      return matchesQuery && matchesFilters
    })
  }, [rows, query, activeFilters, searchKeys, filters])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-500" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="glass-input py-2.5 pl-10 text-sm"
          />
        </div>
        {filters.map(({ key, label, options }) => (
          <select
            key={key}
            value={activeFilters[key] || 'All'}
            onChange={(e) => setActiveFilters((f) => ({ ...f, [key]: e.target.value }))}
            className="glass-input w-auto cursor-pointer py-2.5 text-sm"
            aria-label={label}
          >
            {options.map((opt) => (
              <option key={opt} value={opt} className="bg-night-800">
                {opt}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-mist-500">
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-4 py-3.5 font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} columns={columns.length} />)}

            {!loading &&
              filtered.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={`transition ${onRowClick ? 'cursor-pointer hover:bg-white/[0.04]' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-4 py-3.5">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>

        {!loading && filtered.length === 0 && (
          <div className="p-4">
            <EmptyState icon={Search} title={emptyTitle} description={emptyDescription} />
          </div>
        )}
      </div>
    </div>
  )
}

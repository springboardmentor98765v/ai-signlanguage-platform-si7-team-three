import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { reportApi } from '../services/api'

/**
 * ExportReportButton
 * Milestone 3 - Day 5
 *
 * Drop into Reports.jsx near the certificate/badges section:
 *   <ExportReportButton />
 */

export default function ExportReportButton() {
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'error'

  async function handleExport() {
    setStatus('loading')
    try {
      const blob = await reportApi.exportReport('csv')
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `progress-report-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setStatus('idle')
    } catch (err) {
      console.error('Report export failed:', err)
      setStatus('error')
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleExport}
        disabled={status === 'loading'}
        className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Preparing file…
          </>
        ) : (
          <>
            <Download size={16} aria-hidden="true" />
            Export Report
          </>
        )}
      </button>

      {status === 'error' && (
        <p role="alert" className="text-xs text-signal-coral">
          Couldn't export your report. Please try again.
        </p>
      )}
    </div>
  )
}

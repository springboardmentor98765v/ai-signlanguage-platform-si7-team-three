import { Download, Printer, ShieldCheck } from 'lucide-react'
import AppShell from '../components/AppShell'
import GlassCard from '../components/GlassCard'
import HandSkeleton from '../components/HandSkeleton'
import { useAuth } from '../context/AuthContext'
import { mockDashboard } from '../data/mockData'

function formatDate(date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Certificate() {
  const { user } = useAuth()
  const issueDate = formatDate(new Date())
  const certId = `SLP-${(user?.id || 'demo').toUpperCase()}-${new Date().getFullYear()}`

  function handlePrint() {
    window.print()
  }

  return (
    <AppShell title="Certificate" subtitle="Download or print your certificate of completion.">
      {/* Print-only styles: hide everything except #certificate when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate, #certificate * { visibility: visible; }
          #certificate { position: fixed; inset: 0; margin: auto; }
        }
      `}</style>

      <div className="flex flex-col items-center">
        <div
          id="certificate"
          className="glass-strong relative w-full max-w-3xl overflow-hidden rounded-[2rem] border-2 border-signal-amber/20 p-10 md:p-14"
        >
          {/* decorative corner motif */}
          <HandSkeleton className="absolute -bottom-14 -right-14 h-64 w-64 text-signal-teal/10" animated={false} />
          <HandSkeleton className="absolute -top-14 -left-14 h-64 w-64 rotate-180 text-signal-coral/10" animated={false} />

          <div className="relative text-center">
            {/* Logo placeholder */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-signal-teal to-violet-500">
              <HandSkeleton className="h-9 w-9 text-night-950" animated={false} />
            </div>

            <p className="label-eyebrow">Certificate of Completion</p>
            <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">SignalPath Learning Platform</h1>
            <p className="mt-6 text-sm text-mist-500">This certifies that</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-gradient md:text-3xl">
              {user?.name || 'Learner Name'}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-mist-300">
              has successfully completed the <span className="text-mist-100">Alphabet Fundamentals</span> module
              with an average accuracy of{' '}
              <span className="font-semibold text-signal-teal">{mockDashboard.accuracy}%</span> across{' '}
              <span className="font-semibold text-mist-100">{mockDashboard.lessonsCompleted}</span> lessons.
            </p>

            <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 items-end gap-6 border-t border-white/10 pt-8">
              <div className="text-left">
                <div className="mb-2 h-px w-full bg-mist-500/40" />
                <p className="text-xs text-mist-500">Instructor signature</p>
              </div>

              {/* QR placeholder */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04]">
                <div className="grid grid-cols-4 gap-0.5 p-1.5">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-[1px] ${[0, 2, 5, 7, 8, 11, 13, 15].includes(i) ? 'bg-mist-300' : 'bg-transparent'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="mb-2 h-px w-full bg-mist-500/40" />
                <p className="text-xs text-mist-500">{issueDate}</p>
              </div>
            </div>

            <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-mist-500">
              <ShieldCheck size={13} /> Certificate ID: {certId}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3 print:hidden">
          <button onClick={handlePrint} className="btn-ghost">
            <Printer size={17} /> Print
          </button>
          <button onClick={handlePrint} className="btn-primary">
            <Download size={17} /> Download as PDF
          </button>
        </div>
        <p className="mt-3 max-w-md text-center text-xs text-mist-500 print:hidden">
          "Download as PDF" opens your browser's print dialog — choose "Save as PDF" as the
          destination. A dedicated export (e.g. via a PDF library on the backend) can replace
          this once that service exists.
        </p>
      </div>
    </AppShell>
  )
}

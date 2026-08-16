import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, CameraOff, Sparkles, RotateCcw, AlertTriangle } from 'lucide-react'
import AppShell from '../components/AppShell'
import GlassCard from '../components/GlassCard'
import { practiceApi } from '../services/api'
import { mockLessons } from '../data/mockData'
import { useToast } from '../context/ToastContext'

export default function Practice() {
  const [searchParams] = useSearchParams()
  const lessonId = searchParams.get('lesson')
  const lesson = mockLessons.find((l) => l.id === lessonId) || mockLessons[0]

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [letterIndex, setLetterIndex] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)

  const targetLetter = lesson.letters[letterIndex]
  const { toast } = useToast()

  useEffect(() => {
    practiceApi.startSession(lesson.id).then((s) => setSessionId(s.sessionId))
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id])

  // Attaches the stream to the <video> element once both exist. The video
  // tag is now ALWAYS mounted (see JSX below), so this fires reliably
  // instead of racing against a conditional render — that race was the
  // cause of "camera sometimes doesn't show" behavior.
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [cameraOn])

  async function startCamera() {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      setCameraOn(true)
    } catch (err) {
      setCameraError('Camera access was denied or is unavailable. Check your browser permissions.')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOn(false)
  }

  async function handleCapture() {
    if (!cameraOn) return
    setScanning(true)
    setResult(null)
    const res = await practiceApi.submitAttempt(sessionId, targetLetter, null)
    setResult(res)
    setScanning(false)
    if (res.accuracy >= 90) toast(`${res.accuracy}% accuracy — great form!`, 'success')
    else if (res.accuracy < 55) toast('Keep practicing — check the feedback below.', 'info')
  }

  function nextLetter() {
    setResult(null)
    setLetterIndex((i) => (i + 1) % lesson.letters.length)
  }

  return (
    <AppShell title="Practice" subtitle={`${lesson.title} · Letter ${letterIndex + 1} of ${lesson.letters.length}`}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Webcam panel */}
        <GlassCard strong className="relative overflow-hidden p-4 md:p-6">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-night-950">
            {/* Video is ALWAYS mounted so videoRef is always valid when
                startCamera() runs — visibility is controlled with CSS
                instead of conditional rendering. */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full -scale-x-100 object-cover ${cameraOn ? 'opacity-100' : 'opacity-0'}`}
            />

            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-mist-500">
                <Camera size={36} />
                <p className="text-sm">Turn on your camera to start practicing</p>
              </div>
            )}

            {/* Corner scan markers — visual echo of the hand-landmark rig */}
            {cameraOn && (
              <>
                {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos) => (
                  <span
                    key={pos}
                    className={`absolute ${pos} h-6 w-6 rounded-sm border-2 border-signal-teal/70`}
                    style={{
                      borderRightWidth: pos.includes('right') ? 2 : 0,
                      borderLeftWidth: pos.includes('left') ? 2 : 0,
                      borderTopWidth: pos.includes('top') ? 2 : 0,
                      borderBottomWidth: pos.includes('bottom') ? 2 : 0,
                    }}
                  />
                ))}
                {scanning && (
                  <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-signal-teal/40 to-transparent animate-scanline" />
                )}
              </>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {!cameraOn ? (
                <button onClick={startCamera} className="btn-primary">
                  <Camera size={18} /> Start camera
                </button>
              ) : (
                <button onClick={stopCamera} className="btn-ghost">
                  <CameraOff size={18} /> Stop camera
                </button>
              )}
            </div>

            <button onClick={handleCapture} disabled={!cameraOn || scanning} className="btn-primary">
              <Sparkles size={18} />
              {scanning ? 'Analysing…' : 'Capture & check'}
            </button>
          </div>

          {cameraError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-signal-coral/30 bg-signal-coral/10 px-4 py-3 text-sm text-signal-coral">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {cameraError}
            </div>
          )}
        </GlassCard>

        {/* Reference + result panel */}
        <div className="flex flex-col gap-6">
          <GlassCard className="flex flex-col items-center p-8 text-center">
            <p className="label-eyebrow mb-3">Match this sign</p>
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-signal-teal/20 to-signal-coral/20 font-display text-6xl font-extrabold">
              {targetLetter}
            </div>
            <button onClick={nextLetter} className="btn-ghost mt-5 text-sm">
              <RotateCcw size={15} /> Skip to next letter
            </button>
          </GlassCard>

          <GlassCard className="flex-1 p-6">
            <h3 className="mb-4 font-display font-semibold">Result & feedback</h3>

            <AnimatePresence mode="wait">
              {!result && !scanning && (
                <motion.p key="empty" exit={{ opacity: 0 }} className="text-sm text-mist-500">
                  Capture a frame to see your predicted sign, accuracy score, and
                  feedback here.
                </motion.p>
              )}

              {scanning && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 text-sm text-mist-500"
                >
                  <span className="h-2 w-2 animate-pulseDot rounded-full bg-signal-teal" />
                  Running hand-landmark detection…
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-mist-500">Predicted sign</span>
                    <span className="font-display text-xl font-bold text-signal-teal">
                      {result.predictedSign}
                    </span>
                  </div>

                  <div>
                    <div className="mb-1.5 flex justify-between text-xs text-mist-500">
                      <span>Accuracy</span>
                      <span>{result.accuracy}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.accuracy}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-signal-teal to-signal-amber"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-mist-300">
                    {result.feedback}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  )
}
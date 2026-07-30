import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const VARIANTS = {
  success: { icon: CheckCircle2, accent: 'text-signal-teal', border: 'border-signal-teal/30' },
  error: { icon: XCircle, accent: 'text-signal-coral', border: 'border-signal-coral/30' },
  info: { icon: Info, accent: 'text-violet-400', border: 'border-violet-400/30' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message, variant = 'info', duration = 3500) => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, message, variant }])
      if (duration) setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map(({ id, message, variant }) => {
            const { icon: Icon, accent, border } = VARIANTS[variant] || VARIANTS.info
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                className={`glass-strong pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-glass ${border}`}
              >
                <Icon size={18} className={`mt-0.5 shrink-0 ${accent}`} />
                <p className="flex-1 text-sm text-mist-100">{message}</p>
                <button onClick={() => dismiss(id)} className="text-mist-500 hover:text-mist-100">
                  <X size={15} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

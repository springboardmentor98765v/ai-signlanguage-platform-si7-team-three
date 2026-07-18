import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', delay = 0, strong = false, as: Motion = motion.div, ...rest }) {
  return (
    <Motion
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`${strong ? 'glass-strong' : 'glass'} rounded-3xl ${className}`}
      {...rest}
    >
      {children}
    </Motion>
  )
}

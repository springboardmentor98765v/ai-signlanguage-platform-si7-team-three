export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-night-900">
      {/* base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#131B33_0%,_#070A17_70%)]" />

      {/* drifting aurora blobs — the ambient glow that glass surfaces sit on top of */}
      <div className="absolute top-[-10%] left-[10%] h-[420px] w-[420px] rounded-full bg-violet-500/30 blur-[120px] animate-drift1" />
      <div className="absolute bottom-[-15%] right-[5%] h-[480px] w-[480px] rounded-full bg-signal-teal/20 blur-[140px] animate-drift2" />
      <div className="absolute top-[30%] right-[25%] h-[300px] w-[300px] rounded-full bg-signal-coral/15 blur-[110px] animate-drift3" />

      {/* subtle grain / noise overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}

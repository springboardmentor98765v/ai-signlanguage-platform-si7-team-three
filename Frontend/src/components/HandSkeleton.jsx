// The recurring visual signature of the app: a stylised 21-point hand
// landmark rig, echoing the MediaPipe skeleton the AI/CV layer detects.
// Used as the logo mark, the auth-page hero, and the Practice screen's
// scanning overlay so the brand and the underlying tech tell the same story.

const POINTS = [
  [100, 180], // wrist
  [75, 150], [90, 145], [110, 145], [125, 150], // palm knuckles
  [65, 110], [60, 75], [57, 45], // index
  [88, 95], [87, 55], [86, 20], // middle
  [112, 95], [113, 55], [114, 20], // ring
  [133, 115], [138, 85], [141, 60], // pinky
  [50, 140], [35, 125], [25, 110], // thumb
]

const BONES = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 5], [5, 6], [6, 7],
  [2, 8], [8, 9], [9, 10],
  [3, 11], [11, 12], [12, 13],
  [4, 14], [14, 15], [15, 16],
  [1, 17], [17, 18], [18, 19],
]

export default function HandSkeleton({ className = '', animated = true, color = 'currentColor' }) {
  return (
    <svg
      viewBox="0 0 165 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {BONES.map(([a, b], i) => (
        <line
          key={i}
          x1={POINTS[a][0]}
          y1={POINTS[a][1]}
          x2={POINTS[b][0]}
          y2={POINTS[b][1]}
          stroke={color}
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
      ))}
      {POINTS.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === 0 ? 4 : 3}
          fill={color}
          className={animated ? 'animate-pulseDot' : ''}
          style={animated ? { animationDelay: `${(i % 7) * 0.18}s` } : undefined}
        />
      ))}
    </svg>
  )
}

interface RadarChartProps {
  fillPercent: number
  color: string
  glowColor?: string
  size?: number
}

const AXES = [
  { label: 'Disciplina', icon: '🔒', angle: -90 },
  { label: 'Energia', icon: '⚡', angle: -30 },
  { label: 'Hábitos', icon: '✅', angle: 30 },
  { label: 'Consistência', icon: '📅', angle: 90 },
  { label: 'Saúde', icon: '❤️', angle: 150 },
  { label: 'Foco', icon: '🎯', angle: 210 },
]

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function RadarChart({ fillPercent, color, size = 280 }: RadarChartProps) {
  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.32
  const fillR = maxR * (fillPercent / 100)

  const gridLevels = [0.25, 0.5, 0.75, 1]

  const fillPoints = AXES.map(({ angle }) => {
    const pt = polarToCartesian(cx, cy, fillR, angle + 90)
    return `${pt.x},${pt.y}`
  }).join(' ')

  return (
    <div className="relative mx-auto" style={{ width: size, height: size + 60 }}>
      <svg width={size} height={size} className="mx-auto">
        {gridLevels.map((level) => {
          const pts = AXES.map(({ angle }) => {
            const pt = polarToCartesian(cx, cy, maxR * level, angle + 90)
            return `${pt.x},${pt.y}`
          }).join(' ')
          return (
            <polygon
              key={level}
              points={pts}
              fill="none"
              stroke="#333"
              strokeWidth="1"
            />
          )
        })}

        {AXES.map(({ angle }) => {
          const pt = polarToCartesian(cx, cy, maxR, angle + 90)
          return (
            <line
              key={angle}
              x1={cx}
              y1={cy}
              x2={pt.x}
              y2={pt.y}
              stroke="#333"
              strokeWidth="1"
            />
          )
        })}

        <polygon
          points={fillPoints}
          fill={color}
          fillOpacity={0.35}
          stroke={color}
          strokeWidth="2"
        />

        <circle cx={cx} cy={cy} r={16} fill={color} fillOpacity={0.8} />
        <text x={cx} y={cy + 5} textAnchor="middle" fill="white" fontSize="14">
          🧍
        </text>
      </svg>

      {AXES.map(({ label, icon, angle }) => {
        const pt = polarToCartesian(cx, cy, maxR + 36, angle + 90)
        const isTop = angle === -90
        const isBottom = angle === 90
        return (
          <div
            key={label}
            className="absolute flex items-center gap-1 bg-black/80 border border-neutral-800 rounded-full px-2.5 py-1 text-xs whitespace-nowrap"
            style={{
              left: pt.x,
              top: pt.y + (isTop ? -20 : isBottom ? 0 : -12),
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span>{icon}</span>
            <span className="text-neutral-300 font-medium">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

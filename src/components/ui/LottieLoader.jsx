/**
 * Dashed-circle loading spinner (Lordicon #715 style).
 * Theme palette from notuoku.txt:
 * #F5EEDC (cream), #27548A (blue), #183B4E (dark teal), #DDA853 (gold)
 */
export default function LottieLoader({ size = 48, text = '' }) {
  const dashCount = 12
  const radius = 18
  const cx = 25
  const cy = 25

  const dashes = Array.from({ length: dashCount }, (_, i) => {
    const angle = (360 / dashCount) * i
    const rad = (angle * Math.PI) / 180
    const x1 = cx + (radius - 4) * Math.cos(rad)
    const y1 = cy + (radius - 4) * Math.sin(rad)
    const x2 = cx + radius * Math.cos(rad)
    const y2 = cy + radius * Math.sin(rad)
    return { x1, y1, x2, y2 }
  })

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        style={{ animation: 'spinnerRotate 1s linear infinite' }}
      >
        {dashes.map((d, i) => (
          <line
            key={i}
            x1={d.x1}
            y1={d.y1}
            x2={d.x2}
            y2={d.y2}
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{
              animation: `dashedSpinnerColor 1.2s ease-in-out infinite`,
              animationDelay: `${(i * 0.1).toFixed(1)}s`,
            }}
          />
        ))}
      </svg>
      {text && <p className="text-gray-500 dark:text-swype-silver text-sm">{text}</p>}
    </div>
  )
}

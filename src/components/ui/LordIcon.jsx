import { useEffect, useRef } from 'react'

/**
 * LordIcon wrapper component for React.
 * Uses the lordicon.js CDN script (loaded in index.html).
 *
 * If no src is provided, renders the fallback (Lucide icon) instead.
 *
 * To get icon src URLs:
 * 1. Go to https://lordicon.com/icons
 * 2. Find the icon you want
 * 3. Click on it → Export → Embed HTML
 * 4. Copy the src URL from the embed code
 */
export default function LordIcon({
  src,
  trigger = 'hover',
  stroke = 'regular',
  size = 24,
  colors,
  className = '',
  style = {},
  fallback = null,
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && colors) {
      ref.current.setAttribute('colors', colors)
    }
  }, [colors])

  if (!src) return fallback

  return (
    <lord-icon
      ref={ref}
      src={src}
      trigger={trigger}
      stroke={stroke}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        ...style,
      }}
      class={className}
    />
  )
}

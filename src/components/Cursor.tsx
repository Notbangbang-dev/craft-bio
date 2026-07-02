import { useEffect, useRef } from 'react'
import { useSite } from '../context/siteContext'

// ---------------------------------------------------------------------------
// A pixel-art cursor that replaces the native one, plus a burst of "block
// break" particles on every click. Disabled on touch / coarse pointers.
// ---------------------------------------------------------------------------

const SPARK_COLORS = ['#7cbd56', '#96714a', '#a4a4a4', '#ffcf3f', '#3ff0e0']

export function Cursor() {
  const { cursorOn, activeTheme } = useSite()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (!cursorOn || coarse) {
      document.body.classList.remove('mc-cursor')
      return
    }
    document.body.classList.add('mc-cursor')

    const el = ref.current
    const move = (e: MouseEvent) => {
      if (el) el.style.transform = `translate(${e.clientX - 2}px, ${e.clientY - 2}px)`
    }
    const down = (e: MouseEvent) => {
      el?.classList.add('click')
      spawnSparks(e.clientX, e.clientY, activeTheme.colors.accent2)
    }
    const up = () => el?.classList.remove('click')

    window.addEventListener('mousemove', move)
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
      document.body.classList.remove('mc-cursor')
    }
  }, [cursorOn, activeTheme.colors.accent2])

  if (!cursorOn) return null

  return (
    <div className="cursor" ref={ref}>
      <svg viewBox="0 0 16 16" shapeRendering="crispEdges">
        <path
          d="M2 1h2v2H2zM4 3h2v2H4zM6 5h2v2H6zM8 7h2v2H8zM6 9h2v2H6zM4 9h2v4H4zM2 3v8h2V3z"
          fill="#fff"
          stroke="#000"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  )
}

function spawnSparks(x: number, y: number, accent: string) {
  const colors = [...SPARK_COLORS, accent]
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('div')
    s.className = 'spark'
    s.style.left = `${x - 3}px`
    s.style.top = `${y - 3}px`
    s.style.background = colors[Math.floor(Math.random() * colors.length)]
    document.body.appendChild(s)
    const angle = Math.random() * Math.PI * 2
    const dist = 24 + Math.random() * 40
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist - 20
    s.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0 },
      ],
      { duration: 500 + Math.random() * 250, easing: 'cubic-bezier(.2,.7,.3,1)' },
    ).addEventListener('finish', () => s.remove())
  }
}

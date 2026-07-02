import { useEffect, useState } from 'react'

// Types out each line, pauses, deletes, moves to the next. Loops forever.
export function Typewriter({ lines }: { lines: string[] }) {
  const [idx, setIdx] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (lines.length === 0) return
    const full = lines[idx % lines.length]

    if (!deleting && text === full) {
      const t = setTimeout(() => setDeleting(true), 1600)
      return () => clearTimeout(t)
    }
    if (deleting && text === '') {
      setDeleting(false)
      setIdx((i) => (i + 1) % lines.length)
      return
    }

    const t = setTimeout(
      () => {
        setText((cur) =>
          deleting ? cur.slice(0, -1) : full.slice(0, cur.length + 1),
        )
      },
      deleting ? 34 : 62,
    )
    return () => clearTimeout(t)
  }, [text, deleting, idx, lines])

  return (
    <p className="tagline">
      {text}
      <span className="caret">&nbsp;</span>
    </p>
  )
}

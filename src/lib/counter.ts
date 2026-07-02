// ---------------------------------------------------------------------------
// Abacus — a free, no-signup, CORS-open hit counter (abacus.jasoncameron.dev).
// /hit atomically increments and returns { value }. Namespace + key must match
// ^[A-Za-z0-9_\-.]{3,64}$. Counters can expire after ~2 days of inactivity.
// ---------------------------------------------------------------------------

const VALID = /^[A-Za-z0-9_\-.]{3,64}$/

/** Increment and return the new visit count, or null on any failure. */
export async function hitCounter(ns: string, key: string): Promise<number | null> {
  if (!VALID.test(ns) || !VALID.test(key)) return null
  try {
    const res = await fetch(`https://abacus.jasoncameron.dev/hit/${ns}/${key}`)
    if (!res.ok) return null
    const json = await res.json()
    return typeof json?.value === 'number' ? json.value : null
  } catch {
    return null
  }
}

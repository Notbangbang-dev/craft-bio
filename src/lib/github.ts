import type { GithubStats } from '../types'

// ---------------------------------------------------------------------------
// GitHub public stats (unauthenticated, 60 req/hr per IP). We cache in
// localStorage for 30 min so refreshes/visits stay well under the limit, and
// fall back to the last-known cache on any error / rate-limit (403).
// ---------------------------------------------------------------------------

const PREFIX = 'craftbio.gh.'
const TTL = 30 * 60 * 1000

interface Cached {
  ts: number
  v: GithubStats
}

function readCache(key: string): GithubStats | null {
  try {
    const c = JSON.parse(localStorage.getItem(key) || 'null') as Cached | null
    return c?.v ?? null
  } catch {
    return null
  }
}

export async function fetchGithub(user: string): Promise<GithubStats | null> {
  if (!user) return null
  const key = PREFIX + user
  const cached = (() => {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null') as Cached | null
    } catch {
      return null
    }
  })()
  if (cached && Date.now() - cached.ts < TTL) return cached.v

  try {
    const uRes = await fetch(`https://api.github.com/users/${user}`)
    if (!uRes.ok) return cached?.v ?? null
    const u = await uRes.json()

    let stars = 0
    const rRes = await fetch(`https://api.github.com/users/${user}/repos?per_page=100`)
    if (rRes.ok) {
      const repos = await rRes.json()
      // On 403/429 the body is an object, not the array — guard before reduce.
      if (Array.isArray(repos)) {
        stars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
      }
    }

    const v: GithubStats = {
      repos: u.public_repos || 0,
      followers: u.followers || 0,
      following: u.following || 0,
      stars,
    }
    try {
      localStorage.setItem(key, JSON.stringify({ ts: Date.now(), v } satisfies Cached))
    } catch {
      /* ignore */
    }
    return v
  } catch {
    return cached?.v ?? readCache(key)
  }
}

import { useEffect, useRef, useState } from 'react'
import { useSite } from '../context/siteContext'
import { fetchPresence } from '../lib/lanyard'
import { fetchGithub } from '../lib/github'
import { hitCounter } from '../lib/counter'
import { store } from '../lib/storage'
import type { GithubStats, Presence } from '../types'

/** Live Discord presence, polled every 15s while enabled. */
export function usePresence(): Presence | null {
  const { profile } = useSite()
  const enabled = profile.features.presence
  const id = profile.integrations.discordId
  const [data, setData] = useState<Presence | null>(null)

  useEffect(() => {
    if (!enabled || !id) {
      setData(null)
      return
    }
    let alive = true
    const tick = () => fetchPresence(id).then((p) => alive && setData(p))
    tick()
    const t = setInterval(tick, 15000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [enabled, id])

  return data
}

/** Public GitHub stats (cached), fetched once per config change. */
export function useGithubStats(): GithubStats | null {
  const { profile } = useSite()
  const enabled = profile.features.github
  const user = profile.integrations.githubUser
  const [data, setData] = useState<GithubStats | null>(null)

  useEffect(() => {
    if (!enabled || !user) {
      setData(null)
      return
    }
    let alive = true
    fetchGithub(user).then((s) => alive && setData(s))
    return () => {
      alive = false
    }
  }, [enabled, user])

  return data
}

/**
 * The view count. Uses the live Abacus counter when enabled (falling back to a
 * per-browser localStorage bump), otherwise localStorage only. The ref guard
 * makes it count exactly once even under React StrictMode's double-effect.
 */
export function useViews(): number {
  const { profile } = useSite()
  const { liveViews } = profile.features
  const { counterNamespace, counterKey } = profile.integrations
  const base = profile.baseViews
  const [views, setViews] = useState<number>(base)
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    if (liveViews) {
      hitCounter(counterNamespace, counterKey).then((v) => {
        setViews(v != null ? base + v : store.bumpViews(base))
      })
    } else {
      setViews(store.bumpViews(base))
    }
    // Count once on mount; config is read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return views
}

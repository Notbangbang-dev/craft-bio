import { useEffect, useState } from 'react'
import type { DiscordStatus, GithubStats, SpotifyNow } from '../types'
import { Icon } from './icons'

const LABEL: Record<DiscordStatus, string> = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  offline: 'Offline',
}

// Live Discord status dot + label (+ current game/activity if any).
export function StatusLine({
  status,
  activity,
}: {
  status: DiscordStatus
  activity: string | null
}) {
  return (
    <div className="presence">
      <span className={`statusdot ${status}`} />
      <span className="statustext">
        {LABEL[status]}
        {activity ? ` · ${activity}` : ''}
      </span>
    </div>
  )
}

function fmt(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Live "now playing" card with a ticking progress bar from Spotify timestamps.
export function SpotifyNowPlaying({ spotify }: { spotify: SpotifyNow }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const total = Math.max(1, spotify.end - spotify.start)
  const elapsed = Math.min(total, Math.max(0, now - spotify.start))
  const pct = Math.min(100, (elapsed / total) * 100)

  return (
    <a
      className="mc-slot spotify"
      href="https://open.spotify.com"
      target="_blank"
      rel="noreferrer noopener"
    >
      <img className="spotify__art" src={spotify.albumArt} alt="" draggable={false} />
      <div className="spotify__meta">
        <div className="spotify__now">
          <Icon name="spotify" size={13} /> listening on spotify
        </div>
        <div className="spotify__song" title={spotify.song}>
          {spotify.song}
        </div>
        <div className="spotify__artist" title={spotify.artist}>
          by {spotify.artist}
        </div>
        <div className="spotify__bar">
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="spotify__time">
          <span>{fmt(elapsed)}</span>
          <span>{fmt(total)}</span>
        </div>
      </div>
    </a>
  )
}

// repos / followers / stars pulled from the GitHub API.
export function GithubRow({ stats }: { stats: GithubStats }) {
  const items: [string, number][] = [
    ['repos', stats.repos],
    ['followers', stats.followers],
    ['stars', stats.stars],
  ]
  return (
    <div className="ghrow">
      {items.map(([label, value]) => (
        <div className="ghstat" key={label}>
          <b>{value.toLocaleString()}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

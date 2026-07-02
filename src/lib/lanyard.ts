import type { Presence } from '../types'

// ---------------------------------------------------------------------------
// Lanyard — live Discord presence + Spotify for a user id.
// REST, no auth, CORS-open. The user must be a member of the Lanyard Discord
// (discord.gg/lanyard) or the API returns { success: false } (HTTP 404 w/ JSON
// body) — which we treat as "no data" and fall back gracefully.
// ---------------------------------------------------------------------------

interface LanyardActivity {
  type: number
  name: string
}

export async function fetchPresence(id: string): Promise<Presence | null> {
  if (!id) return null
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${id}`)
    // NOTE: do not `if (!res.ok) throw` — errors come back as 404 with a JSON body.
    const json = await res.json()
    if (!json?.success) return null
    const d = json.data
    const s = d.listening_to_spotify && d.spotify ? d.spotify : null
    const game = (d.activities as LanyardActivity[] | undefined)?.find((a) => a.type === 0)
    return {
      status: d.discord_status ?? 'offline',
      spotify: s
        ? {
            song: s.song,
            artist: s.artist,
            album: s.album,
            albumArt: s.album_art_url,
            start: s.timestamps?.start ?? 0,
            end: s.timestamps?.end ?? 0,
          }
        : null,
      activity: game?.name ?? null,
      onMobile: Boolean(d.active_on_discord_mobile),
    }
  } catch {
    return null
  }
}

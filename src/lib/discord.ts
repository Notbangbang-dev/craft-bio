import { DISCORD_CLIENT_ID, OAUTH_REDIRECT_URI, STORAGE } from '../config'
import type { DiscordUser } from '../types'

// ---------------------------------------------------------------------------
// Discord OAuth2 — "implicit grant" flow.
//
// This runs 100% in the browser with NO client secret and NO backend, so the
// whole site can be hosted as static files. We only ever request the
// `identify` scope (the user's id + name + avatar), never email or servers.
// ---------------------------------------------------------------------------

interface StoredToken {
  accessToken: string
  tokenType: string
  expiresAt: number
}

/** Kick off login: send the browser to Discord's consent screen. */
export function login(): void {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: OAUTH_REDIRECT_URI,
    response_type: 'token',
    scope: 'identify',
    // 'none' lets already-authorized visitors skip the consent screen.
    prompt: 'none',
  })
  window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`
}

export function logout(): void {
  localStorage.removeItem(STORAGE.token)
}

export function isConfigured(): boolean {
  return Boolean(DISCORD_CLIENT_ID) && DISCORD_CLIENT_ID !== '000000000000000000'
}

/**
 * If we just came back from Discord, the access token is in the URL hash.
 * Parse it, persist it, and scrub the hash so it doesn't linger in the bar.
 */
export function captureTokenFromHash(): void {
  if (!window.location.hash.includes('access_token')) return
  const hash = new URLSearchParams(window.location.hash.slice(1))
  const accessToken = hash.get('access_token')
  const tokenType = hash.get('token_type') ?? 'Bearer'
  const expiresIn = Number(hash.get('expires_in') ?? '0')
  if (accessToken) {
    const token: StoredToken = {
      accessToken,
      tokenType,
      expiresAt: Date.now() + expiresIn * 1000,
    }
    localStorage.setItem(STORAGE.token, JSON.stringify(token))
  }
  // Remove the hash without adding a history entry.
  history.replaceState(null, '', OAUTH_REDIRECT_URI)
}

function getStoredToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(STORAGE.token)
    if (!raw) return null
    const token = JSON.parse(raw) as StoredToken
    if (token.expiresAt <= Date.now()) {
      localStorage.removeItem(STORAGE.token)
      return null
    }
    return token
  } catch {
    return null
  }
}

/** Fetch the logged-in user, or null if not logged in / token expired. */
export async function fetchMe(): Promise<DiscordUser | null> {
  const token = getStoredToken()
  if (!token) return null
  try {
    const res = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `${token.tokenType} ${token.accessToken}` },
    })
    if (!res.ok) {
      if (res.status === 401) localStorage.removeItem(STORAGE.token)
      return null
    }
    return (await res.json()) as DiscordUser
  } catch {
    return null
  }
}

/** CDN url for a user's avatar (falls back to a default embed avatar). */
export function avatarUrl(user: DiscordUser): string {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
  }
  const idx = (BigInt(user.id) >> 22n) % 6n
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`
}

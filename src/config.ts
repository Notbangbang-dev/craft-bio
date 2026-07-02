// ---------------------------------------------------------------------------
// App-wide configuration.
// ---------------------------------------------------------------------------

/**
 * The ONLY Discord user allowed to edit the site.
 * (This is you.) Anyone else who logs in is treated as a normal visitor.
 */
export const ADMIN_DISCORD_ID = '1226241151065919548'

/** Discord OAuth2 application client id. Set VITE_DISCORD_CLIENT_ID in .env */
export const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID ?? ''

/**
 * OAuth redirect target. We bounce back to the same origin+path the visitor
 * started on. This exact value must be registered in the Discord Developer
 * Portal under OAuth2 -> Redirects.
 */
export const OAUTH_REDIRECT_URI = `${window.location.origin}${window.location.pathname}`

/** localStorage keys. */
export const STORAGE = {
  profile: 'craftbio.profile.v1',
  themes: 'craftbio.customThemes.v1',
  activeTheme: 'craftbio.activeTheme.v1',
  token: 'craftbio.discordToken.v1',
  views: 'craftbio.views.v1',
  muted: 'craftbio.muted.v1',
  cursor: 'craftbio.cursor.v1',
} as const

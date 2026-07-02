import type { Profile } from './types'
import { DEFAULT_THEME_ID } from './themes'

// ---------------------------------------------------------------------------
// The starting profile. Everything here is editable in the Admin panel and
// saved to localStorage. Edit these values to change the "factory defaults".
// ---------------------------------------------------------------------------

export const DEFAULT_PROFILE: Profile = {
  displayName: 'Notbangbang',
  username: 'notbangbang',
  // Full-body Minecraft skin render (mc-heads.net, verified live + CORS-ok).
  avatar: 'https://mc-heads.net/body/Notbangbang',
  taglines: [
    'building blocks on the internet.',
    'diamonds are temporary, redstone is forever.',
    'currently mining for ideas...',
    'press F to pay respects.',
  ],
  location: 'somewhere near spawn',
  badges: ['⛏️ builder', '⭐ og', '🧱 block enjoyer'],
  links: [
    { id: 'l1', icon: 'discord', label: 'Discord', url: 'https://discord.com/users/1226241151065919548' },
    { id: 'l2', icon: 'github', label: 'GitHub', url: 'https://github.com/Notbangbang-dev' },
    { id: 'l3', icon: 'youtube', label: 'YouTube', url: 'https://youtube.com' },
    { id: 'l4', icon: 'spotify', label: 'Spotify', url: 'https://spotify.com' },
    { id: 'l5', icon: 'twitter', label: 'Twitter', url: 'https://twitter.com' },
    { id: 'l6', icon: 'globe', label: 'Website', url: 'https://example.com' },
  ],
  defaultThemeId: DEFAULT_THEME_ID,
  baseViews: 0,

  splashTitle: 'notbangbang.bio',
  splashSubtitle: 'a blocky corner of the internet',
  splashHint: '[ click anywhere to enter ]',
  footer: 'built with blocks ⛏',

  integrations: {
    discordId: '1226241151065919548',
    githubUser: 'Notbangbang-dev',
    mcUsername: 'Notbangbang',
    counterNamespace: 'craftbio-notbangbang',
    counterKey: 'views',
  },
  features: {
    presence: true,
    spotify: true,
    github: true,
    liveViews: true,
    particles: true,
    music: false,
    splash: true,
  },
  effects: {
    blockCount: 16,
    dustCount: 46,
    spinBlocks: true,
  },
}

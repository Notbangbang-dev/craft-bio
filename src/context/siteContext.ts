import { createContext, useContext } from 'react'
import type { DiscordUser, Profile, Theme } from '../types'

// ---------------------------------------------------------------------------
// The context object + hook live here (no components) so that editing the
// provider component in SiteProvider.tsx stays Fast-Refresh friendly.
// ---------------------------------------------------------------------------

export interface SiteContextValue {
  profile: Profile
  themes: Theme[]
  activeTheme: Theme
  activeThemeId: string
  setActiveTheme: (id: string) => void

  user: DiscordUser | null
  isAdmin: boolean
  authReady: boolean
  login: () => void
  logout: () => void

  muted: boolean
  toggleMuted: () => void
  cursorOn: boolean
  toggleCursor: () => void

  // Admin actions
  saveProfile: (p: Profile) => void
  upsertTheme: (t: Theme) => void
  deleteTheme: (id: string) => void
}

export const SiteContext = createContext<SiteContextValue | null>(null)

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used within <SiteProvider>')
  return ctx
}

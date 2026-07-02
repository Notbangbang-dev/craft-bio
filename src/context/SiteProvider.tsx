import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { DiscordUser, Profile, Theme } from '../types'
import { BUILTIN_THEMES, DEFAULT_THEME_ID } from '../themes'
import { store } from '../lib/storage'
import { ADMIN_DISCORD_ID } from '../config'
import * as discord from '../lib/discord'
import { SiteContext, type SiteContextValue } from './siteContext'

// ---------------------------------------------------------------------------
// One provider to rule them all: profile data, theme registry, the active
// theme (which paints the whole app via CSS variables), and Discord auth.
// The context object + useSite hook live in ./siteContext.
// ---------------------------------------------------------------------------

function applyThemeVars(theme: Theme) {
  const root = document.documentElement
  const c = theme.colors
  root.style.setProperty('--mc-bg-top', c.bgTop)
  root.style.setProperty('--mc-bg-bottom', c.bgBottom)
  root.style.setProperty('--mc-fog', c.fog)
  root.style.setProperty('--mc-panel', c.panel)
  root.style.setProperty('--mc-panel-2', c.panel2)
  root.style.setProperty('--mc-border-light', c.borderLight)
  root.style.setProperty('--mc-border-dark', c.borderDark)
  root.style.setProperty('--mc-text', c.text)
  root.style.setProperty('--mc-text-dim', c.textDim)
  root.style.setProperty('--mc-accent', c.accent)
  root.style.setProperty('--mc-accent-2', c.accent2)
  root.style.setProperty('--mc-slot', c.slot)
  root.style.setProperty('--mc-particle', c.particle)
  document.body.dataset.kind = theme.kind
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(() => store.loadProfile())
  const [customThemes, setCustomThemes] = useState<Theme[]>(() => store.loadCustomThemes())
  const [activeThemeId, setActiveThemeId] = useState<string>(
    () => store.loadActiveTheme() ?? store.loadProfile().defaultThemeId ?? DEFAULT_THEME_ID,
  )
  const [user, setUser] = useState<DiscordUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [muted, setMuted] = useState<boolean>(() => store.loadMuted())
  const [cursorOn, setCursorOn] = useState<boolean>(() => store.loadCursor())

  const themes = useMemo(
    () => [...BUILTIN_THEMES, ...customThemes],
    [customThemes],
  )

  const activeTheme = useMemo(
    () => themes.find((t) => t.id === activeThemeId) ?? themes[0],
    [themes, activeThemeId],
  )

  // Paint the app whenever the active theme changes.
  useEffect(() => {
    applyThemeVars(activeTheme)
  }, [activeTheme])

  // Resolve Discord auth on first load (captures token from the redirect hash).
  useEffect(() => {
    discord.captureTokenFromHash()
    let alive = true
    discord.fetchMe().then((u) => {
      if (alive) {
        setUser(u)
        setAuthReady(true)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  const isAdmin = user?.id === ADMIN_DISCORD_ID

  const setActiveTheme = useCallback((id: string) => {
    setActiveThemeId(id)
    store.saveActiveTheme(id)
  }, [])

  const saveProfile = useCallback((p: Profile) => {
    setProfile(p)
    store.saveProfile(p)
  }, [])

  const upsertTheme = useCallback((t: Theme) => {
    setCustomThemes((prev) => {
      const next = prev.some((x) => x.id === t.id)
        ? prev.map((x) => (x.id === t.id ? t : x))
        : [...prev, { ...t, custom: true }]
      store.saveCustomThemes(next)
      return next
    })
  }, [])

  const deleteTheme = useCallback(
    (id: string) => {
      setCustomThemes((prev) => {
        const next = prev.filter((x) => x.id !== id)
        store.saveCustomThemes(next)
        return next
      })
      if (activeThemeId === id) setActiveTheme(DEFAULT_THEME_ID)
    },
    [activeThemeId, setActiveTheme],
  )

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      store.saveMuted(!m)
      return !m
    })
  }, [])

  const toggleCursor = useCallback(() => {
    setCursorOn((c) => {
      store.saveCursor(!c)
      return !c
    })
  }, [])

  const value: SiteContextValue = {
    profile,
    themes,
    activeTheme,
    activeThemeId,
    setActiveTheme,
    user,
    isAdmin,
    authReady,
    login: discord.login,
    logout: () => {
      discord.logout()
      setUser(null)
    },
    muted,
    toggleMuted,
    cursorOn,
    toggleCursor,
    saveProfile,
    upsertTheme,
    deleteTheme,
  }

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

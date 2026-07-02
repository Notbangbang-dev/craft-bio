import { STORAGE } from '../config'
import type { Profile, Theme } from '../types'
import { DEFAULT_PROFILE } from '../defaultProfile'

// ---------------------------------------------------------------------------
// Thin, typed wrappers over localStorage. Everything fails soft: a corrupt or
// missing value falls back to sensible defaults instead of throwing.
// ---------------------------------------------------------------------------

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full / disabled — ignore */
  }
}

export const store = {
  loadProfile(): Profile {
    // Merge saved profile over defaults so new fields always exist, deep-merging
    // the nested config objects so a schema addition never leaves them partial.
    const saved = read<Partial<Profile>>(STORAGE.profile, {})
    return {
      ...DEFAULT_PROFILE,
      ...saved,
      integrations: { ...DEFAULT_PROFILE.integrations, ...saved.integrations },
      features: { ...DEFAULT_PROFILE.features, ...saved.features },
      effects: { ...DEFAULT_PROFILE.effects, ...saved.effects },
    }
  },
  saveProfile(p: Profile) {
    write(STORAGE.profile, p)
  },
  resetProfile() {
    localStorage.removeItem(STORAGE.profile)
  },

  loadCustomThemes(): Theme[] {
    return read<Theme[]>(STORAGE.themes, [])
  },
  saveCustomThemes(themes: Theme[]) {
    write(STORAGE.themes, themes)
  },

  loadActiveTheme(): string | null {
    return read<string | null>(STORAGE.activeTheme, null)
  },
  saveActiveTheme(id: string) {
    write(STORAGE.activeTheme, id)
  },

  loadMuted(): boolean {
    return read<boolean>(STORAGE.muted, true)
  },
  saveMuted(muted: boolean) {
    write(STORAGE.muted, muted)
  },

  loadCursor(): boolean {
    return read<boolean>(STORAGE.cursor, true)
  },
  saveCursor(on: boolean) {
    write(STORAGE.cursor, on)
  },

  // View counter: persist a per-browser increment so refreshes feel "live".
  bumpViews(base: number): number {
    const current = read<number>(STORAGE.views, 0)
    const next = current + 1
    write(STORAGE.views, next)
    return base + next
  },
}

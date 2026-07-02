// ---------------------------------------------------------------------------
// Core domain types for craft.bio
// ---------------------------------------------------------------------------

/** Named Minecraft-ish block used for the floating background cubes. */
export type BlockType =
  | 'grass'
  | 'dirt'
  | 'stone'
  | 'cobblestone'
  | 'netherrack'
  | 'diamond_ore'
  | 'gold_ore'
  | 'emerald_ore'
  | 'lapis_ore'
  | 'end_stone'
  | 'purpur'
  | 'obsidian'
  | 'sculk'
  | 'tnt'
  | 'crafting_table'
  | 'glowstone'

/** The "mood" of the background layer. Drives particle behaviour + fog. */
export type BackgroundKind = 'overworld' | 'nether' | 'end' | 'cave' | 'sky'

/** All colours a theme controls. Everything visual is derived from these. */
export interface ThemeColors {
  /** Top of the page gradient. */
  bgTop: string
  /** Bottom of the page gradient. */
  bgBottom: string
  /** Atmospheric fog colour layered over the background. */
  fog: string
  /** GUI panel fill (top of its subtle gradient). */
  panel: string
  /** GUI panel fill (bottom). */
  panel2: string
  /** Beveled panel highlight (top-left edge). */
  borderLight: string
  /** Beveled panel shadow (bottom-right edge). */
  borderDark: string
  /** Primary readable text. */
  text: string
  /** Muted / secondary text. */
  textDim: string
  /** Signature accent (buttons, glows, links). */
  accent: string
  /** Secondary accent for gradients + enchant shimmer. */
  accent2: string
  /** Hotbar / inventory slot fill. */
  slot: string
  /** Falling particle colour. */
  particle: string
}

/** A complete, self-contained visual theme. */
export interface Theme {
  id: string
  name: string
  /** Emoji or short glyph shown in the theme picker. */
  icon: string
  kind: BackgroundKind
  colors: ThemeColors
  /** Palette of blocks that float around in the background. */
  blocks: BlockType[]
  /** Optional audio track (URL) played when the visitor enters. */
  music?: string
  /** Marks themes created in the admin panel (persisted to localStorage). */
  custom?: boolean
}

/** A single link rendered as a hotbar slot. */
export interface SocialLink {
  id: string
  /** Icon key (see ICONS in components/icons.tsx) or an emoji. */
  icon: string
  label: string
  url: string
}

/** IDs/handles the live-data integrations need. */
export interface Integrations {
  /** Discord user id for Lanyard presence + Spotify. */
  discordId: string
  /** GitHub username/org for public stats. */
  githubUser: string
  /** Minecraft username for the skin render. */
  mcUsername: string
  /** Abacus counter namespace (3-64 chars: A-Za-z0-9_-.). */
  counterNamespace: string
  /** Abacus counter key. */
  counterKey: string
}

/** Toggles for every optional widget/effect. */
export interface Features {
  presence: boolean
  spotify: boolean
  github: boolean
  /** Use the live Abacus counter instead of a per-browser localStorage count. */
  liveViews: boolean
  particles: boolean
  music: boolean
  splash: boolean
}

/** Tunables for the background block field. */
export interface Effects {
  blockCount: number
  dustCount: number
  spinBlocks: boolean
}

/** Everything about the person the site is about. Fully admin-editable. */
export interface Profile {
  displayName: string
  username: string
  /** Avatar/skin image URL (mc-heads body render by default). */
  avatar: string
  /** Rotating typewriter lines under the name. */
  taglines: string[]
  location: string
  badges: string[]
  links: SocialLink[]
  /** Which theme id is shown to visitors by default. */
  defaultThemeId: string
  /** Base number added to the view count. */
  baseViews: number

  // ---- site chrome (all editable) ----
  splashTitle: string
  splashSubtitle: string
  splashHint: string
  footer: string

  integrations: Integrations
  features: Features
  effects: Effects
}

// ---- live data shapes -----------------------------------------------------

export interface SpotifyNow {
  song: string
  artist: string
  album: string
  albumArt: string
  /** epoch ms */
  start: number
  /** epoch ms */
  end: number
}

export type DiscordStatus = 'online' | 'idle' | 'dnd' | 'offline'

export interface Presence {
  status: DiscordStatus
  spotify: SpotifyNow | null
  /** Non-Spotify activity name, if any (games etc.). */
  activity: string | null
  onMobile: boolean
}

export interface GithubStats {
  repos: number
  followers: number
  following: number
  stars: number
}

/** The signed-in Discord user (identify scope only). */
export interface DiscordUser {
  id: string
  username: string
  global_name: string | null
  avatar: string | null
}

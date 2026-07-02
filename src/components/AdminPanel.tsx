import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSite } from '../context/siteContext'
import { avatarUrl, isConfigured } from '../lib/discord'
import { ADMIN_DISCORD_ID } from '../config'
import { ALL_BLOCKS } from '../blocks'
import { KNOWN_ICONS } from './icons'
import type {
  BackgroundKind,
  BlockType,
  Features,
  Profile,
  SocialLink,
  Theme,
  ThemeColors,
} from '../types'

type Tab = 'profile' | 'links' | 'site' | 'stats' | 'effects' | 'themes' | 'export'

const TABS: Tab[] = ['profile', 'links', 'site', 'stats', 'effects', 'themes', 'export']

const COLOR_FIELDS: { key: keyof ThemeColors; label: string }[] = [
  { key: 'bgTop', label: 'Sky (top)' },
  { key: 'bgBottom', label: 'Sky (bottom)' },
  { key: 'fog', label: 'Fog (rgba ok)' },
  { key: 'panel', label: 'Panel top' },
  { key: 'panel2', label: 'Panel bottom' },
  { key: 'borderLight', label: 'Bevel light' },
  { key: 'borderDark', label: 'Bevel dark' },
  { key: 'text', label: 'Text' },
  { key: 'textDim', label: 'Text dim' },
  { key: 'accent', label: 'Accent' },
  { key: 'accent2', label: 'Accent 2' },
  { key: 'slot', label: 'Slot' },
  { key: 'particle', label: 'Particle' },
]

const KINDS: BackgroundKind[] = ['overworld', 'nether', 'end', 'cave', 'sky']

const FEATURES: { key: keyof Features; label: string }[] = [
  { key: 'splash', label: 'Splash gate' },
  { key: 'presence', label: 'Discord status' },
  { key: 'spotify', label: 'Spotify' },
  { key: 'github', label: 'GitHub stats' },
  { key: 'liveViews', label: 'Live views' },
  { key: 'particles', label: 'Particles' },
  { key: 'music', label: 'Music' },
]

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className={`mc-btn small ${on ? 'accent' : ''}`} onClick={() => onChange(!on)}>
      {label}: {on ? 'ON' : 'OFF'}
    </button>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const isHex = /^#[0-9a-fA-F]{6}$/.test(value)
  return (
    <div className="field">
      <label>{label}</label>
      <div className="colorrow">
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
        <input
          type="color"
          value={isHex ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const site = useSite()
  const { user, isAdmin, authReady } = site

  if (!authReady) {
    return (
      <Overlay onClose={onClose}>
        <div className="mc-panel gate">
          <h2>Connecting…</h2>
          <p>Checking your Discord session.</p>
        </div>
      </Overlay>
    )
  }

  if (!user) {
    return (
      <Overlay onClose={onClose}>
        <div className="mc-panel gate">
          <h2>⚙ Admin Login</h2>
          {isConfigured() ? (
            <>
              <p>Only the owner can edit this page. Sign in with Discord to continue.</p>
              <button className="discordbtn" onClick={site.login}>
                <DiscordGlyph /> LOGIN WITH DISCORD
              </button>
            </>
          ) : (
            <p className="denied">
              Discord login isn't configured yet. Set VITE_DISCORD_CLIENT_ID in your .env file
              (see README) and reload.
            </p>
          )}
          <button className="mc-btn small" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </Overlay>
    )
  }

  if (!isAdmin) {
    return (
      <Overlay onClose={onClose}>
        <div className="mc-panel gate">
          <h2>Access Denied</h2>
          <img src={avatarUrl(user)} alt="" style={{ width: 48, height: 48, border: '3px solid #000' }} />
          <p>
            Signed in as <b>{user.global_name ?? user.username}</b>, but this isn't the owner
            account.
          </p>
          <p className="denied">this ID: {user.id}</p>
          <div className="row">
            <button className="mc-btn small" onClick={site.logout}>
              LOG OUT
            </button>
            <button className="mc-btn small" onClick={onClose}>
              CLOSE
            </button>
          </div>
        </div>
      </Overlay>
    )
  }

  return <AdminEditor onClose={onClose} />
}

function AdminEditor({ onClose }: { onClose: () => void }) {
  const site = useSite()
  const { user, profile } = site
  const [tab, setTab] = useState<Tab>('profile')
  const [editingId, setEditingId] = useState<string>(site.activeTheme.id)

  // ---- live profile patching (everything applies + saves instantly) ----
  const patch = (partial: Partial<Profile>) => site.saveProfile({ ...profile, ...partial })
  const patchIntegration = (k: keyof Profile['integrations'], v: string) =>
    site.saveProfile({ ...profile, integrations: { ...profile.integrations, [k]: v } })
  const patchFeature = (k: keyof Features, v: boolean) =>
    site.saveProfile({ ...profile, features: { ...profile.features, [k]: v } })
  const patchEffect = (k: keyof Profile['effects'], v: number | boolean) =>
    site.saveProfile({ ...profile, effects: { ...profile.effects, [k]: v } })

  function resetAll() {
    if (!confirm('Reset ALL profile + theme edits on this browser back to defaults?')) return
    store_reset()
    location.reload()
  }

  // ---- theme editing (live) ----
  const editing = site.themes.find((t) => t.id === editingId) ?? site.activeTheme
  const editingIsCustom = Boolean(editing.custom)
  const customThemes = useMemo(() => site.themes.filter((t) => t.custom), [site.themes])

  function patchThemeColor(key: keyof ThemeColors, value: string) {
    if (!editingIsCustom) return
    const next: Theme = { ...editing, colors: { ...editing.colors, [key]: value } }
    site.upsertTheme(next)
    site.setActiveTheme(next.id)
  }
  function patchTheme(partial: Partial<Theme>) {
    if (!editingIsCustom) return
    const next: Theme = { ...editing, ...partial }
    site.upsertTheme(next)
    site.setActiveTheme(next.id)
  }
  function toggleBlock(b: BlockType) {
    if (!editingIsCustom) return
    const has = editing.blocks.includes(b)
    patchTheme({ blocks: has ? editing.blocks.filter((x) => x !== b) : [...editing.blocks, b] })
  }
  function newTheme(from: Theme) {
    const id = `custom_${Date.now().toString(36)}`
    const t: Theme = {
      ...from,
      id,
      name: from.custom ? `${from.name} copy` : `${from.name} (mine)`,
      custom: true,
    }
    site.upsertTheme(t)
    site.setActiveTheme(id)
    setEditingId(id)
  }
  function deleteEditing() {
    if (!editingIsCustom) return
    if (!confirm(`Delete theme "${editing.name}"?`)) return
    site.deleteTheme(editing.id)
    setEditingId('overworld')
  }

  return (
    <Overlay onClose={onClose}>
      <motion.div
        className="mc-panel admin"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
      >
        <div className="admin__head">
          <h2>⚙ CONTROL PANEL</h2>
          <span className="who">
            {user && <img src={avatarUrl(user)} alt="" />}
            {user?.global_name ?? user?.username}
          </span>
        </div>

        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`mc-btn small ${tab === t ? 'accent' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
          <div className="spacer" />
          <button className="mc-btn small" onClick={site.logout}>
            LOG OUT
          </button>
          <button className="mc-btn small danger" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* ---------------------------------------------------- PROFILE */}
        {tab === 'profile' && (
          <div>
            <div className="grid2">
              <Text label="Display name" value={profile.displayName} onChange={(v) => patch({ displayName: v })} />
              <Text label="Username (handle)" value={profile.username} onChange={(v) => patch({ username: v })} />
            </div>
            <Text label="Avatar / skin image URL" value={profile.avatar} onChange={(v) => patch({ avatar: v })} url />
            <div className="grid2">
              <Text label="Location" value={profile.location} onChange={(v) => patch({ location: v })} />
              <Num label="Base view count" value={profile.baseViews} onChange={(v) => patch({ baseViews: v })} />
            </div>
            <Text
              label="Badges (comma separated)"
              value={profile.badges.join(', ')}
              onChange={(v) => patch({ badges: v.split(',').map((s) => s.trim()).filter(Boolean) })}
            />
            <Area
              label="Taglines (one per line — they typewriter in order)"
              value={profile.taglines.join('\n')}
              onChange={(v) => patch({ taglines: v.split('\n') })}
            />
            <div className="field">
              <label>Default theme for visitors</label>
              <select value={profile.defaultThemeId} onChange={(e) => patch({ defaultThemeId: e.target.value })}>
                {site.themes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="hint">
              Everything applies + saves instantly to this browser. To publish for all visitors,
              use EXPORT and paste into your source, then redeploy.
            </p>
            <button className="mc-btn small danger" onClick={resetAll}>
              RESET ALL TO DEFAULTS
            </button>
          </div>
        )}

        {/* ------------------------------------------------------- LINKS */}
        {tab === 'links' && (
          <LinksEditor links={profile.links} onChange={(links) => patch({ links })} />
        )}

        {/* -------------------------------------------------------- SITE */}
        {tab === 'site' && (
          <div>
            <Text label="Splash title (text after first dot is accented)" value={profile.splashTitle} onChange={(v) => patch({ splashTitle: v })} />
            <Text label="Splash subtitle" value={profile.splashSubtitle} onChange={(v) => patch({ splashSubtitle: v })} />
            <Text label="Splash hint" value={profile.splashHint} onChange={(v) => patch({ splashHint: v })} />
            <Text label="Footer text" value={profile.footer} onChange={(v) => patch({ footer: v })} />
            <p className="hint">Tip: toggle the splash gate on/off in the EFFECTS tab.</p>
          </div>
        )}

        {/* ------------------------------------------------------- STATS */}
        {tab === 'stats' && (
          <div>
            <Text
              label="Discord user ID (Lanyard presence + Spotify)"
              value={profile.integrations.discordId}
              onChange={(v) => patchIntegration('discordId', v)}
            />
            <p className="hint">
              Presence only shows if that account has joined the Lanyard Discord →
              <b> discord.gg/lanyard</b>. Connect Spotify in Discord settings for now-playing.
            </p>
            <Text
              label="GitHub username / org"
              value={profile.integrations.githubUser}
              onChange={(v) => patchIntegration('githubUser', v)}
            />
            <div className="row" style={{ alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Text
                  label="Minecraft username (skin render)"
                  value={profile.integrations.mcUsername}
                  onChange={(v) => patchIntegration('mcUsername', v)}
                />
              </div>
              <button
                className="mc-btn small"
                onClick={() =>
                  patch({ avatar: `https://mc-heads.net/body/${profile.integrations.mcUsername}` })
                }
              >
                USE AS AVATAR
              </button>
            </div>
            <div className="grid2">
              <Text
                label="Counter namespace"
                value={profile.integrations.counterNamespace}
                onChange={(v) => patchIntegration('counterNamespace', v)}
              />
              <Text
                label="Counter key"
                value={profile.integrations.counterKey}
                onChange={(v) => patchIntegration('counterKey', v)}
              />
            </div>
            <p className="hint">
              Counter namespace/key must be 3-64 chars of A-Z a-z 0-9 _ - . (Abacus).
            </p>
          </div>
        )}

        {/* ----------------------------------------------------- EFFECTS */}
        {tab === 'effects' && (
          <div>
            <div className="field">
              <label>Widgets & features</label>
              <div className="row">
                {FEATURES.map((f) => (
                  <Toggle
                    key={f.key}
                    label={f.label}
                    on={profile.features[f.key]}
                    onChange={(v) => patchFeature(f.key, v)}
                  />
                ))}
              </div>
            </div>
            <div className="grid2">
              <Num label="Floating block count" value={profile.effects.blockCount} onChange={(v) => patchEffect('blockCount', v)} />
              <Num label="Dust particle count" value={profile.effects.dustCount} onChange={(v) => patchEffect('dustCount', v)} />
            </div>
            <div className="field">
              <label>Block spin</label>
              <div className="row">
                <Toggle label="Spin blocks" on={profile.effects.spinBlocks} onChange={(v) => patchEffect('spinBlocks', v)} />
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------ THEMES */}
        {tab === 'themes' && (
          <div>
            <div className="row" style={{ marginBottom: 12 }}>
              <div className="field" style={{ marginBottom: 0, flex: 1 }}>
                <label>Editing theme</label>
                <select value={editingId} onChange={(e) => setEditingId(e.target.value)}>
                  <optgroup label="Built-in (clone to edit)">
                    {site.themes
                      .filter((t) => !t.custom)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.icon} {t.name}
                        </option>
                      ))}
                  </optgroup>
                  {customThemes.length > 0 && (
                    <optgroup label="Custom (yours)">
                      {customThemes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.icon} {t.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              <button className="mc-btn small accent" onClick={() => newTheme(editing)}>
                {editingIsCustom ? 'DUPLICATE' : 'CLONE + EDIT'}
              </button>
              {editingIsCustom && (
                <button className="mc-btn small danger" onClick={deleteEditing}>
                  DELETE
                </button>
              )}
            </div>

            {!editingIsCustom && (
              <p className="hint" style={{ marginBottom: 12 }}>
                Built-in themes are locked. Hit <b>CLONE + EDIT</b> to make an editable copy —
                changes preview live behind this panel.
              </p>
            )}

            <div className="grid2">
              <Text label="Name" value={editing.name} disabled={!editingIsCustom} onChange={(v) => patchTheme({ name: v })} />
              <div className="grid2">
                <Text label="Icon" value={editing.icon} disabled={!editingIsCustom} onChange={(v) => patchTheme({ icon: v })} />
                <div className="field">
                  <label>Background</label>
                  <select
                    value={editing.kind}
                    disabled={!editingIsCustom}
                    onChange={(e) => patchTheme({ kind: e.target.value as BackgroundKind })}
                  >
                    {KINDS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Text
              label="Music URL (optional — plays on enter)"
              value={editing.music ?? ''}
              disabled={!editingIsCustom}
              url
              onChange={(v) => patchTheme({ music: v || undefined })}
            />

            <div className="field">
              <label>Floating blocks</label>
              <div className="row">
                {ALL_BLOCKS.map((b) => (
                  <button
                    key={b}
                    className={`mc-btn small ${editing.blocks.includes(b) ? 'accent' : ''}`}
                    disabled={!editingIsCustom}
                    onClick={() => toggleBlock(b)}
                  >
                    {b.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid2">
              {COLOR_FIELDS.map((f) => (
                <ColorField
                  key={f.key}
                  label={f.label}
                  value={editing.colors[f.key]}
                  onChange={(v) => patchThemeColor(f.key, v)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------ EXPORT */}
        {tab === 'export' && <ExportTab themes={customThemes} profile={profile} />}
      </motion.div>
    </Overlay>
  )
}

// small storage reset (kept local to avoid widening the storage API surface)
function store_reset() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith('craftbio.'))
    .forEach((k) => localStorage.removeItem(k))
}

// ---- reusable inputs ------------------------------------------------------
function Text({
  label,
  value,
  onChange,
  disabled,
  url,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  url?: boolean
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={url ? 'url' : 'text'} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
function Num({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </div>
  )
}
function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

// ---- links sub-editor -----------------------------------------------------
function LinksEditor({ links, onChange }: { links: SocialLink[]; onChange: (l: SocialLink[]) => void }) {
  const update = (id: string, patch: Partial<SocialLink>) =>
    onChange(links.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  const remove = (id: string) => onChange(links.filter((l) => l.id !== id))
  const add = () =>
    onChange([...links, { id: `l${Date.now().toString(36)}`, icon: 'globe', label: 'Link', url: 'https://' }])
  const move = (id: string, dir: -1 | 1) => {
    const i = links.findIndex((l) => l.id === id)
    const j = i + dir
    if (j < 0 || j >= links.length) return
    const copy = [...links]
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    onChange(copy)
  }

  return (
    <div>
      <p className="hint" style={{ marginBottom: 10 }}>
        Icon can be a known key ({KNOWN_ICONS.join(', ')}) or any emoji.
      </p>
      {links.map((l) => (
        <div className="linkedit" key={l.id}>
          <input type="text" value={l.icon} placeholder="icon" onChange={(e) => update(l.id, { icon: e.target.value })} />
          <input type="text" value={l.label} placeholder="label" onChange={(e) => update(l.id, { label: e.target.value })} />
          <input type="url" value={l.url} placeholder="https://" onChange={(e) => update(l.id, { url: e.target.value })} />
          <div className="row">
            <button className="mc-btn small" onClick={() => move(l.id, -1)}>
              ▲
            </button>
            <button className="mc-btn small" onClick={() => move(l.id, 1)}>
              ▼
            </button>
            <button className="mc-btn small danger" onClick={() => remove(l.id)}>
              ✕
            </button>
          </div>
        </div>
      ))}
      <button className="mc-btn" style={{ marginTop: 12 }} onClick={add}>
        + ADD LINK
      </button>
    </div>
  )
}

// ---- export tab -----------------------------------------------------------
function ExportTab({ themes, profile }: { themes: Theme[]; profile: Profile }) {
  const [copied, setCopied] = useState('')

  const themeCode = useMemo(() => {
    if (themes.length === 0) return '// No custom themes yet. Create one in the THEMES tab.'
    const bodies = themes
      .map((t) => {
        const { custom, ...rest } = t
        void custom
        return JSON.stringify(rest, null, 2)
      })
      .join(',\n')
    return `// Paste these into BUILTIN_THEMES in src/themes.ts\n${bodies},`
  }, [themes])

  const profileCode = useMemo(() => JSON.stringify(profile, null, 2), [profile])

  function copy(text: string, which: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(which)
      setTimeout(() => setCopied(''), 1500)
    })
  }

  return (
    <div>
      <p className="hint">
        localStorage keeps your edits on this browser only. To make them the real, published
        defaults for every visitor, copy the code below into your source and redeploy.
      </p>
      <div className="field">
        <label>Custom themes → src/themes.ts</label>
        <div className="codebox">{themeCode}</div>
        <button className="mc-btn small accent" onClick={() => copy(themeCode, 'themes')}>
          {copied === 'themes' ? 'COPIED!' : 'COPY THEMES .ts'}
        </button>
      </div>
      <div className="field">
        <label>Profile → DEFAULT_PROFILE in src/defaultProfile.ts</label>
        <div className="codebox">{profileCode}</div>
        <button className="mc-btn small accent" onClick={() => copy(profileCode, 'profile')}>
          {copied === 'profile' ? 'COPIED!' : 'COPY PROFILE JSON'}
        </button>
      </div>
      <p className="hint">
        Owner is locked to Discord ID <b>{ADMIN_DISCORD_ID}</b> in src/config.ts.
      </p>
    </div>
  )
}

// ---- shared overlay -------------------------------------------------------
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {children}
    </div>
  )
}

function DiscordGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.3 4.4A19 19 0 0 0 15.5 3l-.24.5a14 14 0 0 1 4.2 1.4 13.5 13.5 0 0 0-11.9 0A14 14 0 0 1 11.7 3.5L11.5 3A19 19 0 0 0 6.7 4.4C3.6 9 2.8 13.5 3.2 17.9A19 19 0 0 0 9 20.8l.6-1a12 12 0 0 1-2-1l.5-.4a13.6 13.6 0 0 0 11.6 0l.5.4a12 12 0 0 1-2 1l.6 1a19 19 0 0 0 5.8-2.9c.5-5.1-.8-9.6-3.9-13.5ZM9.5 15.3c-1 0-1.9-.9-1.9-2s.8-2 1.9-2 1.9.9 1.9 2-.8 2-1.9 2Zm5 0c-1 0-1.9-.9-1.9-2s.8-2 1.9-2 1.9.9 1.9 2-.8 2-1.9 2Z" />
    </svg>
  )
}

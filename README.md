# craft.bio ⛏️

A **bio page**, Minecraft-themed, built with **React + TypeScript + Vite**.

Splash "click to enter" gate · a living field of **real procedurally-textured Minecraft
blocks** (solid 6-face cubes, no copyrighted assets) · full-body skin render · enchanted
username · typewriter bio · **live Discord presence + Spotify** · **live GitHub stats** ·
**real cross-visitor view counter** · hotbar links · pixel cursor with block-break
particles · live theme switching · and an **admin panel gated to your Discord account**
where you can edit **everything** and design your own themes.

Live site: **https://notbangbang-dev.github.io/craft-bio/**

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5188
npm run build    # type-check + production build into dist/
```

## Live data (all toggleable in admin → EFFECTS)

| Widget | Source | Notes |
| --- | --- | --- |
| Discord status | [Lanyard](https://github.com/Phineas/lanyard) `api.lanyard.rest` | **You must join [discord.gg/lanyard](https://discord.gg/lanyard)** so the bot can see your presence, or it shows "Offline". |
| Spotify now-playing | Lanyard | Connect Spotify in Discord settings + "display as status". Shows song, art, live progress. |
| GitHub stats | `api.github.com` | repos / followers / stars for your username. Cached 30 min (60 req/hr unauth limit). |
| View counter | [Abacus](https://abacus.jasoncameron.dev) | Real cross-visitor count. Falls back to a local count if unreachable. |
| Skin render | [mc-heads.net](https://mc-heads.net) | Full-body render from your MC username; pixel-fallback face if offline. |

All integration IDs (Discord id, GitHub user, MC username, counter namespace/key) are
editable in **admin → STATS**.

## Admin — edit everything

Click ⚙️ (top-right) and log in with Discord. Editing is locked to **one Discord id**
(`ADMIN_DISCORD_ID` in [`src/config.ts`](src/config.ts) — currently `1226241151065919548`).
Anyone else who logs in sees "Access Denied". Every change applies + saves **instantly**
(to `localStorage`). Tabs:

- **Profile** — name, handle, avatar, location, badges, taglines, default theme, base views.
- **Links** — add / remove / reorder hotbar links (icon = a built-in key or any emoji).
- **Site** — splash title/subtitle/hint, footer text.
- **Stats** — Discord id, GitHub user, MC username (+ "use as avatar"), counter namespace/key.
- **Effects** — toggle every widget (splash, presence, spotify, github, live views, particles,
  music), set floating-block count, dust count, block spin.
- **Themes** — clone a built-in theme and live-edit colors, background mood, blocks, music.
- **Export** — copy your themes/profile as code to bake into the source (the "make it TS" loop).

### Publishing your edits

`localStorage` edits live only in your browser. To make them the real defaults for every
visitor: **Export** tab → paste into [`src/themes.ts`](src/themes.ts) /
[`src/defaultProfile.ts`](src/defaultProfile.ts) → commit → run `npm run deploy`.

## Discord login setup (one-time)

Admin login uses Discord OAuth2 **implicit flow** (client-side, no secret).

1. [Discord Developer Portal](https://discord.com/developers/applications) → **New Application** → **OAuth2** → copy the **Client ID**.
2. **OAuth2 → Redirects**, add both (exact match, trailing slash included):
   - `http://localhost:5188/`
   - `https://notbangbang-dev.github.io/craft-bio/`
3. **Local:** copy `.env.example` → `.env`, set `VITE_DISCORD_CLIENT_ID=...`, restart dev.
4. **Live site:** set it as a repo Variable so the build picks it up:
   ```bash
   gh variable set VITE_DISCORD_CLIENT_ID --repo Notbangbang-dev/craft-bio --body "<client-id>"
   ```
   Then push (or re-run the workflow). Until then the ⚙ panel says "not configured" — the
   rest of the site still works.

## Deploying (GitHub Pages)

The site deploys to the **`gh-pages` branch** (Vite `base` is `/craft-bio/` for the build only):

```bash
npm run deploy      # builds, then pushes dist/ to the gh-pages branch
```

Pages is configured to serve that branch, so the live site updates a minute or two later at
https://notbangbang-dev.github.io/craft-bio/ .

> Prefer auto-deploy on every push? Grant the workflow scope once
> (`gh auth refresh -h github.com -s workflow`), add a GitHub Actions Pages workflow, and
> switch Settings → Pages → Source to "GitHub Actions".

## Project map

```
src/
  config.ts            admin id, client id, storage keys
  types.ts             Theme / Profile / Integrations / Features / live-data types
  themes.ts            built-in themes (paste exported ones here)
  defaultProfile.ts    factory-default profile + integration IDs + feature toggles
  textures.ts          procedural 16x16 canvas block textures (grass, ores, sculk, ...)
  blocks.ts            block list for the admin picker
  lib/
    discord.ts         OAuth2 implicit flow + /users/@me
    lanyard.ts         live Discord presence + Spotify
    github.ts          cached public GitHub stats
    counter.ts         Abacus hit counter
    storage.ts         typed localStorage (deep-merges config)
  hooks/useStats.ts    usePresence / useGithubStats / useViews
  context/
    siteContext.ts     context + useSite hook
    SiteProvider.tsx   global state: theme, profile, auth
  components/
    Splash · Background · Cursor · Avatar · Stats · ProfileCard
    Typewriter · Dock · icons · AdminPanel
```

import type { BlockType } from './types'

// ---------------------------------------------------------------------------
// Procedural 16x16 Minecraft-style block textures, drawn on a <canvas> and
// cached as data URLs. No copyrighted assets — every texture is generated from
// per-block palettes + deterministic noise, so it looks authentically blocky
// and never flickers between renders.
// ---------------------------------------------------------------------------

const SIZE = 16
const cache = new Map<string, string>()

// Deterministic PRNG so a given block+face always looks identical.
function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function seedFrom(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

type Rng = () => number
const pick = <T,>(rng: Rng, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)]

// palettes -----------------------------------------------------------------
const P = {
  grass: ['#5a8f3c', '#6aa84f', '#7cbd56', '#548339', '#71b04d', '#4e7d38'],
  dirt: ['#79572f', '#8b6d4a', '#6b4f2f', '#96714a', '#5f4526', '#846035'],
  stone: ['#7d7d7d', '#8a8a8a', '#949494', '#6f6f6f', '#828282', '#767676'],
  netherrack: ['#6e2b2b', '#7a2f2f', '#5c2222', '#4a1b1b', '#832f2f', '#642626'],
  endstone: ['#dad6a0', '#e0dcac', '#c9c58e', '#c1bd86', '#e6e2b6', '#d0cc96'],
  purpur: ['#a678a6', '#b184b1', '#8a5f8a', '#9a6f9a', '#744f74', '#a074a0'],
  obsidian: ['#150c26', '#1c1030', '#241a3a', '#0e0819', '#2a1f45', '#191030'],
  sculk: ['#0a1e21', '#0f2a2e', '#08181b', '#123236', '#0c2427'],
  glowstone: ['#e8c15a', '#f7d774', '#d8ab3f', '#fff0a8', '#c99a2f', '#f0cf6a'],
  tnt: ['#c0392b', '#d24b3a', '#a92f22', '#b83527'],
  wood: ['#8a5a2f', '#9a6b3f', '#734a26', '#a5794a', '#7d5228'],
} as const

const ORE = {
  diamond: ['#57f0e0', '#8ff7ea', '#3fd8c8'],
  gold: ['#f7cf3f', '#ffe17a', '#d8a92f'],
  emerald: ['#2fe07a', '#5ff09a', '#22b05f'],
  lapis: ['#2f5fe0', '#4f7ff0', '#2247b0'],
} as const

// low-level pixel helpers ---------------------------------------------------
function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return
  ctx.fillStyle = color
  ctx.fillRect(x, y, 1, 1)
}
function noiseFill(ctx: CanvasRenderingContext2D, rng: Rng, palette: readonly string[]) {
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) px(ctx, x, y, pick(rng, palette))
}
function oreClusters(ctx: CanvasRenderingContext2D, rng: Rng, colors: readonly string[]) {
  const shape = [
    [0, 0], [1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [2, 1], [1, 2],
  ]
  const clusters = 3 + Math.floor(rng() * 3)
  for (let i = 0; i < clusters; i++) {
    const cx = 2 + Math.floor(rng() * 11)
    const cy = 2 + Math.floor(rng() * 11)
    const n = 3 + Math.floor(rng() * 4)
    for (let j = 0; j < n; j++) {
      const [dx, dy] = shape[Math.floor(rng() * shape.length)]
      px(ctx, cx + dx, cy + dy, pick(rng, colors))
    }
  }
}
function sparkle(ctx: CanvasRenderingContext2D, rng: Rng, color: string, count: number) {
  for (let i = 0; i < count; i++) px(ctx, Math.floor(rng() * SIZE), Math.floor(rng() * SIZE), color)
}

// per-block drawing ---------------------------------------------------------
function draw(block: BlockType, face: 'top' | 'side', ctx: CanvasRenderingContext2D, rng: Rng) {
  switch (block) {
    case 'grass':
      if (face === 'top') {
        noiseFill(ctx, rng, P.grass)
      } else {
        noiseFill(ctx, rng, P.dirt)
        for (let x = 0; x < SIZE; x++) {
          const h = 3 + Math.floor(rng() * 3)
          for (let y = 0; y < h; y++) px(ctx, x, y, pick(rng, P.grass))
          if (rng() < 0.4) px(ctx, x, h, pick(rng, P.grass)) // jagged fringe
        }
      }
      return
    case 'dirt':
      noiseFill(ctx, rng, P.dirt)
      return
    case 'stone':
      noiseFill(ctx, rng, P.stone)
      return
    case 'cobblestone': {
      noiseFill(ctx, rng, P.stone)
      // mortar lines: darker grid dividing a few "stones"
      const dark = '#4a4a4a'
      for (let i = 0; i < SIZE; i++) {
        px(ctx, i, 0, dark)
        px(ctx, 0, i, dark)
        px(ctx, i, 8 + (i % 2), dark)
        px(ctx, 7 + (i % 3 === 0 ? 1 : 0), i, dark)
      }
      return
    }
    case 'netherrack':
      noiseFill(ctx, rng, P.netherrack)
      for (let x = 0; x < SIZE; x++) if (rng() < 0.25) px(ctx, x, Math.floor(rng() * SIZE), '#3a1414')
      return
    case 'end_stone':
      noiseFill(ctx, rng, P.endstone)
      sparkle(ctx, rng, '#b0ac78', 10)
      return
    case 'purpur':
      noiseFill(ctx, rng, P.purpur)
      sparkle(ctx, rng, '#c9a8c9', 12)
      return
    case 'obsidian':
      noiseFill(ctx, rng, P.obsidian)
      sparkle(ctx, rng, '#6b4fa0', 8)
      return
    case 'sculk':
      noiseFill(ctx, rng, P.sculk)
      sparkle(ctx, rng, '#1fd3c0', 10)
      sparkle(ctx, rng, '#0d6b63', 14)
      return
    case 'glowstone':
      noiseFill(ctx, rng, P.glowstone)
      sparkle(ctx, rng, '#fff8d0', 16)
      return
    case 'diamond_ore':
      noiseFill(ctx, rng, P.stone)
      oreClusters(ctx, rng, ORE.diamond)
      return
    case 'gold_ore':
      noiseFill(ctx, rng, P.stone)
      oreClusters(ctx, rng, ORE.gold)
      return
    case 'emerald_ore':
      noiseFill(ctx, rng, P.stone)
      oreClusters(ctx, rng, ORE.emerald)
      return
    case 'lapis_ore':
      noiseFill(ctx, rng, P.stone)
      oreClusters(ctx, rng, ORE.lapis)
      return
    case 'tnt':
      if (face === 'top') {
        noiseFill(ctx, rng, P.tnt)
        // fuse dot in the middle
        for (let y = 6; y < 10; y++) for (let x = 6; x < 10; x++) px(ctx, x, y, '#3a2a1a')
      } else {
        noiseFill(ctx, rng, P.tnt)
        // white "TNT" label band
        for (let x = 0; x < SIZE; x++) for (let y = 6; y < 10; y++) px(ctx, x, y, rng() < 0.15 ? '#e8e8e8' : '#f4f4f4')
      }
      return
    case 'crafting_table':
      noiseFill(ctx, rng, P.wood)
      // plank grooves + a darker grid for the tabletop feel
      for (let i = 0; i < SIZE; i++) {
        px(ctx, i, 0, '#5a3d1e')
        px(ctx, 0, i, '#5a3d1e')
        if (face === 'top') {
          px(ctx, i, 4, '#5a3d1e')
          px(ctx, 8, i, '#5a3d1e')
        }
      }
      return
    default:
      noiseFill(ctx, rng, P.stone)
  }
}

/** Get (and cache) a data-URL texture for a block face. Browser-only. */
export function blockTexture(block: BlockType, face: 'top' | 'side'): string {
  const key = `${block}:${face}`
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  const rng = mulberry32(seedFrom(key))
  draw(block, face, ctx, rng)
  const url = canvas.toDataURL()
  cache.set(key, url)
  return url
}

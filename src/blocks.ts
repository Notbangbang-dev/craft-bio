import type { BlockType } from './types'

// ---------------------------------------------------------------------------
// Face colours for the isometric CSS cubes. Each block gets a bright top,
// a mid-tone left face and a dark right face. `specks` paints ore flecks.
// ---------------------------------------------------------------------------

export interface BlockFaces {
  top: string
  left: string
  right: string
  /** Optional ore fleck colour, sprinkled across the faces. */
  specks?: string
}

export const BLOCK_FACES: Record<BlockType, BlockFaces> = {
  grass: { top: '#7cbd56', left: '#6b4f2f', right: '#57411f' },
  dirt: { top: '#96714a', left: '#6b4f2f', right: '#57411f' },
  stone: { top: '#a4a4a4', left: '#828282', right: '#6c6c6c' },
  cobblestone: { top: '#9b9b9b', left: '#787878', right: '#616161' },
  netherrack: { top: '#7a2f2f', left: '#5c2222', right: '#471919' },
  diamond_ore: { top: '#a4a4a4', left: '#828282', right: '#6c6c6c', specks: '#3ff0e0' },
  gold_ore: { top: '#a4a4a4', left: '#828282', right: '#6c6c6c', specks: '#ffcf3f' },
  emerald_ore: { top: '#a4a4a4', left: '#828282', right: '#6c6c6c', specks: '#2fe07a' },
  lapis_ore: { top: '#a4a4a4', left: '#828282', right: '#6c6c6c', specks: '#2f6fe0' },
  end_stone: { top: '#e0dcac', left: '#c1bd86', right: '#a8a46f' },
  purpur: { top: '#b184b1', left: '#8a5f8a', right: '#744f74' },
  obsidian: { top: '#241a3a', left: '#160f28', right: '#0e0819', specks: '#6b4fa0' },
  sculk: { top: '#0f2a2e', left: '#0a1e21', right: '#071518', specks: '#1fd3c0' },
  tnt: { top: '#d23b30', left: '#b02c22', right: '#8f231b' },
  crafting_table: { top: '#9a6b3f', left: '#6b4a2c', right: '#553a22' },
  glowstone: { top: '#f7d774', left: '#d8ab3f', right: '#b98a2c', specks: '#fff3b0' },
}

export const ALL_BLOCKS: BlockType[] = Object.keys(BLOCK_FACES) as BlockType[]

import { useMemo } from 'react'
import { useSite } from '../context/siteContext'
import { blockTexture } from '../textures'
import type { BlockType } from '../types'

// ---------------------------------------------------------------------------
// The living background: a field of slowly drifting/spinning isometric cubes
// plus a layer of drifting "dust" pixels. Both react to the active theme.
// ---------------------------------------------------------------------------

interface CubeSpec {
  block: BlockType
  size: number
  left: number
  driftDur: number
  spinDur: number
  delay: number
  opacity: number
}

interface DustSpec {
  left: number
  size: number
  dur: number
  delay: number
}

const SIDE_FACES = ['front', 'back', 'left', 'right'] as const

function Cube({ spec }: { spec: CubeSpec }) {
  const topTex = blockTexture(spec.block, 'top')
  const sideTex = blockTexture(spec.block, 'side')
  return (
    <div
      className="cube"
      style={
        {
          left: `${spec.left}%`,
          width: spec.size,
          height: spec.size,
          bottom: -spec.size,
          opacity: spec.opacity,
          animationDuration: `${spec.driftDur}s`,
          animationDelay: `${spec.delay}s`,
          '--s': `${spec.size}px`,
        } as React.CSSProperties
      }
    >
      <div className="cube__inner" style={{ animationDuration: `${spec.spinDur}s` }}>
        <div className="cube__face top" style={{ backgroundImage: `url(${topTex})` }} />
        <div className="cube__face bottom" style={{ backgroundImage: `url(${topTex})` }} />
        {SIDE_FACES.map((f) => (
          <div key={f} className={`cube__face ${f}`} style={{ backgroundImage: `url(${sideTex})` }} />
        ))}
      </div>
    </div>
  )
}

export function Background() {
  const { activeTheme, profile } = useSite()
  const { blockCount, dustCount, spinBlocks } = profile.effects
  const showParticles = profile.features.particles

  const cubes = useMemo<CubeSpec[]>(() => {
    const palette = activeTheme.blocks.length ? activeTheme.blocks : (['stone'] as BlockType[])
    const n = Math.max(0, Math.min(60, blockCount))
    return Array.from({ length: n }, (_, i) => ({
      block: palette[i % palette.length],
      size: 26 + Math.round(Math.random() * 58),
      left: Math.round(Math.random() * 96),
      driftDur: 22 + Math.random() * 26,
      spinDur: spinBlocks ? 10 + Math.random() * 22 : 0,
      delay: -Math.random() * 40,
      opacity: 0.5 + Math.random() * 0.4,
    }))
    // Regenerate when the palette, count, or spin toggle changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTheme.id, blockCount, spinBlocks])

  const dust = useMemo<DustSpec[]>(() => {
    const n = showParticles ? Math.max(0, Math.min(120, dustCount)) : 0
    return Array.from({ length: n }, () => ({
      left: Math.random() * 100,
      size: 2 + Math.round(Math.random() * 3),
      dur: 6 + Math.random() * 12,
      delay: -Math.random() * 14,
    }))
  }, [dustCount, showParticles])

  return (
    <div className="blockfield" aria-hidden="true">
      {cubes.map((c, i) => (
        <Cube key={i} spec={c} />
      ))}
      {dust.map((d, i) => (
        <span
          key={`d${i}`}
          className="dust"
          style={{
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

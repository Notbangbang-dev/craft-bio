import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSite } from '../context/siteContext'

// Top-right control dock: switch theme, toggle audio, toggle the pixel cursor,
// and open the admin panel.
export function Dock({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const { themes, activeThemeId, setActiveTheme, muted, toggleMuted, cursorOn, toggleCursor } =
    useSite()
  const [showThemes, setShowThemes] = useState(false)

  return (
    <>
      <div className="dock">
        <button
          className="iconbtn"
          title="Themes"
          onClick={() => setShowThemes((s) => !s)}
          aria-label="themes"
        >
          🎨
        </button>
        <button
          className="iconbtn"
          title={muted ? 'Unmute' : 'Mute'}
          onClick={toggleMuted}
          aria-label="toggle audio"
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          className="iconbtn"
          title={cursorOn ? 'Default cursor' : 'Pixel cursor'}
          onClick={toggleCursor}
          aria-label="toggle cursor"
        >
          {cursorOn ? '➹' : '➶'}
        </button>
        <button className="iconbtn" title="Admin" onClick={onOpenAdmin} aria-label="admin">
          ⚙️
        </button>
      </div>

      <AnimatePresence>
        {showThemes && (
          <motion.div
            className="mc-panel themepop"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <h4>SELECT THEME</h4>
            {themes.map((t) => (
              <div
                key={t.id}
                className={`themeopt ${t.id === activeThemeId ? 'active' : ''}`}
                onClick={() => {
                  setActiveTheme(t.id)
                  setShowThemes(false)
                }}
              >
                <span
                  className="swatch"
                  style={{
                    background: `linear-gradient(135deg, ${t.colors.accent2}, ${t.colors.accent})`,
                  }}
                />
                <span>{t.icon}</span>
                <span style={{ fontSize: 16 }}>{t.name}</span>
                {t.custom && <span className="tag">CUSTOM</span>}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

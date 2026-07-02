import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSite } from './context/siteContext'
import { Background } from './components/Background'
import { Cursor } from './components/Cursor'
import { Dock } from './components/Dock'
import { ProfileCard } from './components/ProfileCard'
import { Splash } from './components/Splash'
import { AdminPanel } from './components/AdminPanel'

export default function App() {
  const { activeTheme, muted, profile } = useSite()
  const [entered, setEntered] = useState(!profile.features.splash)
  const [adminOpen, setAdminOpen] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Play / pause the theme's music based on entry + mute state.
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (entered && profile.features.music && activeTheme.music && !muted) {
      if (a.src !== activeTheme.music) a.src = activeTheme.music
      a.volume = 0.5
      a.play().catch(() => {
        /* autoplay blocked — user can toggle the speaker */
      })
    } else {
      a.pause()
    }
  }, [entered, profile.features.music, activeTheme.music, muted])

  return (
    <>
      <Background />
      <Cursor />

      <AnimatePresence>
        {!entered && profile.features.splash && (
          <Splash key="splash" onEnter={() => setEntered(true)} />
        )}
      </AnimatePresence>

      {entered && (
        <>
          <Dock onOpenAdmin={() => setAdminOpen(true)} />
          <main className="stage">
            <ProfileCard />
          </main>
        </>
      )}

      <AnimatePresence>
        {adminOpen && <AdminPanel key="admin" onClose={() => setAdminOpen(false)} />}
      </AnimatePresence>

      <audio ref={audioRef} loop preload="none" />
    </>
  )
}

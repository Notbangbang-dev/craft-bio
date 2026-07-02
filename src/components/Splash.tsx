import { motion } from 'framer-motion'
import { useSite } from '../context/siteContext'

// The guns.lol-style "click to enter" gate. Entering also unmutes audio,
// which is why it must be a real user gesture. All text is admin-editable.
export function Splash({ onEnter }: { onEnter: () => void }) {
  const { profile } = useSite()
  const title = profile.splashTitle || `${profile.username}.bio`
  // Colour the part after the first "." as an accent (e.g. the ".bio").
  const dot = title.indexOf('.')
  const head = dot >= 0 ? title.slice(0, dot) : title
  const tail = dot >= 0 ? title.slice(dot) : ''

  return (
    <motion.div
      className="splash"
      onClick={onEnter}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.5 }}
    >
      <div className="splash__title">
        {head}
        {tail && <span className="dot">{tail}</span>}
      </div>
      {profile.splashSubtitle && <div className="splash__sub">{profile.splashSubtitle}</div>}
      <div className="loadbar">
        <div className="loadbar__fill" />
      </div>
      <div className="splash__hint">{profile.splashHint}</div>
    </motion.div>
  )
}

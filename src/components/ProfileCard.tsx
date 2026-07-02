import { motion } from 'framer-motion'
import { useSite } from '../context/siteContext'
import { usePresence, useGithubStats, useViews } from '../hooks/useStats'
import { Typewriter } from './Typewriter'
import { Icon } from './icons'
import { Avatar } from './Avatar'
import { StatusLine, SpotifyNowPlaying, GithubRow } from './Stats'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

export function ProfileCard() {
  const { profile } = useSite()
  const { features } = profile
  const presence = usePresence()
  const github = useGithubStats()
  const views = useViews()

  const level = Math.floor(views / 100)
  const progress = views % 100

  return (
    <motion.div className="mc-panel card" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <Avatar />
      </motion.div>

      <motion.div className="namerow" variants={item}>
        <span className="enchant">{profile.displayName}</span>
      </motion.div>

      <motion.span className="handle" variants={item}>
        @{profile.username}
      </motion.span>

      {features.presence && (
        <motion.div variants={item}>
          <StatusLine status={presence?.status ?? 'offline'} activity={presence?.activity ?? null} />
        </motion.div>
      )}

      {profile.badges.length > 0 && (
        <motion.div className="badges" variants={item}>
          {profile.badges.map((b, i) => (
            <span className="badge" key={i}>
              {b}
            </span>
          ))}
        </motion.div>
      )}

      {profile.location && (
        <motion.div className="location" variants={item}>
          <span>📍</span>
          {profile.location}
        </motion.div>
      )}

      <motion.div variants={item} style={{ width: '100%' }}>
        <Typewriter lines={profile.taglines} />
      </motion.div>

      {features.spotify && presence?.spotify && (
        <motion.div variants={item} style={{ width: '100%' }}>
          <SpotifyNowPlaying spotify={presence.spotify} />
        </motion.div>
      )}

      <motion.nav className="hotbar" variants={item} aria-label="links">
        {profile.links.map((l) => (
          <a
            key={l.id}
            className="mc-slot hotbar__slot"
            href={l.url}
            target="_blank"
            rel="noreferrer noopener"
          >
            <span className="hotbar__label">{l.label}</span>
            <span className="hotbar__icon">
              <Icon name={l.icon} />
            </span>
          </a>
        ))}
      </motion.nav>

      {features.github && github && (
        <motion.div variants={item} style={{ width: '100%' }}>
          <GithubRow stats={github} />
        </motion.div>
      )}

      <motion.div className="xp" variants={item}>
        <div className="xp__bar">
          <div className="xp__fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="xp__label">
          <b>Lv {level}</b> · {views.toLocaleString()} views
        </div>
      </motion.div>

      {profile.footer && (
        <motion.div className="footer" variants={item}>
          {profile.footer}
        </motion.div>
      )}
    </motion.div>
  )
}

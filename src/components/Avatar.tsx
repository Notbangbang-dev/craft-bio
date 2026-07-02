import { useSite } from '../context/siteContext'

// A pixel-face placeholder used if the skin render service can't be reached.
const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 16 16' shape-rendering='crispEdges'%3E%3Crect width='16' height='16' fill='%23b58868'/%3E%3Crect width='16' height='5' fill='%235a3a24'/%3E%3Crect y='4' width='3' height='4' fill='%235a3a24'/%3E%3Crect x='13' y='4' width='3' height='4' fill='%235a3a24'/%3E%3Crect x='4' y='8' width='3' height='2' fill='%23fff'/%3E%3Crect x='9' y='8' width='3' height='2' fill='%23fff'/%3E%3Crect x='5' y='8' width='2' height='2' fill='%233b5f8a'/%3E%3Crect x='10' y='8' width='2' height='2' fill='%233b5f8a'/%3E%3Crect x='6' y='12' width='4' height='1' fill='%237a5236'/%3E%3C/svg%3E"

// The player standing there — a full-body Minecraft skin render that gently bobs.
export function Avatar() {
  const { profile } = useSite()
  return (
    <div className="hero">
      <img
        className="hero__skin"
        src={profile.avatar}
        alt={profile.displayName}
        draggable={false}
        onError={(e) => {
          const img = e.currentTarget
          if (img.dataset.fellback) return
          img.dataset.fellback = '1'
          img.src = PLACEHOLDER
        }}
      />
      <div className="hero__shadow" />
    </div>
  )
}

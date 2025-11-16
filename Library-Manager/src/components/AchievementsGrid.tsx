import type { ComputedAchievement } from '../types/steam'
import AchievementCard from './AchievementCard'

type Props = {
  achievements: ComputedAchievement[]
  filterMode?: 'all' | 'locked' | 'unlocked'
  onAchievementClick?: (a: ComputedAchievement) => void
}

export default function AchievementsGrid({ achievements, filterMode = 'all', onAchievementClick }: Props) {
  const filtered = filterMode === 'all' ? achievements : achievements.filter(a => (filterMode === 'unlocked' ? a.__achieved : !a.__achieved))

  if (filtered.length === 0) return <p className="text-gray-400">No achievements found for this app.</p>

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {filtered.map((ach) => (
        <AchievementCard key={ach.__key} achievement={ach} onClick={onAchievementClick} />
      ))}
    </section>
  )
}
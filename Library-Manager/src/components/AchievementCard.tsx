import type { ComputedAchievement } from '../types/steam'

type AchievementCardProps = {
  achievement: ComputedAchievement
  onClick?: (ach: ComputedAchievement) => void
}

export default function AchievementCard({ achievement, onClick }: AchievementCardProps) {
  const key = achievement.__key
  const achieved = achievement.__achieved
  const icon = achievement.icon || achievement.displayIcon || achievement.icon_url || achievement.icongray

  return (
    <article
      key={key}
      className={`bg-gray-800 text-white rounded p-3 cursor-pointer hover:opacity-90 ${achieved ? 'ring-2 ring-green-400' : ''}`}
      onClick={() => onClick?.(achievement)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(achievement) }}
    >
      <div className="flex items-center gap-3">
        {icon ? (
          <img src={icon} alt={achievement.displayName || achievement.name} className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
        ) : (
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700 flex items-center justify-center">?</div>
        )}
        <div>
          <h3 className="font-medium truncate max-w-[12rem] sm:max-w-[16rem]">{achievement.displayName || achievement.name}</h3>
          <p className="text-xs text-gray-400">{achievement.description || ''}</p>
          <p className="text-sm mt-1">{achieved ? 'Unlocked' : 'Locked'}</p>
        </div>
      </div>
    </article>
  )
}
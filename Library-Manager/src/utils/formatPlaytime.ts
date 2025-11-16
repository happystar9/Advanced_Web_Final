export function formatPlaytime(minutesInput?: number | null): string {
  const mins = Number(minutesInput ?? 0)
  if (!Number.isFinite(mins) || mins <= 0) return '0m'
  const hours = Math.floor(mins / 60)
  const minutes = Math.floor(mins % 60)
  if (hours <= 0) return `${minutes}m`
  if (minutes <= 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export default formatPlaytime
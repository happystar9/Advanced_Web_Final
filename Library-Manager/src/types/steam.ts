export type SchemaAchievement = {
  apiname?: string
  name?: string
  displayName?: string
  description?: string
  icon?: string
  displayIcon?: string
  icon_url?: string
  icongray?: string
  [key: string]: unknown
}

export type GameSchema = {
  game?: {
    gameName?: string
    gameTitle?: string
    availableGameStats?: {
      achievements?: SchemaAchievement[]
    }
  }
}

export type PlayerAchievement = {
  apiname?: string
  name?: string
  achieved?: number
  unlocktime?: number
  [key: string]: unknown
}

export type PlayerStatsResponse = {
  playerstats?: {
    achievements?: PlayerAchievement[]
  }
}

export type ComputedAchievement = SchemaAchievement & {
  __key: string
  __achieved: boolean
}
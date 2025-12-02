import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { steamOwnedHandler } from './endpoints/steamOwned.js'
import { steamPlayerHandler } from './endpoints/steamPlayer.js'
import { youtubeSearchHandler } from './endpoints/youtubeSearch.js'
import { steamLoginHandler, steamReturnHandler } from './endpoints/steamAuth.js'
import youtubeFilterHandler from './endpoints/aiFilter.js'
import achievementsSuggestHandler from './endpoints/aiAchievements.js'
import { steamResolveHandler } from './endpoints/steamResolve.js'
import { steamSchemaHandler } from './endpoints/steamSchema.js'
import { steamPlayerAchievementsHandler } from './endpoints/steamPlayerAchievements.js'
import { steamMeHandler } from './endpoints/steamMe.js'

const app = express()
app.use(cors())
app.use(express.json())

// Load .env from the server directory (so running from repo root still works)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })


const PORT = process.env.PORT || 3001
const KEY = process.env.STEAM_API_KEY

if (!KEY) {
  console.warn('Warning: STEAM_API_KEY is not set. Requests will fail until you set it.')
} else {
  console.log('STEAM_API_KEY loaded from environment')
}

app.get('/api/steam/player/:steamid', steamPlayerHandler)

app.get('/api/steam/resolve/:vanity', steamResolveHandler)

app.get('/api/steam/owned/:steamid', steamOwnedHandler)

app.get('/api/steam/schema/:appid', steamSchemaHandler)

app.get('/api/steam/playerachievements/:appid', steamPlayerAchievementsHandler)
app.get('/api/steam/me', steamMeHandler)

app.listen(PORT, () => {
  console.log(`Steam proxy listening on http://localhost:${PORT}`)
})

app.get('/api/youtube/search', youtubeSearchHandler)
app.post('/api/youtube/filter', youtubeFilterHandler)
app.post('/api/achievements/suggest', achievementsSuggestHandler)

app.get('/auth/steam/login', steamLoginHandler)

app.get('/auth/steam/return', steamReturnHandler)

app.use((err, req, res, next) => {
  console.error('Unhandled error in express:', err)
  const status = (err && err.status) || 500
  const message = (err && err.message) || 'Internal Server Error'
  if (process.env.NODE_ENV === 'production') {
    return res.status(status).json({ error: message })
  }
  return res.status(status).json({ error: message, stack: err && err.stack })
})
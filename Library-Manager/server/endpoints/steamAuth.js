import fetch from 'node-fetch'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.STEAM_JWT_SECRET || 'dev_steam_jwt_secret'

export function steamLoginHandler(req, res) {
  const originParam = req.query.origin ? `?origin=${encodeURIComponent(String(req.query.origin))}` : ''
  const returnTo = req.query.returnTo || `${req.protocol}://${req.get('host')}/auth/steam/return${originParam}`
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': String(returnTo),
    'openid.realm': `${req.protocol}://${req.get('host')}`,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  })
  const redirectUrl = `https://steamcommunity.com/openid/login?${params.toString()}`
  return res.redirect(redirectUrl)
}

export async function steamReturnHandler(req, res) {
  const incoming = req.query || {}
  const verifyParams = new URLSearchParams()
  Object.entries(incoming).forEach(([k, v]) => {
    verifyParams.append(k, String(v))
  })
  verifyParams.set('openid.mode', 'check_authentication')

  const verifyRes = await fetch('https://steamcommunity.com/openid/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: verifyParams.toString(),
  })
  const verifyText = await verifyRes.text()
  const isValid = /is_valid\s*:\s*true/.test(verifyText)

  if (!isValid) {
    return res.status(400).send('<h1>Steam login failed</h1><p>Unable to verify OpenID response.</p>')
  }

  const claimed = String(req.query['openid.claimed_id'] || '')
  const m = claimed.match(/\/(profiles|id)\/(.+)$/)
  let steamid = null
  if (m) {
    const tail = m[2]
    if (/^\d+$/.test(tail)) {
      steamid = tail
    } else {
      if (!process.env.STEAM_API_KEY) return res.status(500).send('<p>Server STEAM_API_KEY not configured for vanity resolution</p>')
      const rv = await fetch(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${process.env.STEAM_API_KEY}&vanityurl=${encodeURIComponent(
          tail,
        )}`,
      )
      const rvj = await rv.json()
      steamid = rvj?.response?.steamid || null
    }
  }

  if (!steamid) return res.status(400).send('<h1>Could not extract SteamID</h1>')

  const origin = req.query.origin || ''
  const safeOrigin = origin || `${req.protocol}://${req.get('host')}`
  const token = jwt.sign({ steamid: steamid }, JWT_SECRET, { expiresIn: '7d' })

  const html = `
      <!doctype html>
      <html>
        <head><meta charset="utf-8"><title>Steam Link</title></head>
        <body>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({ type: 'steam-linked', steamid: '${steamid}', steam_token: '${token}' }, '${safeOrigin}')
                window.close()
              } else {
                document.body.innerText = 'Steam ID: ${steamid}';
              }
            } catch (e) {
              document.body.innerText = 'Steam ID: ${steamid}';
            }
          </script>
        </body>
      </html>
    `
  res.setHeader('Content-Type', 'text/html')
  res.send(html)
}
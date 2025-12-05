import { OpenAI } from 'openai'
import fetch from 'node-fetch'

const openai = new OpenAI({ apiKey: "sk-no-key-required", baseURL: "http://ai-snow.reindeer-pinecone.ts.net:9292/v1" })

function parseISODuration(iso) {
    if (!iso || typeof iso !== 'string') return null
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!m) return null
    const h = parseInt(m[1] || '0', 10)
    const min = parseInt(m[2] || '0', 10)
    const s = parseInt(m[3] || '0', 10)
    return h * 3600 + min * 60 + s
}

async function youtubeFilterHandler(req, res) {
    const { query, videos } = req.body || {}
    if (!query || typeof query !== 'string') return res.status(400).json({ error: 'Missing or invalid `query`' })
    if (!Array.isArray(videos) || videos.length === 0) return res.status(400).json({ error: 'Missing or invalid `videos`' })

    const system = {
        role: 'system',
        content: 'You are an assistant that ranks YouTube search results for relevance to a query. Respond with ONLY valid JSON.'
    }

    const items = (videos || []).map((v) => Object.assign({}, v))
    const missingDurIds = items.filter((it) => !Number.isFinite(it.durationSeconds) && it.videoId).map((i) => i.videoId)
    const key = process.env.YT_API_KEY
    if (missingDurIds.length > 0 && key) {
        const vidsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${encodeURIComponent(
            missingDurIds.join(','),
        )}&key=${encodeURIComponent(key)}`
        const vr = await fetch(vidsUrl)
        const vjson = await vr.json()
        const durationMap = new Map()
            ; (vjson.items || []).forEach((vi) => {
                const id = vi.id
                const dur = parseISODuration(vi.contentDetails?.duration)
                if (id) durationMap.set(String(id), dur)
            })
        items.forEach((it) => {
            if (it.videoId && durationMap.has(String(it.videoId))) {
                it.durationSeconds = durationMap.get(String(it.videoId))
            }
        })
    }

    const videosForAi = items.filter((v) => {
        if (v.videoId || (v.type === 'video' || (v.kind && v.kind.includes('video')))) {
            if (typeof v.durationSeconds === 'number') return v.durationSeconds >= 300
            return false
        }
        return true
    })

    if (videosForAi.length === 0) {
        return res.status(422).json({ error: 'No candidate videos are at least 5 minutes long' })
    }

    const userContent = `Search query: "${query}"\n\nVideos (JSON array):\n${JSON.stringify(videosForAi)}\n\nIMPORTANT INSTRUCTIONS:\n- Respond with ONLY a single JSON array and nothing else (no prose, no backticks).\n- Each array item must be an object with these keys: id (string), type ("playlist" or "video"), title (string), description (string, max 200 characters, NO NEWLINES), score (number between 0 and 1), reason (short 1-2 sentence explanation, NO NEWLINES).\n- Do NOT include extra fields. Escape quotes in values (use \\" for quotes).\n- Keep all field values short so the full JSON fits within the token limit.\n- Example output exactly (no extra text):\n  [{"id":"VIDEO_ID","type":"video","title":"Short title","description":"Short description up to 200 chars.","score":0.9,"reason":"One-sentence rationale."}]\n\nReturn the JSON array only. Ensure the JSON is complete and not truncated.`

    let response
    try {
        response = await openai.chat.completions.create({
            model: 'gpt-oss-120b',
            messages: [system, { role: 'user', content: userContent }],
            temperature: 0.0,
            max_tokens: 1200
        })
    } catch (err) {
        console.error('AI request failed in youtubeFilterHandler:', err)
        return res.status(502).json({ error: 'AI request failed', message: String(err && (err.message || err)) })
    }

    if (!response || !response.choices || !Array.isArray(response.choices) || response.choices.length === 0) {
        console.error('AI client returned no choices', { response })
        const fallbackEmpty = (videos || []).slice(0, 3).map((v) => ({
            id: String(v.videoId ?? v.playlistId ?? ''),
            title: String(v.title ?? ''),
            description: String(v.description ?? ''),
            score: 0,
            reason: 'AI returned no result; fallback to original search results',
        }))
        return res.json({ results: fallbackEmpty })
    }

    const raw = response.choices?.[0]?.message?.content ?? response.choices?.[0]?.text ?? null
    if (!raw) {
        console.error('AI response missing raw text', { response })
        const fallbackEmpty = (videos || []).slice(0, 3).map((v) => ({
            id: String(v.videoId ?? v.playlistId ?? ''),
            title: String(v.title ?? ''),
            description: String(v.description ?? ''),
            score: 0,
            reason: 'AI returned empty content; fallback to original search results',
        }))
        return res.json({ results: fallbackEmpty })
    }

    let parsed = null
    function extractJson(text) {
        const start = text.search(/\{|\[/)
        if (start === -1) return null
        const openChar = text[start]
        const closeChar = openChar === '{' ? '}' : ']'
        let depth = 0
        let inString = false
        let escape = false
        for (let i = start; i < text.length; i++) {
            const ch = text[i]
            if (inString) {
                if (escape) { escape = false } else if (ch === '\\') { escape = true } else if (ch === '"') { inString = false }
                continue
            }
            if (ch === '"') { inString = true; continue }
            if (ch === openChar) { depth += 1 }
            else if (ch === closeChar) {
                depth -= 1
                if (depth === 0) return text.slice(start, i + 1)
            }
        }
        return null
    }


    console.log('AI raw response (truncated 1000 chars):', String(raw).slice(0, 1000))
    parsed = JSON.parse(raw)

    const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (match) {
        parsed = JSON.parse(match[0])
    } else {
        const extracted = extractJson(raw)
        if (extracted) {
            parsed = JSON.parse(extracted)
        } else {
            const start = raw.indexOf('[')
            if (start !== -1) {
                let candidate = raw.slice(start)
                if (!/\]$/.test(candidate)) candidate = candidate + ']'
                candidate = candidate.replace(/("type"\s*:\s*")([^"\]\}]*)$/g, '$1video"')
                const quoteCount = (candidate.match(/"/g) || []).length
                if (quoteCount % 2 === 1) candidate = candidate + '"'
                parsed = JSON.parse(candidate)
            }
        }
    }

    if (!Array.isArray(parsed)) return res.status(502).json({ error: 'AI response JSON is not an array' })

    const result = parsed.slice(0, 3).map((it) => ({
        id: String(it.id ?? it.videoId ?? it.video_id ?? ''),
        title: String(it.title ?? ''),
        description: String(it.description ?? it.snippet ?? ''),
        score: typeof it.score === 'number' ? it.score : parseFloat(String(it.score ?? '0')) || 0,
        reason: String(it.reason ?? it.explanation ?? '')
    }))

    return res.json({ results: result })
}
export default youtubeFilterHandler
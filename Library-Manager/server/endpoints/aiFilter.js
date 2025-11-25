import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: "sk-no-key-required", baseURL: "http://ai-snow.reindeer-pinecone.ts.net:9292/v1" })

async function youtubeFilterHandler(req, res) {
    const { query, videos } = req.body || {}
    if (!query || typeof query !== 'string') return res.status(400).json({ error: 'Missing or invalid `query`' })
    if (!Array.isArray(videos) || videos.length === 0) return res.status(400).json({ error: 'Missing or invalid `videos`' })

    const system = {
        role: 'system',
        content: 'You are an assistant that ranks YouTube search results for relevance to a query. Respond with ONLY valid JSON.'
    }

    const videosForAi = (videos || []).filter((v) => {
        if (typeof v.durationSeconds === 'number') return v.durationSeconds >= 300
        return true
    })

    const userContent = `Search query: "${query}"\n\nVideos (JSON array):\n${JSON.stringify(videosForAi)}\n\nImportant: ignore any videos under 5 minutes (300 seconds). Return a JSON array with either: 1) a playlist item followed by two video items (if a playlist is the best match), or 2) the 3 most relevant videos. Order items by relevance (most relevant first). Each array item must be an object with these keys: id (string), type ("playlist" or "video"), title (string), description (string), score (number between 0 and 1), reason (short explanation). Respond with ONLY valid JSON and no extra commentary.`

    const response = await openai.chat.completions.create({
        model: 'gpt-oss-120b',
        messages: [system, { role: 'user', content: userContent }],
        temperature: 0.0,
        max_tokens: 800
    })

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
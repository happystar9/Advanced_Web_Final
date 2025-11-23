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

    const userContent = `Search query: "${query}"\n\nVideos (JSON array):\n${JSON.stringify(videos)}\n\nReturn a JSON array with either: 1) a playlist item followed by two video items (if a playlist is the best match), or 2) the 3 most relevant videos. Order items by relevance (most relevant first). Each array item must be an object with these keys: id (string), type ("playlist" or "video"), title (string), description (string), score (number between 0 and 1), reason (short explanation). Respond with ONLY valid JSON and no extra commentary.`

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
    parsed = JSON.parse(raw)
    const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (match) {
        try {
            parsed = JSON.parse(match[0])
        } catch (e2) {
            console.error('Failed to parse extracted JSON from AI response', e2)
            console.error('AI raw response:', raw)
            return res.status(502).json({ error: 'Failed to parse AI response as JSON' })
        }
    } else {
        console.error('AI response not JSON and no JSON substring found. Raw response:', raw)
        const start = raw.indexOf('[')
        if (start !== -1) {
            let candidate = raw.slice(start)
            const tries = [candidate + ']', candidate + ']]', candidate + ']}', candidate.replace(/\n/g, ' ') + ']', candidate.replace(/\n/g, ' ')]
            for (const t of tries) {
                const p = JSON.parse(t)
                parsed = p
                break
            }

            if (!parsed) {
                let fixed = candidate
                fixed = fixed.replace(/("type"\s*:\s*")([^"\]]*)$/, '$1video"')
                const quoteCount = (fixed.match(/"/g) || []).length
                if (quoteCount % 2 === 1) fixed = fixed + '"'
                if (!/\]$/.test(fixed)) fixed = fixed + ']'
                parsed = JSON.parse(fixed)
                console.log('Successfully repaired AI response for parsing.')
                console.log('Repaired text preview:', fixed.slice(0, 1000))
            }
        }

        if (!parsed) {
            console.warn('Falling back to top-3 original videos because AI response could not be parsed.')
            const fallback = (videos || []).slice(0, 3).map((v) => ({
                id: String(v.videoId ?? v.playlistId ?? ''),
                title: String(v.title ?? ''),
                description: String(v.description ?? ''),
                score: 0,
                reason: 'AI parsing failed; fallback to original search results',
            }))
            return res.json({ results: fallback })
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
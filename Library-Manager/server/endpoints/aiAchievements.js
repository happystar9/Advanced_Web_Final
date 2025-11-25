import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: "sk-no-key-required", baseURL: "http://ai-snow.reindeer-pinecone.ts.net:9292/v1" })

async function achievementsSuggestHandler(req, res) {

    const { game, achievements } = req.body || {}
    if (!Array.isArray(achievements) || achievements.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid `achievements` array' })
    }

    const system = {
        role: 'system',
        content: ' You are an assistant that selects 4 random acheivements from a list given to you. Respond with ONLY valid JSON.'
    }

    const simple = achievements.map((a) => ({
        id: a.id ?? a.apiname ?? a.name ?? '',
        name: a.displayName ?? a.name ?? a.apiname ?? '',
        description: a.description ?? ''
    }))

    const userContent = `Game: "${game || ''}"\n\nLocked achievements (JSON array):\n${JSON.stringify(simple)}\n\nReturn a JSON array with up to 4 items chosen from the input. Each item must be an object with keys: id, name, description (optional), score (0-1), reason (short). Return ONLY valid JSON.`

    let response
    response = await openai.chat.completions.create({
        model: 'gpt-oss-120b',
        messages: [system, { role: 'user', content: userContent }],
        temperature: 0.0,
        max_tokens: 800
    })

    const raw = response?.choices?.[0]?.message?.content ?? response?.choices?.[0]?.text ?? null
    if (!raw) {
        console.error('AI returned no content', { response })
        return res.status(502).json({ error: 'AI returned no content' })
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
    const extracted = extractJson(raw)
    if (extracted) {
        parsed = JSON.parse(extracted)
    } else {
        parsed = null
    }


    if (!parsed || !Array.isArray(parsed)) {
        console.error('AI response not parseable as JSON array', { raw })
        return res.status(502).json({ error: 'AI response not parseable as JSON array' })
    }

    const result = parsed.slice(0, 4).map((it) => ({
        id: String(it.id ?? it.apiname ?? it.name ?? ''),
        name: String(it.name ?? it.displayName ?? ''),
        description: String(it.description ?? ''),
        score: typeof it.score === 'number' ? it.score : parseFloat(String(it.score ?? '0')) || 0,
        reason: String(it.reason ?? it.explanation ?? '')
    }))

    return res.json({ results: result })
}
export default achievementsSuggestHandler
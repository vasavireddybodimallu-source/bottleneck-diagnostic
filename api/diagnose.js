// POST /api/diagnose
// Body: { answers: { goal, learningTime, projectsShipped, triedSoFar, stuckReason, nextPlan, hoursPerWeek } }
// Returns: { diagnosis, prediction, action }

const QUESTIONS = [
  ['goal', 'What are you trying to build?'],
  ['learningTime', 'How long have you been learning AI?'],
  ['projectsShipped', 'How many projects have you shipped?'],
  ['triedSoFar', 'What have you tried so far?'],
  ['stuckReason', 'Why do you think you are stuck?'],
  ['nextPlan', 'What do you plan to do next?'],
  ['hoursPerWeek', 'How many hours/week do you build?'],
]

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' })
  }

  const { answers } = req.body || {}
  if (!answers) {
    return res.status(400).json({ error: 'Missing answers in request body.' })
  }

  const answerBlock = QUESTIONS.map(function (pair) {
    return pair[1] + '\n' + (answers[pair[0]] || '(no answer)')
  }).join('\n\n')

  const prompt = 'You are a blunt, specific diagnostic engine for people learning to build with AI.\n\n' +
    'Analyze the user answers below and return ONLY a JSON object, no markdown fences, no preamble, with exactly these three keys:\n' +
    '"diagnosis": one sentence naming a specific bottleneck. It must read as true for this person and false for most people, avoid generic advice like build more or stay consistent.\n' +
    '"prediction": one sentence predicting what will NOT work if they keep doing what they are doing.\n' +
    '"action": one concrete, time-boxed action they can take in the next 72 hours.\n\n' +
    'User answers:\n' + answerBlock + '\n\n' +
    'Respond with raw JSON only, matching: {"diagnosis": "...", "prediction": "...", "action": "..."}'

  try {const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + apiKey
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, responseMimeType: 'application/json' },
      }),
    })

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text()
      return res.status(502).json({ error: 'Gemini error: ' + errBody })
    }

    const data = await geminiRes.json()
    const text = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text

    if (!text) {
      return res.status(502).json({ error: 'Gemini returned no content.' })
    }

    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    if (!parsed.diagnosis || !parsed.prediction || !parsed.action) {
      return res.status(502).json({ error: 'Gemini response missing required fields.', raw: parsed })
    }

    return res.status(200).json(parsed)
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
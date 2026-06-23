// POST /api/diagnose
// Body: { answers: { goal, learningTime, shipped, currentEffort,
//                     projectsFinished, projectsAbandoned, shownPublicly, feedbackFrequency,
//                     selfBlocker } }
// Returns: { category, diagnosis, prediction, action }
// Powered by Groq running OpenAI's open-weight gpt-oss-20b model (free tier).

const QUESTIONS = [
  ['goal', 'What are you trying to build?'],
  ['learningTime', 'How long have you been learning AI?'],
  ['shipped', 'What have you shipped?'],
  ['currentEffort', 'What are you doing right now to improve?'],
  ['projectsFinished', 'How many projects have you finished?'],
  ['projectsAbandoned', 'How many did you abandon?'],
  ['shownPublicly', 'Have you shown your work publicly?'],
  ['feedbackFrequency', 'How often do you seek feedback?'],
  ['selfBlocker', 'What do you think is blocking you?'],
]

const CATEGORIES = [
  ['Knowledge Collector', 'Learns constantly, ships nothing.'],
  ['Perfectionist', 'Starts projects, never finishes.'],
  ['Feedback Avoider', 'Never shows work publicly.'],
  ['Tool Hopper', 'Switches frameworks every week.'],
  ['Idea Addict', 'Always brainstorming, never executing.'],
  ['Builder Without Validation', 'Builds but never talks to users.'],
]

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' })
  }

  const answers = req.body && req.body.answers
  if (!answers) {
    return res.status(400).json({ error: 'Missing answers in request body.' })
  }

  const answerBlock = QUESTIONS.map(function (pair) {
    return pair[1] + '\n' + (answers[pair[0]] || '(no answer)')
  }).join('\n\n')

  const categoryBlock = CATEGORIES.map(function (pair) {
    return '- ' + pair[0] + ': ' + pair[1]
  }).join('\n')

  const systemPrompt =
    'You are a blunt, specific diagnostic engine for people learning to build with AI. ' +
    'You always respond with ONLY a raw JSON object, no markdown fences, no preamble, no explanation outside the JSON.'

  const userPrompt =
    'Pick exactly ONE bottleneck category from this fixed list that best matches the user:\n' +
    categoryBlock + '\n\n' +
    'Then analyze the user answers below and return a JSON object with exactly these four keys:\n' +
    '"category": one of the exact category names above.\n' +
    '"diagnosis": one sentence naming the specific bottleneck, grounded in the chosen category. It must read as true for this person and false for most people, avoid generic advice like build more or stay consistent.\n' +
    '"prediction": one sentence predicting why the fix the user already has in mind (see their own answer on what they plan to do, and what they think is blocking them) will NOT work.\n' +
    '"action": one concrete, time-boxed action they can take in the next 72 hours that targets the real bottleneck, not the one they think they have.\n\n' +
    'User answers:\n' + answerBlock + '\n\n' +
    'Respond with raw JSON only, matching: {"category": "...", "diagnosis": "...", "prediction": "...", "action": "..."}'

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        temperature: 0.6,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    if (!groqRes.ok) {
      const errBody = await groqRes.text()
      return res.status(502).json({ error: 'Groq error: ' + errBody })
    }

    const data = await groqRes.json()
    const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content

    if (!text) {
      return res.status(502).json({ error: 'Groq returned no content.' })
    }

    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    if (!parsed.category || !parsed.diagnosis || !parsed.prediction || !parsed.action) {
      return res.status(502).json({ error: 'Groq response missing required fields.', raw: parsed })
    }

    return res.status(200).json(parsed)
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
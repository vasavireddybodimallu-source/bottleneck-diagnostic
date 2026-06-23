import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession, generateAndSaveDiagnosis } from '../services/diagnostics.js'

const QUESTIONS = [
  { key: 'goal', label: 'What are you trying to build?', type: 'textarea' },
  { key: 'learningTime', label: 'How long have you been learning AI?', type: 'input' },
  { key: 'projectsShipped', label: 'How many projects have you shipped?', type: 'input' },
  { key: 'triedSoFar', label: 'What have you tried so far?', type: 'textarea' },
  { key: 'stuckReason', label: 'Why do you think you’re stuck?', type: 'textarea' },
  { key: 'nextPlan', label: 'What do you plan to do next?', type: 'textarea' },
  { key: 'hoursPerWeek', label: 'How many hours/week do you build?', type: 'input' },
]

const EMPTY = QUESTIONS.reduce((acc, q) => ({ ...acc, [q.key]: '' }), {})

export default function Questionnaire() {
  const [answers, setAnswers] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const update = (key, value) => setAnswers((a) => ({ ...a, [key]: value }))

  const allFilled = QUESTIONS.every((q) => answers[q.key].trim().length > 0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!allFilled || busy) return
    setBusy(true)
    setError(null)
    try {
      const session = await createSession(answers)
      const diagnosis = await generateAndSaveDiagnosis(session)
      navigate(`/diagnosis/${diagnosis.id}`)
    } catch (err) {
      setError(err.message || String(err))
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="eyebrow">Intake — 7 questions</p>
      <h1 className="title">Find your actual bottleneck.</h1>
      <p className="subtitle">
        Answer honestly. The diagnosis is only useful if the inputs are real.
      </p>

      <form className="card" onSubmit={handleSubmit}>
        {QUESTIONS.map((q, i) => (
          <div className="field" key={q.key}>
            <label htmlFor={q.key}>
              <span className="qnum">{String(i + 1).padStart(2, '0')}</span>
              {q.label}
            </label>
            {q.type === 'textarea' ? (
              <textarea
                id={q.key}
                rows={3}
                value={answers[q.key]}
                onChange={(e) => update(q.key, e.target.value)}
                disabled={busy}
              />
            ) : (
              <input
                id={q.key}
                type="text"
                value={answers[q.key]}
                onChange={(e) => update(q.key, e.target.value)}
                disabled={busy}
              />
            )}
          </div>
        ))}

        <div className="actions-row">
          <button className="btn" type="submit" disabled={!allFilled || busy}>
            {busy ? 'RUNNING DIAGNOSIS…' : 'RUN DIAGNOSIS →'}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  )
}

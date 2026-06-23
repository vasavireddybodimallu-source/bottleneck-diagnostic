import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSession, generateAndSaveDiagnosis } from '../services/diagnostics.js'

const STEPS = [
  {
    title: 'Current situation',
    fields: [
      { key: 'goal', label: 'What are you trying to build?', type: 'textarea' },
      { key: 'learningTime', label: 'How long have you been learning AI?', type: 'input' },
      { key: 'shipped', label: 'What have you shipped?', type: 'textarea' },
      { key: 'currentEffort', label: 'What are you doing right now to improve?', type: 'textarea' },
    ],
  },
  {
    title: 'Behavior',
    fields: [
      { key: 'projectsFinished', label: 'How many projects have you finished?', type: 'input' },
      { key: 'projectsAbandoned', label: 'How many did you abandon?', type: 'input' },
      { key: 'shownPublicly', label: 'Have you shown your work publicly?', type: 'input' },
      { key: 'feedbackFrequency', label: 'How often do you seek feedback?', type: 'input' },
    ],
  },
  {
    title: 'Self assessment',
    fields: [
      { key: 'selfBlocker', label: 'What do you think is blocking you?', type: 'textarea' },
    ],
  },
]

const ALL_KEYS = STEPS.flatMap((s) => s.fields.map((f) => f.key))
const EMPTY = ALL_KEYS.reduce((acc, k) => ({ ...acc, [k]: '' }), {})

export default function Questionnaire() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(EMPTY)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const update = (key, value) => setAnswers((a) => ({ ...a, [key]: value }))

  const currentFields = STEPS[step].fields
  const stepFilled = currentFields.every((f) => answers[f.key].trim().length > 0)
  const isLastStep = step === STEPS.length - 1

  function handleNext(e) {
    e.preventDefault()
    if (!stepFilled) return
    setStep((s) => s + 1)
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stepFilled || busy) return
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
      <p className="eyebrow">
        Intake — step {step + 1} of {STEPS.length}: {STEPS[step].title}
      </p>
      <h1 className="title">Find your actual bottleneck.</h1>
      <p className="subtitle">Answer honestly. The diagnosis is only useful if the inputs are real.</p>

      <form className="card" onSubmit={isLastStep ? handleSubmit : handleNext}>
        {currentFields.map((f) => (
          <div className="field" key={f.key}>
            <label htmlFor={f.key}>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                id={f.key}
                rows={3}
                value={answers[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                disabled={busy}
              />
            ) : (
              <input
                id={f.key}
                type="text"
                value={answers[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                disabled={busy}
              />
            )}
          </div>
        ))}

        <div className="actions-row">
          {step > 0 && (
            <button type="button" className="btn btn-ghost" onClick={handleBack} disabled={busy}>
              ← BACK
            </button>
          )}
          <button className="btn" type="submit" disabled={!stepFilled || busy}>
            {isLastStep ? (busy ? 'RUNNING DIAGNOSIS…' : 'RUN DIAGNOSIS →') : 'NEXT →'}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  )
}
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { saveOutcome } from '../services/diagnostics.js'

const OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'partially', label: 'Partially' },
  { value: 'no', label: 'No' },
]

export default function FollowUp() {
  const { diagnosisId } = useParams()
  const navigate = useNavigate()

  const [actionTaken, setActionTaken] = useState(null)
  const [whatDid, setWhatDid] = useState('')
  const [whatHappened, setWhatHappened] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const canSubmit = actionTaken && whatHappened.trim().length > 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit || busy) return
    setBusy(true)
    setError(null)
    try {
      await saveOutcome(diagnosisId, {
        action_taken: actionTaken,
        what_did: whatDid,
        what_happened: whatHappened,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || String(err))
      setBusy(false)
    }
  }

  return (
    <div>
      <p className="eyebrow">Follow-up</p>
      <h1 className="title">Did you take the action?</h1>
      <p className="subtitle">This closes the loop — diagnosis → outcome.</p>

      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label>Did you take the action?</label>
          <div className="choice-group">
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`choice-btn ${actionTaken === opt.value ? 'selected' : ''}`}
                onClick={() => setActionTaken(opt.value)}
                disabled={busy}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="whatDid">What did you do?</label>
          <textarea
            id="whatDid"
            rows={3}
            value={whatDid}
            onChange={(e) => setWhatDid(e.target.value)}
            disabled={busy}
          />
        </div>

        <div className="field">
          <label htmlFor="whatHappened">What happened?</label>
          <textarea
            id="whatHappened"
            rows={3}
            value={whatHappened}
            onChange={(e) => setWhatHappened(e.target.value)}
            disabled={busy}
          />
        </div>

        <div className="actions-row">
          <button className="btn" type="submit" disabled={!canSubmit || busy}>
            {busy ? 'SAVING…' : 'SAVE OUTCOME →'}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  )
}

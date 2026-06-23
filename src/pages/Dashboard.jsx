import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDiagnosesWithOutcomes } from '../services/diagnostics.js'

function tagFor(outcome) {
  if (!outcome) return { cls: 'pending', label: 'Pending' }
  if (outcome.action_taken === 'yes') return { cls: 'yes', label: 'Done' }
  if (outcome.action_taken === 'no') return { cls: 'no', label: 'Skipped' }
  return { cls: 'partial', label: 'Partial' }
}

export default function Dashboard() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    listDiagnosesWithOutcomes().then(setRows).catch((e) => setError(e.message))
  }, [])

  return (
    <div>
      <p className="eyebrow">Dashboard</p>
      <h1 className="title">Diagnosis → outcome.</h1>
      <p className="subtitle">Every verdict this account has received, and what actually happened.</p>

      {error && <p className="error-text">{error}</p>}

      {!rows && !error && <p className="loader">Loading…</p>}

      {rows && rows.length === 0 && (
        <div className="empty-state">No diagnoses yet. Run one from the intake form.</div>
      )}

      {rows && rows.length > 0 && (
        <div className="card">
          {rows.map((d) => {
            const outcome = d.outcomes?.[0]
            const tag = tagFor(outcome)
            return (
              <div className="dash-row" key={d.id}>
                <div>
                  <p className="dash-diag"><strong>#{d.id}</strong> — {d.diagnosis}</p>
                  {outcome && (
                    <p className="dash-diag" style={{ color: 'var(--ink-soft)' }}>
                      → {outcome.result?.what_happened}
                    </p>
                  )}
                  {!outcome && (
                    <Link to={`/follow-up/${d.id}`} style={{ fontSize: 13 }}>
                      Log outcome →
                    </Link>
                  )}
                </div>
                <span className={`tag ${tag.cls}`}>{tag.label}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="actions-row">
        <Link className="btn btn-ghost" to="/start">
          + NEW DIAGNOSIS
        </Link>
      </div>
    </div>
  )
}

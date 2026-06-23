import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDiagnosesWithOutcomes } from '../services/diagnostics.js'

function tagFor(outcome) {
  if (!outcome) return { cls: 'pending', label: 'Pending' }
  if (outcome.action_taken === 'yes') return { cls: 'yes', label: 'Done' }
  if (outcome.action_taken === 'no') return { cls: 'no', label: 'Skipped' }
  return { cls: 'partial', label: 'Partial' }
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
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
      <h1 className="title">Previous diagnoses.</h1>
      <p className="subtitle">Every verdict this account has received, and what actually happened.</p>

      {error && <p className="error-text">{error}</p>}
      {!rows && !error && <p className="loader">Loading…</p>}

      {rows && rows.length === 0 && (
        <div className="empty-state">No diagnoses yet. Run one from the intake form.</div>
      )}

      {rows && rows.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="diag-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Diagnosis</th>
                <th>Action</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const outcome = d.outcomes && d.outcomes[0]
                const tag = tagFor(outcome)
                return (
                  <tr key={d.id}>
                    <td className="td-date">{formatDate(d.created_at)}</td>
                    <td>
                      {d.category && <span className="cat-pill">{d.category}</span>}
                      <div>{d.diagnosis}</div>
                    </td>
                    <td>{d.action_plan}</td>
                    <td>
                      <span className={'tag ' + tag.cls}>{tag.label}</span>
                      {!outcome && (
                        <div>
                          <Link to={'/follow-up/' + d.id} style={{ fontSize: 12 }}>
                            Log →
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
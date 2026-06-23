import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDiagnosis } from '../services/diagnostics.js'

export default function Diagnosis() {
  const { diagnosisId } = useParams()
  const [diagnosis, setDiagnosis] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDiagnosis(diagnosisId).then(setDiagnosis).catch((e) => setError(e.message))
  }, [diagnosisId])

  if (error) return <p className="error-text">{error}</p>
  if (!diagnosis) return <p className="loader">Loading report…</p>

  const selfBlocker = diagnosis.sessions && diagnosis.sessions.answers && diagnosis.sessions.answers.selfBlocker

  return (
    <div>
      <p className="eyebrow">Result</p>
      <h1 className="title">Your diagnosis is in.</h1>

      {selfBlocker && (
        <div className="card compare-card">
          <div className="compare-row">
            <span className="compare-label">You thought</span>
            <span className="compare-value">{selfBlocker}</span>
          </div>
          <div className="compare-row">
            <span className="compare-label">System found</span>
            <span className="compare-value compare-value-strong">{diagnosis.category}</span>
          </div>
        </div>
      )}

      <div className="report-ticket">
        <div className="report-head">
          <span>REPORT #{String(diagnosis.id).padStart(5, '0')}</span>
          <span>SESSION {diagnosis.session_id}</span>
        </div>
        <div className="report-body">
          <span className="verdict-stamp">{diagnosis.category || 'VERDICT'}</span>
          <p className="diagnosis-text">{diagnosis.diagnosis}</p>

          <div className="report-row">
            <span className="row-label">Prediction</span>
            <span className="row-value">{diagnosis.prediction}</span>
          </div>
          <div className="report-row">
            <span className="row-label">Action (72h)</span>
            <span className="row-value">{diagnosis.action_plan}</span>
          </div>
        </div>
      </div>

      <div className="actions-row">
        <Link className="btn" to={`/follow-up/${diagnosis.id}`}>
          LOG WHAT I DID →
        </Link>
        <Link className="btn btn-ghost" to="/dashboard">
          VIEW DASHBOARD
        </Link>
      </div>
    </div>
  )
}
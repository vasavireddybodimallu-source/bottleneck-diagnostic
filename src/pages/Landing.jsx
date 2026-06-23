import { Link } from 'react-router-dom'

const CATEGORIES = [
  { name: 'Knowledge Collector', desc: 'Learns constantly, ships nothing.' },
  { name: 'Perfectionist', desc: 'Starts projects, never finishes.' },
  { name: 'Feedback Avoider', desc: 'Never shows work publicly.' },
  { name: 'Tool Hopper', desc: 'Switches frameworks every week.' },
  { name: 'Idea Addict', desc: 'Always brainstorming, never executing.' },
  { name: 'Builder Without Validation', desc: 'Builds but never talks to users.' },
]

export default function Landing() {
  return (
    <div>
      <p className="eyebrow">AI Bottleneck Diagnostic</p>
      <h1 className="title">
        Most people think they're stuck because they need more AI knowledge.
        Usually they're stuck for a completely different reason.
      </h1>
      <p className="subtitle">Find your real bottleneck in 3 minutes.</p>

      <div className="actions-row" style={{ marginBottom: 40 }}>
        <Link className="btn" to="/start">
          START DIAGNOSIS →
        </Link>
      </div>

      <div className="card">
        <p className="eyebrow">How it works</p>
        <div className="report-row">
          <span className="row-label">01</span>
          <span className="row-value">Answer 9 short questions about what you're building, what you've actually shipped, and how you behave under friction.</span>
        </div>
        <div className="report-row">
          <span className="row-label">02</span>
          <span className="row-value">An AI model compares what you think is blocking you against the pattern in your actual answers.</span>
        </div>
        <div className="report-row">
          <span className="row-label">03</span>
          <span className="row-value">You get one diagnosis, one prediction, one 72-hour action — then a place to log whether you did it.</span>
        </div>
      </div>

      <div className="report-ticket">
        <div className="report-head">
          <span>EXAMPLE REPORT</span>
          <span>#00042</span>
        </div>
        <div className="report-body">
          <span className="verdict-stamp">VERDICT</span>
          <p className="diagnosis-text">
            Your bottleneck is avoiding external feedback, not lack of knowledge.
          </p>
          <div className="report-row">
            <span className="row-label">Prediction</span>
            <span className="row-value">Taking another AI course will not help, because knowledge isn't your constraint.</span>
          </div>
          <div className="report-row">
            <span className="row-label">Action (72h)</span>
            <span className="row-value">Publish one project within 72 hours and collect feedback from 3 people.</span>
          </div>
        </div>
      </div>

      <p className="eyebrow" style={{ marginTop: 32 }}>The six bottleneck patterns</p>
      <div className="card">
        {CATEGORIES.map((c, i) => (
          <div className="report-row" key={c.name}>
            <span className="row-label">{String(i + 1).padStart(2, '0')}</span>
            <span className="row-value"><strong>{c.name}</strong> — {c.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
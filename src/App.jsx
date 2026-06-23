import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Questionnaire from './pages/Questionnaire.jsx'
import Diagnosis from './pages/Diagnosis.jsx'
import FollowUp from './pages/FollowUp.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <header className="topbar">
        <span className="mark">BTLNK</span>
        <span className="topbar-sub">AI Bottleneck Diagnostic</span>
      </header>
      <main className="shell">
        <Routes>
          <Route path="/" element={<Navigate to="/start" replace />} />
          <Route path="/start" element={<Questionnaire />} />
          <Route path="/diagnosis/:diagnosisId" element={<Diagnosis />} />
          <Route path="/follow-up/:diagnosisId" element={<FollowUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

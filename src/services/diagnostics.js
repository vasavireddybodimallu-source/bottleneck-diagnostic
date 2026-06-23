import { supabase, ensureUser } from './supabase.js'

/** Saves the 7 raw answers as one session row, scoped to the current user. */
export async function createSession(answers) {
  const user = await ensureUser()
  const { data, error } = await supabase
    .from('sessions')
    .insert({ user_id: user.id, answers })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Sends the session's answers to the Gemini-backed serverless function,
 * then persists the returned diagnosis/prediction/action, linked to the
 * session — this session_id -> diagnosis_id link is the Move 4 schema.
 */
export async function generateAndSaveDiagnosis(session) {
  const user = await ensureUser()

  const res = await fetch('/api/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers: session.answers }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Diagnosis request failed: ${body}`)
  }
  const result = await res.json()

  const { data, error } = await supabase
    .from('diagnoses')
    .insert({
      session_id: session.id,
      user_id: user.id,
      diagnosis: result.diagnosis,
      prediction: result.prediction,
      action_plan: result.action,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getDiagnosis(diagnosisId) {
  const { data, error } = await supabase
    .from('diagnoses')
    .select('*')
    .eq('id', diagnosisId)
    .single()
  if (error) throw error
  return data
}

export async function saveOutcome(diagnosisId, { action_taken, what_did, what_happened }) {
  const user = await ensureUser()
  const { data, error } = await supabase
    .from('outcomes')
    .insert({
      diagnosis_id: diagnosisId,
      user_id: user.id,
      action_taken,
      result: { what_did, what_happened },
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Diagnosis -> outcome rollup for the Dashboard demo view. */
export async function listDiagnosesWithOutcomes() {
  const { data, error } = await supabase
    .from('diagnoses')
    .select('*, outcomes(*)')
    .order('id', { ascending: false })
  if (error) throw error
  return data
}

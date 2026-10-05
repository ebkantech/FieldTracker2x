'use client'
import { useState } from 'react'
import './globals.css'

const STATUS = [
  ['pending', 'Pending'],
  ['in_progress', 'In Progress'],
  ['completed', 'Completed'],
  ['on_hold', 'On Hold'],
]

const today = () => new Date().toISOString().slice(0, 10)

export default function FieldProgressPage() {
  const [form, setForm] = useState({
    project_code: '', site_name: '', progress_date: today(),
    work_scope: '', progress_percent: '', status: 'in_progress',
    note: '', reporter_name: '',
  })
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState('')
  const [err, setErr] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setOk(''); setErr('')
    try {
      // work_scope is a free-text hint for now; the ERP maps site + vendor
      // scope. (Later: fetch the project's work packages and pick one.)
      const payload = {
        project_code: form.project_code.trim(),
        site_name: form.site_name.trim(),
        progress_date: form.progress_date,
        progress_percent: form.progress_percent || '0',
        status: form.status,
        note: [form.work_scope && `Scope: ${form.work_scope}`, form.note].filter(Boolean).join(' — '),
        reporter_name: form.reporter_name.trim(),
      }
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Submission failed.')
      setOk(`Recorded ${form.site_name} · ${form.progress_percent || 0}% for ${form.progress_date}.`)
      setForm((f) => ({ ...f, progress_percent: '', note: '', work_scope: '' }))
    } catch (e2) {
      setErr(e2.message)
    } finally { setBusy(false) }
  }

  return (
    <div className="wrap">
      <div className="brand">
        <span style={{ fontSize: 24 }}>🛠️</span>
        <div>
          <h1>FieldTracker</h1>
          <p>Daily work progress · OmegaERP</p>
        </div>
      </div>

      <form className="card" onSubmit={submit}>
        {ok && <div className="ok">{ok}</div>}
        {err && <div className="err">{err}</div>}

        <label>
          <span>Project code</span>
          <input value={form.project_code} onChange={set('project_code')} placeholder="e.g. PRJ001" required />
        </label>
        <label>
          <span>Site / substation</span>
          <input value={form.site_name} onChange={set('site_name')} placeholder="e.g. Pokaran" required />
        </label>
        <div className="row">
          <label>
            <span>Date</span>
            <input type="date" value={form.progress_date} onChange={set('progress_date')} required />
          </label>
          <label>
            <span>Progress %</span>
            <input type="number" min="0" max="100" step="0.1" value={form.progress_percent}
              onChange={set('progress_percent')} placeholder="0–100" inputMode="decimal" />
          </label>
        </div>
        <label>
          <span>Work scope / stage</span>
          <input value={form.work_scope} onChange={set('work_scope')} placeholder="e.g. Piling / MMS / Module install" />
        </label>
        <div className="row">
          <label>
            <span>Status</span>
            <select value={form.status} onChange={set('status')}>
              {STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label>
            <span>Your name</span>
            <input value={form.reporter_name} onChange={set('reporter_name')} placeholder="Site engineer" />
          </label>
        </div>
        <label>
          <span>Note</span>
          <textarea rows={2} value={form.note} onChange={set('note')} placeholder="Optional remarks" />
        </label>

        <button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit daily progress'}</button>
        <p className="hint">Submits to OmegaERP → project&apos;s Work Structure · Daily Progress.</p>
      </form>
    </div>
  )
}

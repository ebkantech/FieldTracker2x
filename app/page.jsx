'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'

const STATUS = [['pending', 'Pending'], ['in_progress', 'In Progress'], ['completed', 'Completed'], ['on_hold', 'On hold']]
const today = () => new Date().toISOString().slice(0, 10)

export default function DailyProgress() {
  const [vendor, setVendor] = useState(null)
  const [scope, setScope] = useState([])
  const [form, setForm] = useState({ project_code: '', site_name: '', progress_date: today(), work_scope: '', progress_percent: '', status: 'in_progress', note: '' })
  const [photo, setPhoto] = useState(null)
  const [geo, setGeo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState(''); const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(d => setVendor(d.vendor || null))
    fetch('/api/portal/work-scope').then(r => r.json()).then(d => setScope(d.work_scope || [])).catch(() => {})
  }, [])

  const capture = () => {
    if (!navigator.geolocation) { setErr('Geolocation not available.'); return }
    navigator.geolocation.getCurrentPosition(
      p => setGeo({ latitude: p.coords.latitude.toFixed(6), longitude: p.coords.longitude.toFixed(6) }),
      () => setErr('Could not get location (permission denied?).'),
      { enableHighAccuracy: true, timeout: 10000 })
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setOk(''); setErr('')
    try {
      const fd = new FormData()
      fd.append('project_code', form.project_code.trim())
      fd.append('site_name', form.site_name.trim())
      fd.append('progress_date', form.progress_date)
      fd.append('progress_percent', form.progress_percent || '0')
      fd.append('status', form.status)
      fd.append('note', [form.work_scope && `Scope: ${form.work_scope}`, form.note].filter(Boolean).join(' — '))
      fd.append('reporter_name', vendor?.contact_person || vendor?.company_name || '')
      if (geo) { fd.append('latitude', geo.latitude); fd.append('longitude', geo.longitude) }
      if (photo) fd.append('photo', photo)
      const res = await fetch('/api/submit', { method: 'POST', body: fd })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Submission failed.')
      setOk(`Recorded ${form.site_name} · ${form.progress_percent || 0}%${geo ? ' · location tagged' : ''}${photo ? ' · photo attached' : ''}.`)
      setForm(f => ({ ...f, progress_percent: '', note: '', work_scope: '' })); setPhoto(null); setGeo(null)
    } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }

  const projects = Array.from(new Set(scope.map(s => s.project_code).filter(Boolean)))
  const inp = { width: '100%', padding: '11px 12px', fontSize: 15, border: '1px solid #d8e2ee', borderRadius: 10 }

  return (
    <Nav>
      <h2 style={{ margin: '0 0 14px', fontSize: 20 }}>Submit Daily Progress</h2>
      <form className="card" onSubmit={submit} style={{ maxWidth: 560 }}>
        {ok && <div className="ok">{ok}</div>}
        {err && <div className="err">{err}</div>}
        <label><span>Project code</span>
          <input list="proj" style={inp} value={form.project_code} onChange={set('project_code')} placeholder="e.g. PRJ001" required />
          <datalist id="proj">{projects.map(p => <option key={p} value={p} />)}</datalist></label>
        <label><span>Site / substation</span><input style={inp} value={form.site_name} onChange={set('site_name')} placeholder="e.g. Pokaran" required /></label>
        <div className="row">
          <label><span>Date</span><input type="date" style={inp} value={form.progress_date} onChange={set('progress_date')} required /></label>
          <label><span>Progress %</span><input type="number" min="0" max="100" style={inp} value={form.progress_percent} onChange={set('progress_percent')} inputMode="decimal" /></label>
        </div>
        <label><span>Work scope / stage</span><input list="scopeopt" style={inp} value={form.work_scope} onChange={set('work_scope')} placeholder="e.g. Piling / MMS" />
          <datalist id="scopeopt">{scope.map(s => <option key={s.id} value={s.name} />)}</datalist></label>
        <label><span>Status</span><select style={inp} value={form.status} onChange={set('status')}>{STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label><span>Photo (site evidence)</span><input type="file" accept="image/*" capture="environment" onChange={e => setPhoto(e.target.files?.[0] || null)} style={{ ...inp, padding: 8 }} /></label>
        <label><span>Location (geo-tag)</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" onClick={capture} style={{ width: 'auto', padding: '9px 14px', margin: 0, background: '#0d2a4a' }}>📍 Capture</button>
            <span className="muted">{geo ? `${geo.latitude}, ${geo.longitude}` : 'not captured'}</span>
          </div></label>
        <label><span>Note</span><textarea rows={2} style={inp} value={form.note} onChange={set('note')} placeholder="Optional remarks" /></label>
        <button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit progress'}</button>
      </form>
    </Nav>
  )
}

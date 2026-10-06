'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'

const today = () => new Date().toISOString().slice(0, 10)
const DISCIPLINE = [['civil', 'Civil'], ['mechanical', 'Mechanical'], ['electrical', 'Electrical'], ['safety', 'Safety'], ['other', 'Other']]
const SEVERITY = [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['critical', 'Critical']]

export default function Punch() {
  const [vendor, setVendor] = useState(null)
  const [scope, setScope] = useState([])
  const [form, setForm] = useState({ project_code: '', site_name: '', raised_on: today(), work_package: '', title: '', description: '', discipline: 'mechanical', severity: 'medium' })
  const [photo, setPhoto] = useState(null)
  const [geo, setGeo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState(''); const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(d => setVendor(d.vendor || null))
    fetch('/api/portal/work-scope').then(r => r.json()).then(d => setScope(d.work_scope || [])).catch(() => {})
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const capture = () => {
    if (!navigator.geolocation) { setErr('Geolocation not available.'); return }
    navigator.geolocation.getCurrentPosition(
      p => setGeo({ latitude: p.coords.latitude.toFixed(6), longitude: p.coords.longitude.toFixed(6) }),
      () => setErr('Could not get location (permission denied?).'),
      { enableHighAccuracy: true, timeout: 10000 })
  }

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setOk(''); setErr('')
    try {
      const wp = scope.find(s => s.name === form.work_package)
      const fd = new FormData()
      fd.append('project_code', form.project_code.trim())
      fd.append('site_name', form.site_name.trim())
      fd.append('raised_on', form.raised_on)
      fd.append('title', form.title.trim())
      fd.append('description', form.description)
      fd.append('discipline', form.discipline)
      fd.append('severity', form.severity)
      if (wp) fd.append('work_package_id', wp.id)
      fd.append('reporter_name', vendor?.contact_person || vendor?.company_name || '')
      if (geo) { fd.append('latitude', geo.latitude); fd.append('longitude', geo.longitude) }
      if (photo) fd.append('photo', photo)
      const res = await fetch('/api/punch', { method: 'POST', body: fd })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Submission failed.')
      setOk(`Defect logged — ${d.punch.code} (${d.punch.severity_display}).`)
      setForm(f => ({ ...f, title: '', description: '' })); setPhoto(null); setGeo(null)
    } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }

  const projects = Array.from(new Set(scope.map(s => s.project_code).filter(Boolean)))
  const inp = { width: '100%', padding: '11px 12px', fontSize: 15, border: '1px solid #d8e2ee', borderRadius: 10 }

  return (
    <Nav>
      <h2 style={{ margin: '0 0 14px', fontSize: 20 }}>Report a Defect (Punch List)</h2>
      <form className="card" onSubmit={submit} style={{ maxWidth: 620 }}>
        {ok && <div className="ok">{ok}</div>}
        {err && <div className="err">{err}</div>}
        <div className="row">
          <label><span>Project code</span>
            <input list="proj" style={inp} value={form.project_code} onChange={set('project_code')} placeholder="e.g. SEED-5MW" required />
            <datalist id="proj">{projects.map(p => <option key={p} value={p} />)}</datalist></label>
          <label><span>Site</span><input style={inp} value={form.site_name} onChange={set('site_name')} placeholder="e.g. Pokaran Block-A" required /></label>
        </div>
        <label><span>Title</span><input style={inp} value={form.title} onChange={set('title')} placeholder="Short summary of the defect" required /></label>
        <label><span>Description</span><textarea rows={3} style={inp} value={form.description} onChange={set('description')} placeholder="What is wrong, where exactly" /></label>
        <div className="row">
          <label><span>Discipline</span><select style={inp} value={form.discipline} onChange={set('discipline')}>{DISCIPLINE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <label><span>Severity</span><select style={inp} value={form.severity} onChange={set('severity')}>{SEVERITY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        </div>
        <label><span>Work scope / package</span>
          <input list="scopeopt" style={inp} value={form.work_package} onChange={set('work_package')} placeholder="link to a work package (optional)" />
          <datalist id="scopeopt">{scope.map(s => <option key={s.id} value={s.name} />)}</datalist></label>
        <label><span>Photo (evidence)</span><input type="file" accept="image/*" capture="environment" onChange={e => setPhoto(e.target.files?.[0] || null)} style={{ ...inp, padding: 8 }} /></label>
        <label><span>Location (geo-tag)</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" onClick={capture} style={{ width: 'auto', padding: '9px 14px', margin: 0, background: '#0d2a4a' }}>📍 Capture</button>
            <span className="muted">{geo ? `${geo.latitude}, ${geo.longitude}` : 'not captured'}</span>
          </div></label>
        <button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Log defect'}</button>
      </form>
    </Nav>
  )
}

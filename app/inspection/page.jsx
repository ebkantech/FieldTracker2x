'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'

const today = () => new Date().toISOString().slice(0, 10)

// Mirrors solar_engine/quality.py CHECKPOINT_TEMPLATES
const TEMPLATES = {
  torque_check: { label: 'Torque check', rows: [
    ['MMS purlin bolt torque', 'as per MMS datasheet', 'Nm'],
    ['Module clamp torque', '16-18', 'Nm'],
    ['Earthing bolt torque', 'as per spec', 'Nm'],
    ['Rafter-to-column bolt torque', 'as per spec', 'Nm'],
  ] },
  megger_test: { label: 'Megger / insulation resistance', rows: [
    ['Insulation resistance DC+ to earth', '> 1', 'MΩ'],
    ['Insulation resistance DC- to earth', '> 1', 'MΩ'],
    ['Insulation resistance AC phase to earth', '> 1', 'MΩ'],
    ['Test voltage applied', '500/1000', 'V'],
  ] },
  earthing_continuity: { label: 'Earthing continuity', rows: [
    ['Earth pit resistance', '< 1', 'Ω'],
    ['MMS earthing continuity', '< 1', 'Ω'],
    ['Inverter body continuity', '< 1', 'Ω'],
    ['LA / earthing grid continuity', '< 1', 'Ω'],
  ] },
  iv_curve: { label: 'IV-curve tracing', rows: [
    ['String Isc', 'within ±5% of rated', 'A'],
    ['String Voc', 'within ±5% of rated', 'V'],
    ['Pmax deviation', '< 5', '%'],
    ['Fill factor', '> 0.70', ''],
  ] },
  pre_commissioning: { label: 'Pre-commissioning', rows: [
    ['String polarity check', 'correct', ''],
    ['Open-circuit voltage per string', 'within range', 'V'],
    ['Inverter parameter configuration', 'as per design', ''],
    ['SCADA / monitoring communication', 'online', ''],
    ['Protection & relay settings', 'as per design', ''],
  ] },
  general: { label: 'General inspection', rows: [['Visual inspection', 'no defect', '']] },
}

const freshRows = (type) => TEMPLATES[type].rows.map(([parameter, spec, unit]) =>
  ({ parameter, spec, unit, measured: '', result: 'na', remark: '' }))

export default function Inspection() {
  const [vendor, setVendor] = useState(null)
  const [scope, setScope] = useState([])
  const [form, setForm] = useState({ project_code: '', site_name: '', inspection_date: today(), work_package: '', inspection_type: 'megger_test', note: '' })
  const [rows, setRows] = useState(freshRows('megger_test'))
  const [photo, setPhoto] = useState(null)
  const [geo, setGeo] = useState(null)
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState(''); const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(d => setVendor(d.vendor || null))
    fetch('/api/portal/work-scope').then(r => r.json()).then(d => setScope(d.work_scope || [])).catch(() => {})
  }, [])

  const setType = (t) => { setForm(f => ({ ...f, inspection_type: t })); setRows(freshRows(t)) }
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setRow = (i, k) => (e) => setRows(rs => rs.map((r, j) => j === i ? { ...r, [k]: e.target.value } : r))

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
      fd.append('inspection_date', form.inspection_date)
      fd.append('inspection_type', form.inspection_type)
      if (wp) fd.append('work_package_id', wp.id)
      fd.append('note', form.note)
      fd.append('reporter_name', vendor?.contact_person || vendor?.company_name || '')
      fd.append('checkpoints', JSON.stringify(rows))
      if (geo) { fd.append('latitude', geo.latitude); fd.append('longitude', geo.longitude) }
      if (photo) fd.append('photo', photo)
      const res = await fetch('/api/inspection', { method: 'POST', body: fd })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Submission failed.')
      const r = d.inspection
      setOk(`Inspection recorded — ${r.inspection_type_display}: ${r.status.toUpperCase()} (${r.rollup.passed}/${r.rollup.total} passed).`)
      setRows(freshRows(form.inspection_type)); setPhoto(null); setGeo(null); setForm(f => ({ ...f, note: '' }))
    } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }

  const projects = Array.from(new Set(scope.map(s => s.project_code).filter(Boolean)))
  const inp = { width: '100%', padding: '11px 12px', fontSize: 15, border: '1px solid #d8e2ee', borderRadius: 10 }
  const sInp = { width: '100%', padding: '8px 9px', fontSize: 13, border: '1px solid #d8e2ee', borderRadius: 8 }

  return (
    <Nav>
      <h2 style={{ margin: '0 0 14px', fontSize: 20 }}>QA / Testing Inspection</h2>
      <form className="card" onSubmit={submit} style={{ maxWidth: 760 }}>
        {ok && <div className="ok">{ok}</div>}
        {err && <div className="err">{err}</div>}
        <div className="row">
          <label><span>Project code</span>
            <input list="proj" style={inp} value={form.project_code} onChange={set('project_code')} placeholder="e.g. SEED-5MW" required />
            <datalist id="proj">{projects.map(p => <option key={p} value={p} />)}</datalist></label>
          <label><span>Site / substation</span><input style={inp} value={form.site_name} onChange={set('site_name')} placeholder="e.g. Pokaran Block-A" required /></label>
        </div>
        <div className="row">
          <label><span>Inspection type</span>
            <select style={inp} value={form.inspection_type} onChange={e => setType(e.target.value)}>
              {Object.entries(TEMPLATES).map(([v, t]) => <option key={v} value={v}>{t.label}</option>)}
            </select></label>
          <label><span>Date</span><input type="date" style={inp} value={form.inspection_date} onChange={set('inspection_date')} required /></label>
        </div>
        <label><span>Work scope / package</span>
          <input list="scopeopt" style={inp} value={form.work_package} onChange={set('work_package')} placeholder="link to a work package (optional)" />
          <datalist id="scopeopt">{scope.map(s => <option key={s.id} value={s.name} />)}</datalist></label>

        <div style={{ marginTop: 6, border: '1px solid #eef2f7', borderRadius: 10, overflow: 'hidden' }}>
          <table className="ptable" style={{ width: '100%' }}>
            <thead><tr><th>Parameter</th><th>Spec</th><th>Measured</th><th>Unit</th><th>Result</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{r.parameter}</td>
                  <td className="muted">{r.spec}</td>
                  <td><input style={sInp} value={r.measured} onChange={setRow(i, 'measured')} inputMode="decimal" /></td>
                  <td className="muted">{r.unit}</td>
                  <td>
                    <select style={sInp} value={r.result} onChange={setRow(i, 'result')}>
                      <option value="na">—</option><option value="pass">Pass</option><option value="fail">Fail</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint" style={{ textAlign: 'left' }}>Status is derived automatically: any <strong>Fail</strong> → inspection failed; all <strong>Pass</strong> → passed.</p>

        <label><span>Photo (evidence)</span><input type="file" accept="image/*" capture="environment" onChange={e => setPhoto(e.target.files?.[0] || null)} style={{ ...inp, padding: 8 }} /></label>
        <label><span>Location (geo-tag)</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" onClick={capture} style={{ width: 'auto', padding: '9px 14px', margin: 0, background: '#0d2a4a' }}>📍 Capture</button>
            <span className="muted">{geo ? `${geo.latitude}, ${geo.longitude}` : 'not captured'}</span>
          </div></label>
        <label><span>Note</span><textarea rows={2} style={inp} value={form.note} onChange={set('note')} placeholder="Optional remarks" /></label>
        <button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit inspection'}</button>
      </form>
    </Nav>
  )
}

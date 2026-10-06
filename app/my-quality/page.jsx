'use client'
import { Shell, usePortal } from '@/components/Page'

const INS = { passed: '#0a8a4a', failed: '#c0392b', pending: '#0d5cab' }
const SEV = { low: '#0d5cab', medium: '#c87f0a', high: '#c87f0a', critical: '#c0392b' }

export default function MyQuality() {
  const { data, err, loading } = usePortal('quality')
  return (
    <Shell title="My QA & Defects">
      {loading && <p className="muted">Loading…</p>}{err && <div className="err">{err}</div>}
      {data && (<>
        <div className="grid">
          <div className="tile"><div className="k">Inspections</div><div className="val">{(data.inspections || []).length}</div></div>
          <div className="tile"><div className="k">Failed</div><div className="val" style={{ color: '#c0392b' }}>{data.failed_inspections}</div></div>
          <div className="tile"><div className="k">Open defects</div><div className="val" style={{ color: '#c87f0a' }}>{data.open_defects}</div></div>
        </div>

        <div className="panel"><h3>QA Inspections</h3>
          <table className="ptable"><thead><tr><th>Type</th><th>Site</th><th>Work package</th><th>Date</th><th>Checks</th><th>Result</th></tr></thead>
            <tbody>
              {(data.inspections || []).length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#6b7a90', padding: 16 }}>No inspections.</td></tr>}
              {(data.inspections || []).map(i => (
                <tr key={i.id}>
                  <td><strong>{i.inspection_type_display}</strong></td><td>{i.site_name}</td>
                  <td>{i.work_package || '—'}</td><td>{i.inspection_date}</td>
                  <td>{i.rollup.passed}/{i.rollup.total}</td>
                  <td><span className="pill" style={{ background: '#eef2f7', color: INS[i.status] || '#0d5cab' }}>{i.status_display}</span></td>
                </tr>
              ))}
            </tbody></table></div>

        <div className="panel"><h3>Punch List (defects on your scope)</h3>
          <table className="ptable"><thead><tr><th>Code</th><th>Title</th><th>Discipline</th><th>Severity</th><th>Raised</th><th>Status</th></tr></thead>
            <tbody>
              {(data.punch_items || []).length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#6b7a90', padding: 16 }}>No defects.</td></tr>}
              {(data.punch_items || []).map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.code}</td><td><strong>{p.title}</strong></td>
                  <td>{p.discipline_display}</td>
                  <td><span className="pill" style={{ background: '#eef2f7', color: SEV[p.severity] || '#0d5cab' }}>{p.severity_display}</span></td>
                  <td>{p.raised_on}</td><td><span className="pill">{p.status_display}</span></td>
                </tr>
              ))}
            </tbody></table></div>
      </>)}
    </Shell>
  )
}

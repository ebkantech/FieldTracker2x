'use client'
import { Shell, usePortal } from '@/components/Page'
export default function WorkScope() {
  const { data, err, loading } = usePortal('work-scope')
  return (
    <Shell title="Work Scope & Milestones">
      {loading && <p className="muted">Loading…</p>}{err && <div className="err">{err}</div>}
      {data && (
        <div className="panel"><h3>Assigned work packages</h3>
          <table className="ptable"><thead><tr><th>Project</th><th>Stage</th><th>Work package</th><th>Planned</th><th>Status</th><th>Progress</th></tr></thead>
          <tbody>{(data.work_scope || []).length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#6b7a90', padding: 20 }}>No work assigned.</td></tr>}
          {(data.work_scope || []).map(w => (<tr key={w.id}><td>{w.project_code}</td><td>{w.stage}</td><td>{w.name}</td>
            <td>{w.planned_start || '—'} → {w.planned_end || '—'}</td><td><span className="pill">{(w.status||'').replace('_',' ')}</span></td>
            <td style={{ minWidth: 120 }}><div className="bar"><div style={{ width: `${w.progress_percent}%` }} /></div><span style={{ fontSize: 11 }}>{Math.round(w.progress_percent)}%</span></td></tr>))}
          </tbody></table></div>
      )}
    </Shell>
  )
}

'use client'
import { Shell, usePortal } from '@/components/Page'
export default function Sites() {
  const { data, err, loading } = usePortal('sites')
  return (
    <Shell title="Sites & Location">
      {loading && <p className="muted">Loading…</p>}{err && <div className="err">{err}</div>}
      {data && (
        <div className="panel"><h3>Scoped sites (geo-tagged from the field)</h3>
          <table className="ptable"><thead><tr><th>Site</th><th>Progress</th><th>Last update</th><th>Location</th></tr></thead>
          <tbody>{(data.sites||[]).length===0 && <tr><td colSpan={4} style={{textAlign:'center',color:'#6b7a90',padding:16}}>No sites yet.</td></tr>}
          {(data.sites||[]).map((s,i)=>(<tr key={i}><td><strong>{s.site_name}</strong></td>
            <td style={{minWidth:120}}><div className="bar"><div style={{width:`${s.progress_percent}%`}}/></div></td>
            <td>{s.last_update||'—'}</td>
            <td>{s.latitude!=null?<a href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`} target="_blank" rel="noreferrer">📍 {s.latitude.toFixed(4)}, {s.longitude?.toFixed(4)}</a>:'—'}</td></tr>))}
          </tbody></table></div>
      )}
    </Shell>
  )
}

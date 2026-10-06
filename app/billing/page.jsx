'use client'
import { Shell, usePortal, money } from '@/components/Page'
const LBL = { pending:'Pending', eligible:'Eligible', invoiced:'Invoiced', approved:'Approved', paid:'Paid', on_hold:'On hold' }
export default function Billing() {
  const { data, err, loading } = usePortal('billing')
  const s = data?.summary
  return (
    <Shell title="Billing">
      {loading && <p className="muted">Loading…</p>}{err && <div className="err">{err}</div>}
      {data && (<>
        {s && <div className="grid">
          <div className="tile"><div className="k">Total</div><div className="val">₹{money(s.total)}</div></div>
          <div className="tile"><div className="k">Approved</div><div className="val">₹{money(s.approved)}</div></div>
          <div className="tile"><div className="k">Paid</div><div className="val" style={{color:'#0a8a4a'}}>₹{money(s.paid)}</div></div>
          <div className="tile"><div className="k">Outstanding</div><div className="val" style={{color:'#c87f0a'}}>₹{money(s.outstanding)}</div></div>
          <div className="tile"><div className="k">Pending</div><div className="val">₹{money(s.pending)}</div></div>
          <div className="tile"><div className="k">Retention held</div><div className="val">₹{money(s.retention_held)}</div></div>
        </div>}
        <div className="panel"><h3>Milestones</h3>
          <table className="ptable"><thead><tr><th>Milestone</th><th>Project</th><th>Work scope</th><th>Net payable</th><th>Retention</th><th>Status</th></tr></thead>
          <tbody>{(data.milestones||[]).length===0 && <tr><td colSpan={6} style={{textAlign:'center',color:'#6b7a90',padding:16}}>No milestones.</td></tr>}
          {(data.milestones||[]).map(m=>(<tr key={m.id}><td><strong>{m.name}</strong></td><td>{m.project_code}</td><td>{m.work_package_name}</td><td>₹{money(m.net_payable)}</td><td>₹{money(m.retention_amount)}</td><td><span className="pill">{LBL[m.status]||m.status}</span></td></tr>))}
          </tbody></table></div>
      </>)}
    </Shell>
  )
}

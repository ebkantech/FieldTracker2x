'use client'
import { Shell, usePortal, money } from '@/components/Page'
export default function Materials() {
  const { data, err, loading } = usePortal('materials')
  const rows = data?.materials || []
  const live = rows.filter(r => r.live)
  return (
    <Shell title="Materials">
      {loading && <p className="muted">Loading…</p>}{err && <div className="err">{err}</div>}
      {data && (<>
        <div className="panel"><h3>Live — ordered &amp; pending delivery ({live.length})</h3>
          <table className="ptable"><thead><tr><th>PO No</th><th>Material</th><th>Unit</th><th>Ordered</th><th>Delivered</th><th>Pending</th><th>Status</th></tr></thead>
          <tbody>{live.length === 0 && <tr><td colSpan={7} style={{textAlign:'center',color:'#6b7a90',padding:16}}>Nothing pending.</td></tr>}
          {live.map((r,i) => (<tr key={i}><td>{r.po_number}</td><td>{r.material_name}</td><td>{r.unit}</td><td>{r.ordered_quantity}</td><td>{r.delivered_quantity}</td><td><strong>{r.pending_quantity}</strong></td><td><span className="pill">{(r.item_status||'').replace('_',' ')}</span></td></tr>))}
          </tbody></table></div>
        <div className="panel"><h3>All material history ({rows.length})</h3>
          <table className="ptable"><thead><tr><th>PO No</th><th>Material</th><th>Ordered</th><th>Delivered</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{rows.map((r,i) => (<tr key={i}><td>{r.po_number}</td><td>{r.material_name}</td><td>{r.ordered_quantity}</td><td>{r.delivered_quantity}</td><td>₹{money(r.total_amount)}</td><td><span className="pill">{(r.item_status||'').replace('_',' ')}</span></td></tr>))}</tbody></table></div>
      </>)}
    </Shell>
  )
}

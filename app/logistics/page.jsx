'use client'
import { Shell, usePortal } from '@/components/Page'
export default function Logistics() {
  const { data, err, loading } = usePortal('logistics')
  return (
    <Shell title="Logistics">
      {loading && <p className="muted">Loading…</p>}{err && <div className="err">{err}</div>}
      {data && (<>
        <div className="panel"><h3>Vehicles in transit &amp; history</h3>
          <table className="ptable"><thead><tr><th>PO No</th><th>Vehicle</th><th>Transporter</th><th>LR</th><th>From → To</th><th>Dispatch</th><th>ETA</th><th>Status</th><th>GPS</th></tr></thead>
          <tbody>{(data.vehicles||[]).length===0 && <tr><td colSpan={9} style={{textAlign:'center',color:'#6b7a90',padding:16}}>No vehicle movements.</td></tr>}
          {(data.vehicles||[]).map((v,i)=>(<tr key={i}><td>{v.po_number}</td><td><strong>{v.vehicle_number}</strong></td><td>{v.transporter||'—'}</td><td>{v.lr_number||'—'}</td><td style={{fontSize:12}}>{v.from||'—'} → {v.to||'—'}</td><td>{v.dispatch_date||'—'}</td><td>{v.expected_arrival||'—'}</td><td><span className="pill">{(v.status||'').replace('_',' ')}</span></td><td>{v.gps_link?<a href={v.gps_link} target="_blank" rel="noreferrer">track</a>:'—'}</td></tr>))}
          </tbody></table></div>
        <div className="panel"><h3>Deliveries</h3>
          <table className="ptable"><thead><tr><th>PO No</th><th>Ref</th><th>Date</th><th>Qty</th><th>Location</th><th>Received by</th><th>Status</th></tr></thead>
          <tbody>{(data.deliveries||[]).length===0 && <tr><td colSpan={7} style={{textAlign:'center',color:'#6b7a90',padding:16}}>No deliveries.</td></tr>}
          {(data.deliveries||[]).map((d,i)=>(<tr key={i}><td>{d.po_number}</td><td>{d.reference}</td><td>{d.delivery_date}</td><td>{d.delivered_quantity}</td><td>{d.location||'—'}</td><td>{d.received_by||'—'}</td><td><span className="pill">{(d.status||'').replace('_',' ')}</span></td></tr>))}
          </tbody></table></div>
      </>)}
    </Shell>
  )
}

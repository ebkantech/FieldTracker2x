'use client'
import { Shell, usePortal, money } from '@/components/Page'

export default function Dashboard() {
  const { data, err, loading } = usePortal('dashboard')
  return (
    <Shell title="Dashboard">
      {loading && <p className="muted">Loading…</p>}
      {err && <div className="err">{err}</div>}
      {data && (
        <>
          <div className="grid">
            <div className="tile"><div className="k">Work progress</div><div className="val">{data.work_progress_percent}%</div>
              <div className="bar" style={{ marginTop: 8 }}><div style={{ width: `${data.work_progress_percent}%` }} /></div></div>
            <div className="tile"><div className="k">Total billing</div><div className="val">₹{money(data.billing?.total)}</div></div>
            <div className="tile"><div className="k">Paid</div><div className="val" style={{ color: '#0a8a4a' }}>₹{money(data.billing?.paid)}</div></div>
            <div className="tile"><div className="k">Outstanding</div><div className="val" style={{ color: '#c87f0a' }}>₹{money(data.billing?.outstanding)}</div></div>
            <div className="tile"><div className="k">Retention held</div><div className="val">₹{money(data.billing?.retention_held)}</div></div>
            <div className="tile"><div className="k">Purchase orders</div><div className="val">{data.po_count}</div></div>
            <div className="tile"><div className="k">PO value</div><div className="val">₹{money(data.po_value)}</div></div>
            <div className="tile"><div className="k">Work packages</div><div className="val">{data.work_packages}</div></div>
          </div>
          <div className="panel">
            <h3>Authorised contact</h3>
            <table className="ptable"><tbody>
              <tr><th>Company</th><td>{data.vendor?.company_name}</td></tr>
              <tr><th>Vendor code</th><td>{data.vendor?.vendor_id}</td></tr>
              <tr><th>Contact person</th><td>{data.vendor?.contact_person || '—'}</td></tr>
              <tr><th>Mobile</th><td>{data.vendor?.mobile_number || '—'}</td></tr>
              <tr><th>Email</th><td>{data.vendor?.email_id || '—'}</td></tr>
              <tr><th>GST</th><td>{data.vendor?.gst_no || '—'}</td></tr>
              <tr><th>Sites</th><td>{(data.sites || []).join(', ') || '—'}</td></tr>
            </tbody></table>
          </div>
        </>
      )}
    </Shell>
  )
}

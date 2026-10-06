// Server-side proxy: holds the field token and fetches a vendor's milestones
// + billing summary from OmegaERP for the vendor portal.
import { NextResponse } from 'next/server'

export async function GET(request) {
  const base = process.env.ERP_API_BASE
  const token = process.env.FIELD_INGEST_TOKEN
  if (!base || !token) {
    return NextResponse.json({ error: 'Portal is not configured.' }, { status: 503 })
  }
  const vendorId = request.nextUrl.searchParams.get('vendor_id')
  if (!vendorId) return NextResponse.json({ error: 'vendor_id is required.' }, { status: 400 })
  try {
    const res = await fetch(`${base}/api/solar/field/vendor-billing/?vendor_id=${encodeURIComponent(vendorId)}`,
      { headers: { 'X-Field-Token': token } })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Could not reach the ERP backend.' }, { status: 502 })
  }
}

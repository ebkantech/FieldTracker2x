import { cookies } from 'next/headers'

export function erpConfig() {
  return { base: process.env.ERP_API_BASE, token: process.env.FIELD_INGEST_TOKEN }
}
export function sessionVendor() {
  const c = cookies().get('vendor')
  if (!c) return null
  try { return JSON.parse(c.value) } catch { return null }
}
// Server-side GET to a vendor-scoped ERP portal endpoint for the logged-in vendor.
export async function erpGet(path) {
  const { base, token } = erpConfig()
  const v = sessionVendor()
  if (!base || !token) return { status: 503, data: { error: 'Portal not configured.' } }
  if (!v) return { status: 401, data: { error: 'Not signed in.' } }
  const res = await fetch(`${base}/api/solar/portal/${path}/?vendor_id=${encodeURIComponent(v.id)}`,
    { headers: { 'X-Field-Token': token }, cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { erpConfig, sessionVendor } from '@/app/lib/erp'

export async function GET() {
  const v = sessionVendor()
  return NextResponse.json({ vendor: v })
}
export async function POST(request) {
  const { base, token } = erpConfig()
  if (!base || !token) return NextResponse.json({ error: 'Portal not configured.' }, { status: 503 })
  const body = await request.json().catch(() => ({}))
  const res = await fetch(`${base}/api/solar/portal/auth/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Field-Token': token },
    body: JSON.stringify({ code: (body.code || '').trim() }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) return NextResponse.json(data, { status: res.status })
  const resp = NextResponse.json({ vendor: data.vendor })
  resp.cookies.set('vendor', JSON.stringify(data.vendor), {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12,
  })
  return resp
}
export async function DELETE() {
  const resp = NextResponse.json({ ok: true })
  resp.cookies.set('vendor', '', { httpOnly: true, path: '/', maxAge: 0 })
  return resp
}

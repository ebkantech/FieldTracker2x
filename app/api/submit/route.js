// Server-side proxy: holds the field-ingest token (never exposed to the
// browser) and forwards a daily-progress submission to the OmegaERP backend.
import { NextResponse } from 'next/server'

export async function POST(request) {
  const base = process.env.ERP_API_BASE
  const token = process.env.FIELD_INGEST_TOKEN
  if (!base || !token) {
    return NextResponse.json(
      { error: 'Portal is not configured (ERP_API_BASE / FIELD_INGEST_TOKEN).' },
      { status: 503 },
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  try {
    const res = await fetch(`${base}/api/solar/field/ingest/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Field-Token': token },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: 'Could not reach the ERP backend.' }, { status: 502 })
  }
}

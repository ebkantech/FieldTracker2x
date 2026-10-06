// Server-side proxy: holds the field token and forwards a daily-progress
// submission (multipart: fields + optional photo + geo) to OmegaERP.
import { NextResponse } from 'next/server'

export async function POST(request) {
  const base = process.env.ERP_API_BASE
  const token = process.env.FIELD_INGEST_TOKEN
  if (!base || !token) {
    return NextResponse.json({ error: 'Portal is not configured.' }, { status: 503 })
  }
  let form
  try {
    form = await request.formData()
  } catch {
    // fall back to JSON body
    const body = await request.json().catch(() => ({}))
    form = new FormData()
    Object.entries(body).forEach(([k, v]) => form.append(k, v))
  }
  try {
    const res = await fetch(`${base}/api/solar/field/ingest/`, {
      method: 'POST',
      headers: { 'X-Field-Token': token }, // let fetch set multipart boundary
      body: form,
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Could not reach the ERP backend.' }, { status: 502 })
  }
}

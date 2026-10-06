import { NextResponse } from 'next/server'
import { erpGet } from '@/app/lib/erp'

const ALLOWED = new Set(['dashboard', 'work-scope', 'po-history', 'materials', 'logistics', 'sites', 'profile', 'billing'])

export async function GET(request, { params }) {
  const path = params.path
  if (!ALLOWED.has(path)) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  const { status, data } = await erpGet(path)
  return NextResponse.json(data, { status })
}

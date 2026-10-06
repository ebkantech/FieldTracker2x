'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const router = useRouter()
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Login failed.')
      router.replace('/dashboard')
    } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }
  return (
    <div className="wrap">
      <div className="brand"><span style={{ fontSize: 26 }}>🏗️</span>
        <div><h1>Vendor / Subcontractor Portal</h1><p>Sign in with your vendor code</p></div></div>
      <form className="card" onSubmit={submit}>
        {err && <div className="err">{err}</div>}
        <label><span>Vendor / Subcontractor code</span>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. VPF001" required autoCapitalize="characters" /></label>
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="hint">Your code is issued by the project admin.</p>
      </form>
    </div>
  )
}

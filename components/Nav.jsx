'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

const LINKS = [
  ['/dashboard', 'Dashboard', '📊'],
  ['/work-scope', 'Work Scope & Milestones', '🧱'],
  ['/billing', 'Billing', '💳'],
  ['/pos', 'Purchase Orders', '🧾'],
  ['/materials', 'Materials', '📦'],
  ['/logistics', 'Logistics', '🚚'],
  ['/sites', 'Sites & Location', '📍'],
  ['/', 'Submit Progress', '🛠️'],
]

export default function Nav({ children }) {
  const [vendor, setVendor] = useState(undefined)
  const [open, setOpen] = useState(false)
  const path = usePathname()
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(d => {
      if (!d.vendor) { router.replace('/login'); return }
      setVendor(d.vendor)
    }).catch(() => router.replace('/login'))
  }, [path])

  const logout = async () => { await fetch('/api/auth', { method: 'DELETE' }); router.replace('/login') }
  if (vendor === undefined) return <div style={{ padding: 40, textAlign: 'center', color: '#6b7a90' }}>Loading…</div>

  return (
    <div className="shell">
      <aside className={`side ${open ? 'open' : ''}`}>
        <div className="side-brand">
          <span style={{ fontSize: 22 }}>🏗️</span>
          <div><p className="side-title">Vendor Portal</p><p className="side-sub">{vendor?.company_name}</p></div>
        </div>
        <nav className="side-nav">
          {LINKS.map(([href, label, icon]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`side-link ${path === href ? 'active' : ''}`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <button className="side-logout" onClick={logout}>Sign out</button>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="burger" onClick={() => setOpen(o => !o)}>☰</button>
          <div>
            <strong>{vendor?.company_name}</strong>
            <span className="muted"> · {vendor?.vendor_id}</span>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}

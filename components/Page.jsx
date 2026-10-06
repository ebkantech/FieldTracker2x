'use client'
import { useEffect, useState } from 'react'
import Nav from './Nav'

export function usePortal(path) {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch(`/api/portal/${path}`).then(async r => {
      const d = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(d.error || 'Could not load.')
      setData(d)
    }).catch(e => setErr(e.message)).finally(() => setLoading(false))
  }, [path])
  return { data, err, loading }
}
export function Shell({ title, children }) {
  return <Nav><h2 style={{ margin: '0 0 14px', fontSize: 20 }}>{title}</h2>{children}</Nav>
}
export const money = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

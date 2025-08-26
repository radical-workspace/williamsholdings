"use client"
import React, { useEffect, useState } from 'react'

export default function AdminCardRequests(){
  const [reqs, setReqs] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/admin/cards/list').then(r => r.json()).then(j => setReqs(j.requests || []))
  }, [])

  async function update(id:string, action:'approve'|'reject'){
    await fetch('/api/admin/cards/update', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id, action }) })
    const j = await (await fetch('/api/admin/cards/list')).json()
    setReqs(j.requests || [])
  }

  return (
    <div>
      <h1>Card requests</h1>
      {reqs.length === 0 && <p>No requests</p>}
      <ul className="space-y-3">
        {reqs.map(r => (
          <li key={r.id} className="card">
            <div><strong>{r.name}</strong> — {r.address}</div>
            <div>Status: {r.status}</div>
            <div className="mt-2 flex gap-2">
              <button className="btn btn-primary" onClick={() => update(r.id, 'approve')}>Approve</button>
              <button className="btn btn-ghost" onClick={() => update(r.id, 'reject')}>Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

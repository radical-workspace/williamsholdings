"use client"
import React, { useEffect, useState } from 'react'
import AdminConfirmModal from '@/components/AdminConfirmModal'

export default function AdminDepositsPage(){
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'approve'|'reject'|null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load(){
    try{
      setLoading(true)
      const res = await fetch('/api/admin/deposits/list')
      const j = await res.json()
      setItems(j.items || [])
    }finally{ setLoading(false) }
  }

  function onActionClick(id:string, action:'approve'|'reject'){
    setConfirmId(id)
    setConfirmAction(action)
    setConfirmOpen(true)
  }

  async function doAction(){
    if (!confirmId || !confirmAction) return
    setLoading(true)
    try{
      const resp = await fetch('/api/admin/deposits/update', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: confirmId, action: confirmAction }) })
      const j = await resp.json()
      if (!resp.ok) throw new Error(j?.error || 'failed')
      await load()
    }catch(e:any){
      alert('Action failed: ' + (e?.message || String(e)))
    }finally{
      setLoading(false)
      setConfirmOpen(false)
      setConfirmAction(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Deposit requests</h1>
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
        </header>

        {items.length === 0 && !loading && <p className="text-gray-600">No deposits</p>}

        <ul className="space-y-3">
          {items.map(i => (
            <li key={i.id} className="bg-white p-4 rounded shadow-sm flex items-center justify-between">
              <div>
                <div className="font-mono text-sm text-gray-700">{i.reference || i.id}</div>
                <div className="text-lg font-medium">{i.amount} {i.currency}</div>
                <div className="text-sm text-gray-500">Status: <span className="font-medium">{i.status}</span></div>
                <div className="text-xs text-gray-400 mt-1">User: {i.user_id}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => onActionClick(i.id, 'approve')}>Approve</button>
                <button className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded" onClick={() => onActionClick(i.id, 'reject')}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <AdminConfirmModal open={confirmOpen} title={confirmAction === 'approve' ? 'Approve deposit' : 'Reject deposit'} message={`Are you sure you want to ${confirmAction} this deposit?`} confirmLabel={confirmAction === 'approve' ? 'Approve' : 'Reject'} onConfirm={doAction} onCancel={() => setConfirmOpen(false)} loading={loading} />
    </div>
  )
}

"use client"
import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import AdminConfirmModal from '@/components/AdminConfirmModal'
import AdminNoteModal from '@/components/AdminNoteModal'

export default function AdminWithdrawsPage(){
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'approve'|'reject'|null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [noteOpen, setNoteOpen] = useState(false)
  const [pendingNoteFor, setPendingNoteFor] = useState<{id:string, action:'approve'|'reject'} | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => { load() }, [])

  async function load(){
    try{
      setLoading(true)
      const res = await fetch('/api/admin/withdraws/list_all')
      const j = await res.json()
      setItems(j || [])
    }finally{ setLoading(false) }
  }

  function onActionClick(id:string, action:'approve'|'reject'){
  setPendingNoteFor({ id, action })
  setNoteOpen(true)
  }

  async function doAction(){
    if (!confirmId || !confirmAction) return
    setLoading(true)
    try{
  const resp = await fetch('/api/admin/withdraws/approve', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: confirmId, action: confirmAction, note: '' }) })
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
          <h1 className="text-2xl font-semibold">Withdraw requests</h1>
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
        </header>

        <div className="mb-4 flex items-center gap-3">
          <TextField size="small" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by user id or reference" label="Search" />
          <Button variant="outlined" size="small" onClick={() => setQuery('')}>Clear</Button>
        </div>

        {items.length === 0 && !loading && <p className="text-gray-600">No withdraws</p>}

        <ul className="space-y-3">
          {items.filter(i => !query || String(i.user_id).includes(query) || String(i.reference || '').includes(query)).map(i => (
            <li key={i.id} className="bg-white p-4 rounded shadow-sm flex items-center justify-between">
              <div>
                <div className="font-mono text-sm text-gray-700">{i.reference || i.id}</div>
                <div className="text-lg font-medium">{i.amount} {i.currency}</div>
                <div className="text-sm text-gray-500">Status: <span className="font-medium">{i.status}</span></div>
                <div className="mt-2">
                  <Stack direction="row" spacing={1}>
                    {i.status === 'pending' && <Chip label="Pending" size="small" color="warning" />}
                    {i.status === 'approved' && <Chip label="Approved" size="small" color="success" />}
                    {i.status === 'rejected' && <Chip label="Rejected" size="small" color="error" />}
                  </Stack>
                </div>
                <div className="text-xs text-gray-400 mt-1">User: {i.user_id} • {new Date(i.created_at || i.processed_at || Date.now()).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="contained" color="success" size="small" onClick={() => onActionClick(i.id, 'approve')}>Approve</Button>
                <Button variant="outlined" color="error" size="small" onClick={() => onActionClick(i.id, 'reject')}>Reject</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <AdminConfirmModal open={confirmOpen} title={confirmAction === 'approve' ? 'Approve withdraw' : 'Reject withdraw'} message={`Are you sure you want to ${confirmAction} this withdraw?`} confirmLabel={confirmAction === 'approve' ? 'Approve' : 'Reject'} onConfirm={doAction} onCancel={() => setConfirmOpen(false)} loading={loading} />
      <AdminNoteModal open={noteOpen} title={pendingNoteFor?.action === 'approve' ? 'Add note before approving' : 'Add note before rejecting'} onCancel={() => { setNoteOpen(false); setPendingNoteFor(null) }} onConfirm={async (note?:string) => {
        if (!pendingNoteFor) return
        setConfirmId(pendingNoteFor.id)
        setConfirmAction(pendingNoteFor.action)
        setNoteOpen(false)
        setConfirmOpen(true)
        try{
          setLoading(true)
          const resp = await fetch('/api/admin/withdraws/approve', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: pendingNoteFor.id, action: pendingNoteFor.action, note }) })
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
          setPendingNoteFor(null)
        }
      }} loading={loading} />
    </div>
  )
}

"use client"
import React, { useState, useEffect } from 'react'

type Props = {
  open: boolean
  title?: string
  loading?: boolean
  onCancel: () => void
  onConfirm: (note?: string) => Promise<void>
}

export default function AdminNoteModal({ open, title, loading, onCancel, onConfirm }: Props){
  const [note, setNote] = useState('')
  useEffect(() => { if (!open) setNote('') }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-4">
        <h3 className="text-lg font-semibold mb-2">{title || 'Admin note'}</h3>
        <textarea className="w-full h-32 p-2 border rounded" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional admin note" />
        <div className="flex justify-end gap-2 mt-3">
          <button className="px-3 py-1 border rounded" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => onConfirm(note)} disabled={loading}>{loading ? 'Working...' : 'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}
"use client"
import React, { useState } from 'react'

type Props = {
  open: boolean
  title?: string
  initialNote?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: (note?: string) => void
  onCancel: () => void
  loading?: boolean
}

export default function AdminNoteModal({ open, title = 'Add note', initialNote = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, loading = false }: Props){
  const [note, setNote] = useState(initialNote)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <textarea value={note} onChange={(e)=>setNote(e.target.value)} className="w-full border p-2 rounded h-28 mb-4" placeholder="Optional admin note" />
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-100 rounded" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => onConfirm(note)} disabled={loading}>{loading ? 'Processing...' : confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

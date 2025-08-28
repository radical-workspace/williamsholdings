"use client"
import React from 'react'

type Props = {
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function AdminConfirmModal({ open, title = 'Confirm', message = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, loading = false }: Props){
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-100 rounded" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onConfirm} disabled={loading}>{loading ? 'Processing...' : confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

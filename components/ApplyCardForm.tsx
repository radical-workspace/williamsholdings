"use client"
import { useState } from 'react'

export default function ApplyCardForm(){
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [cardType, setCardType] = useState<'virtual'|'physical'>('virtual')
  const [purchaseAmount, setPurchaseAmount] = useState<number>(1000)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent){
    e.preventDefault()
    // require address only for physical cards
    if(cardType === 'physical' && !address){
      setError('Delivery address is required for physical cards')
      return
    }

    setLoading(true)
    fetch('/api/cards/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, address: cardType === 'physical' ? address : null, cardType, purchaseAmount }),
    }).then(async r => {
      setLoading(false)
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setError(j?.error || 'Request failed')
        return
      }
      setSubmitted(true)
    }).catch(err => { setLoading(false); setError(String(err)) })
  }

  if(submitted) return (
    <div className="card">
      <h3>Application received</h3>
      <p>Thanks — we&apos;ll review your card application and notify you when it&apos;s ready.</p>
    </div>
  )

  return (
    <form onSubmit={onSubmit} className="card grid gap-3">
      <label>
        Full name
        <input className="input" value={name} onChange={e => setName(e.target.value)} required />
      </label>

      <fieldset className="flex gap-4 items-center">
        <legend className="sr-only">Card type</legend>
        <label className="flex items-center gap-2">
          <input type="radio" name="cardType" value="virtual" checked={cardType === 'virtual'} onChange={() => setCardType('virtual')} />
          Virtual card
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="cardType" value="physical" checked={cardType === 'physical'} onChange={() => setCardType('physical')} />
          Physical card (delivered)
        </label>
      </fieldset>

      <label>
        Purchase amount (USD)
        <input className="input" type="number" value={purchaseAmount} onChange={e => setPurchaseAmount(Number(e.target.value || 0))} min={0} required />
      </label>

      {cardType === 'physical' && (
        <label>
          Delivery address
          <input className="input" value={address} onChange={e => setAddress(e.target.value)} required />
        </label>
      )}

      {error && <div className="text-red-600">{error}</div>}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Submitting…' : 'Apply for Visa'}</button>
        <button type="button" className="btn btn-ghost" onClick={() => { setName(''); setAddress(''); setCardType('virtual'); setPurchaseAmount(1000); setError(null) }}>Reset</button>
      </div>
    </form>
  )
}

import React from 'react'

type Props = {
  holder?: string
  last4?: string
}

export default function CardMock({ holder = 'WILLIAMS HOLDINGS', last4 = '0064' }: Props) {
  return (
    <div className="w-full max-w-sm">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg,#0ea5e9 0%, #059669 100%)',
          color: '#fff',
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>WILLIAMSHOLDINGS</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>VISA</div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 44, height: 34, borderRadius: 6, background: 'rgba(255,255,255,0.9)' }} />
            <div style={{ flex: 1 }} />
          </div>

          <div style={{ marginTop: '1.5rem', fontSize: '1.1rem', letterSpacing: 2 }}>
            **** **** **** {last4}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem' }}>
            <div>{holder}</div>
            <div>12/30</div>
          </div>
        </div>

        <div style={{ padding: '1rem', background: 'transparent' }}>
          <p style={{ margin: 0, color: 'var(--muted)' }}>Tap to activate your physical or virtual Visa card when it arrives.</p>
        </div>
      </div>
    </div>
  )
}

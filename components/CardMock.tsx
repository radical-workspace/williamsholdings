import React from 'react'

type Props = {
  holder?: string
  last4?: string
}

export default function CardMock({ holder = 'WILLIAMS HOLDINGS', last4 = '0064' }: Props) {
  return (
    <div className="w-full max-w-sm">
      <div className="card p-0 overflow-hidden">
        <div className="text-white p-5 card-gradient-bg">
          <div className="flex justify-between items-center">
            <div className="font-extrabold text-sm">WILLIAMSHOLDINGS</div>
            <div className="text-sm opacity-90">VISA</div>
          </div>

          <div className="mt-6 flex items-center">
            <div className="w-11 h-8 rounded-md bg-white/90" />
            <div className="flex-1" />
          </div>

          <div className="mt-6 text-lg tracking-widest">
            **** **** **** {last4}
          </div>

          <div className="flex justify-between mt-4 text-sm">
            <div>{holder}</div>
            <div>12/30</div>
          </div>
        </div>

        <div className="p-4 bg-transparent">
          <p className="m-0 text-[var(--muted)]">Tap to activate your physical or virtual Visa card when it arrives.</p>
        </div>
      </div>
    </div>
  )
}

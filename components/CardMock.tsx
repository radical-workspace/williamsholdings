import React from 'react'

type Props = {
  holder?: string
  last4?: string
}

export default function CardMock({ holder = 'WILLIAMS HOLDINGS', last4 = '0064' }: Props) {
  return (
    <div className="w-full max-w-sm">
      <div className="p-0 overflow-hidden rounded-xl shadow-lg">
        {/* Card face */}
        <div className="p-5 card-gradient-bg text-white rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-sm tracking-wide">WILLIAMSHOLDINGS</div>
            {/* VISA label: fixed red color that does not depend on theme */}
            <div className="text-sm font-semibold text-[#ef4444]">VISA</div>
          </div>

          <div className="mt-6 flex items-center">
            {/* chip */}
            <div className="w-11 h-8 rounded-md bg-yellow-300/95 shadow-inner" />
            <div className="flex-1" />
          </div>

          <div className="mt-6 text-lg tracking-widest font-mono">
            **** **** **** {last4}
          </div>

          <div className="flex justify-between mt-4 text-sm items-end">
            <div className="text-sm font-medium tracking-wide">{holder}</div>
            {/* expiry: fixed blue color not affected by light/dark */}
            <div className="text-sm font-medium text-[#1d4ed8]">12/30</div>
          </div>
        </div>

        {/* Card footer description */}
        <div className="p-4 bg-white/5 rounded-b-xl">
          <p className="m-0 text-[var(--muted)]">Tap to activate your physical or virtual Visa card when it arrives.</p>
        </div>
      </div>
    </div>
  )
}

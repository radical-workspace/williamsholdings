// components/KpiCard.tsx
import { ReactNode } from 'react'

export function KpiCard({
  label,
  value,
  icon,
  tone = 'info',
  actionLabel,
  actionHref,
}: {
  label: string
  value: string | number
  icon?: ReactNode
  tone?: 'info' | 'success' | 'warning' | 'danger'
  actionLabel?: string
  actionHref?: string
}) {
  const toneMap: Record<string, string> = {
    info: 'from-accent/30 to-accent/0',
    success: 'from-success/30 to-success/0',
    warning: 'from-warning/30 to-warning/0',
    danger: 'from-danger/30 to-danger/0',
  }

  return (
    <div
      tabIndex={0}
      className="transform transition-transform hover:translate-y-[1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring rounded-xl border border-muted/60 bg-surface shadow-card"
    >
      <div className="relative">
        <div className={`absolute inset-x-0 -top-px h-1 rounded-t-xl bg-gradient-to-r ${toneMap[tone]}`} />
        <div className="flex items-center justify-between px-4 py-2 border-b border-muted/60">
          <h4 className="text-sm font-medium text-text/80">{label}</h4>
          {actionLabel ? (
            actionHref ? (
              <a href={actionHref} className="text-sm text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1">
                {actionLabel}
              </a>
            ) : (
              <button type="button" className="text-sm text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1">
                {actionLabel}
              </button>
            )
          ) : null}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
              <p className="text-xs text-text/50 md:hidden">{label}</p>
            </div>
            <div className="opacity-70">{icon}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

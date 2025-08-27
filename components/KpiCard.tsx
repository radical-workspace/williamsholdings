// components/KpiCard.tsx
import { ReactNode } from "react";

export function KpiCard({
  label, value, icon, tone = "info",
}: { label:string; value:string|number; icon?:ReactNode; tone?: "info"|"success"|"warning"|"danger"; }) {
  const toneMap = {
    info: "from-accent/30 to-accent/0",
    success: "from-success/30 to-success/0",
    warning: "from-warning/30 to-warning/0",
    danger: "from-danger/30 to-danger/0",
  }[tone];

  return (
    <div className="relative rounded-xl border border-muted/60 bg-surface shadow-card p-5">
      <div className={`absolute inset-x-0 -top-px h-1 rounded-t-xl bg-gradient-to-r ${toneMap}`} />
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-text/60">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="opacity-70">{icon}</div>
      </div>
    </div>
  );
}

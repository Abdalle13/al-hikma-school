import { cn } from "../../lib/cn.js";

// small metric tile for dashboards and the public stats band
export function StatCard({ label, value, icon: Icon, hint, className }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-muted" aria-hidden="true" /> : null}
      </div>
      <p className="mt-2 text-2xl font-bold text-fg tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export default StatCard;

import { cn } from "../../utils/formatter.js";

// small metric tile for dashboards and the public stats band
export function StatCard({ label, value, icon: Icon, hint, className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        {Icon ? (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-heading text-2xl font-bold text-fg tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export default StatCard;

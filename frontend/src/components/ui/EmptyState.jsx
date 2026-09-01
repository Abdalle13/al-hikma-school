import { Inbox } from "lucide-react";
import { cn } from "../../lib/cn.js";

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center",
        className
      )}
    >
      <Icon className="h-8 w-8 text-muted" aria-hidden="true" />
      <p className="mt-3 text-sm font-bold text-fg">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export default EmptyState;

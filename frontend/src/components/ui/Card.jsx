import { cn } from "../../lib/cn.js";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-surface p-5", className)}
      {...props}
    />
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div>
        <h3 className="text-base font-bold text-fg">{title}</h3>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export default Card;

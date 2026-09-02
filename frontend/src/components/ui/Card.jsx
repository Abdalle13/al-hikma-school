import { cn } from "../../utils/formatter.js";

// surface card. `hover` adds a lift on pointer, for clickable cards and grids.
export function Card({ className, hover = false, as: Comp = "div", ...props }) {
  return (
    <Comp
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-200",
        hover && "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div>
        <h3 className="font-heading text-base font-bold text-fg">{title}</h3>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export default Card;

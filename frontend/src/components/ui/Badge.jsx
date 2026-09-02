import { cn } from "../../utils/formatter.js";

// status pills only. keep brand green (primary) for actions, not status.
const tones = {
  neutral: "bg-surface-2 text-muted ring-border",
  success: "bg-success/12 text-success ring-success/20",
  warning: "bg-warning/12 text-warning ring-warning/20",
  danger: "bg-danger/12 text-danger ring-danger/20",
  info: "bg-primary/12 text-primary ring-primary/20",
};

export function Badge({ tone = "neutral", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

export default Badge;

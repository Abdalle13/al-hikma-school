import { cn } from "../../utils/formatter.js";

const variants = {
  primary:
    "bg-primary text-on-primary shadow-sm hover:bg-primary-hover hover:shadow-card active:translate-y-px",
  secondary: "bg-surface-2 text-fg hover:bg-border active:translate-y-px",
  outline: "border border-border bg-surface text-fg hover:border-primary/40 hover:bg-surface-2",
  ghost: "text-fg hover:bg-surface-2",
  danger: "bg-danger text-white hover:opacity-90 active:translate-y-px",
};

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
  xl: "h-14 px-8 text-base",
};

export function Button({
  as: Comp = "button",
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}) {
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}

export default Button;

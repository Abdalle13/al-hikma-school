import { cn } from "../../utils/formatter.js";

const variants = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-surface-2 text-fg hover:bg-border",
  outline: "border border-border text-fg hover:bg-surface-2",
  ghost: "text-fg hover:bg-surface-2",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
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
        "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:cursor-not-allowed disabled:opacity-50",
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

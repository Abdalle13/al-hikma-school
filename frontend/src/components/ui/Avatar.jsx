import { cn } from "../../utils/formatter.js";

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function Avatar({ name, src, size = "md", className }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 font-medium text-muted",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || ""} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export default Avatar;

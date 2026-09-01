import { cn } from "../../utils/formatter.js";

// shimmer placeholder for loading states
export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-surface-2",
        className
      )}
    />
  );
}

export default Skeleton;

import { Loader2 } from "lucide-react";
import { cn } from "../../utils/formatter.js";

const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };

export function Spinner({ size = "md", className, label = "Loading" }) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <Loader2 className={cn("animate-spin text-muted", sizes[size], className)} />
    </span>
  );
}

export default Spinner;

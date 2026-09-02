import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useSelector } from "react-redux";
import { cn } from "../../utils/formatter.js";

// the school wordmark. uses the logo image when the admin has set one,
// otherwise an icon plus the school name from settings.
export function Brand({ to = "/", className, textClassName, onClick }) {
  const { schoolName, logo } = useSelector((s) => s.settings.data);

  return (
    <Link
      to={to}
      onClick={onClick}
      aria-label={`${schoolName}, go to home`}
      className={cn(
        "flex items-center gap-2 rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className
      )}
    >
      {logo ? (
        <img src={logo} alt={schoolName} className="h-8 w-auto" />
      ) : (
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
          <GraduationCap className="h-5 w-5" />
        </span>
      )}
      <span className={cn("font-heading text-lg font-bold text-fg", textClassName)}>{schoolName}</span>
    </Link>
  );
}

export default Brand;

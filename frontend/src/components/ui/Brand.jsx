import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useSelector } from "react-redux";
import { cn } from "../../utils/formatter.js";

// the school wordmark. uses the logo image when the admin has set one,
// otherwise an icon plus the school name from settings.
// `onDark` styles it for the navy sidebar.
export function Brand({ to = "/", className, textClassName, onDark = false }) {
  const { schoolName, logo } = useSelector((s) => s.settings.data);

  return (
    <Link to={to} className={cn("flex items-center gap-2.5", className)}>
      {logo ? (
        <img src={logo} alt={schoolName} className="h-8 w-auto" />
      ) : (
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-xl",
            onDark ? "bg-white/12 text-white" : "bg-primary/10 text-primary"
          )}
        >
          <GraduationCap className="h-5 w-5" />
        </span>
      )}
      <span
        className={cn(
          "font-heading text-lg font-bold",
          onDark ? "text-white" : "text-fg",
          textClassName
        )}
      >
        {schoolName}
      </span>
    </Link>
  );
}

export default Brand;

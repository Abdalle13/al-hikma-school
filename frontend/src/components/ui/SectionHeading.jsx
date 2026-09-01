import { cn } from "../../utils/formatter.js";

// eyebrow + title + optional lead paragraph for a marketing section
export function SectionHeading({ eyebrow, title, lead, align = "left", className }) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-sm font-semibold text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-2xl font-bold text-fg sm:text-3xl">{title}</h2>
      {lead ? <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{lead}</p> : null}
    </div>
  );
}

export default SectionHeading;

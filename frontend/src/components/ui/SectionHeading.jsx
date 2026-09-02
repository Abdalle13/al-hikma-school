import { cn } from "../../utils/formatter.js";

// eyebrow + title + optional lead paragraph for a marketing section
export function SectionHeading({ eyebrow, title, lead, align = "left", className }) {
  const centered = align === "center";
  return (
    <div className={cn(centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}>
      {eyebrow ? (
        <span
          className={cn(
            "inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-primary",
            centered && "justify-center"
          )}
        >
          <span className="h-px w-6 bg-primary/50" aria-hidden="true" />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-3 text-[26px] font-bold leading-tight text-fg sm:text-3xl md:text-[34px]">
        {title}
      </h2>
      {lead ? (
        <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">{lead}</p>
      ) : null}
    </div>
  );
}

export default SectionHeading;

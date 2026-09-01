import { cn } from "../../utils/formatter.js";

// a full width page section with a centered max width inner container.
// tone switches the background so sections alternate down the page.
const tones = {
  base: "bg-bg",
  surface: "bg-surface",
  muted: "bg-surface-2",
};

export function Section({ tone = "base", className, innerClassName, children, id }) {
  return (
    <section id={id} className={cn("px-4 py-16 sm:py-20", tones[tone], className)}>
      <div className={cn("mx-auto max-w-[1200px]", innerClassName)}>{children}</div>
    </section>
  );
}

export default Section;

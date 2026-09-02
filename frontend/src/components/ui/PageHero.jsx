import { FadeIn } from "./FadeIn.jsx";
import { SectionHeading } from "./SectionHeading.jsx";

// consistent opener for the inner public pages
export function PageHero({ eyebrow, title, lead, children }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-16 top-1/2 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-soft/40 via-bg to-bg" />
      </div>
      <div className="mx-auto max-w-[1200px] px-4 py-11 sm:py-14">
        <FadeIn>
          <SectionHeading eyebrow={eyebrow} title={title} lead={lead} className="max-w-2xl" />
          {children}
        </FadeIn>
      </div>
    </section>
  );
}

export default PageHero;

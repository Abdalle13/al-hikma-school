import { useSelector } from "react-redux";
import { Compass, Eye, HeartHandshake, ShieldCheck, Sprout, Target } from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { Section } from "../components/ui/Section.jsx";
import { SectionHeading } from "../components/ui/SectionHeading.jsx";
import { PageHero } from "../components/ui/PageHero.jsx";
import { FadeIn } from "../components/ui/FadeIn.jsx";

const values = [
  { icon: ShieldCheck, title: "Discipline", body: "Clear routines and high expectations, held kindly." },
  { icon: HeartHandshake, title: "Care", body: "Every child is known by name and followed closely." },
  { icon: Sprout, title: "Growth", body: "We measure progress, not just results." },
  { icon: Compass, title: "Faith", body: "Islamic values run through the whole school day." },
];

const history = [
  { year: "2013", text: "Opened with two classrooms and 40 pupils." },
  { year: "2017", text: "Added the secondary programme and the first science lab." },
  { year: "2021", text: "Moved to the current campus with a masjid and library." },
  { year: "2024", text: "Brought attendance, report cards and fees fully online." },
];

export default function AboutPage() {
  const { schoolName } = useSelector((s) => s.settings.data);

  return (
    <div>
      <PageHero
        eyebrow="About us"
        title={`The ${schoolName} story`}
        lead="We started as a small community school and grew by keeping one promise: know every child, and tell their family the truth about how they are doing."
      />

      <Section tone="surface">
        <div className="grid gap-5 md:grid-cols-2">
          <FadeIn>
            <Card hover className="h-full">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                <Target className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-fg">Our mission</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                To give Somali children a strong academic and Islamic education in a calm, organised
                environment, and to keep parents close to their child's progress.
              </p>
            </Card>
          </FadeIn>
          <FadeIn delay={0.05}>
            <Card hover className="h-full">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent ring-1 ring-inset ring-accent/15">
                <Eye className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-fg">Our vision</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                A school families rely on for years, where good habits, curiosity and faith are built
                early and carried for life.
              </p>
            </Card>
          </FadeIn>
        </div>
      </Section>

      <Section>
        <FadeIn>
          <SectionHeading eyebrow="What we stand for" title="Core values" />
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <FadeIn key={v.title} delay={i * 0.05}>
                <Card hover className="h-full">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-heading text-base font-bold text-fg">{v.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{v.body}</p>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:items-start">
          <FadeIn>
            <SectionHeading eyebrow="From the principal" title="A word to parents" />
          </FadeIn>
          <FadeIn delay={0.05}>
            <figure className="rounded-2xl border border-border bg-bg p-7 shadow-card">
              <blockquote className="text-[15px] leading-relaxed text-fg sm:text-base">
                When a family chooses our school, they are trusting us with the most important years of
                their child's life. We take that seriously. We keep classes small, we mark attendance
                every day, and we publish report cards on time. If something is wrong, you will hear it
                from us first.
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4 text-sm font-semibold text-fg">
                The Principal
                <span className="block text-xs font-normal text-muted">{schoolName}</span>
              </figcaption>
            </figure>
          </FadeIn>
        </div>
      </Section>

      <Section>
        <FadeIn>
          <SectionHeading eyebrow="Our history" title="How we got here" />
        </FadeIn>
        <ol className="mt-12 space-y-0 border-l border-border">
          {history.map((h, i) => (
            <FadeIn key={h.year} delay={i * 0.05}>
              <li className="relative pb-8 pl-8 last:pb-0">
                <span className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-2 border-bg bg-primary" />
                <p className="font-heading text-sm font-bold text-primary tabular-nums">{h.year}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{h.text}</p>
              </li>
            </FadeIn>
          ))}
        </ol>
      </Section>

      <Section tone="muted">
        <FadeIn>
          <Card className="mx-auto max-w-2xl text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-heading text-base font-bold text-fg">Accreditation and registration</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
              {schoolName} is a registered private school operating under the local education authority.
              Registration details are available from the school office on request.
            </p>
          </Card>
        </FadeIn>
      </Section>
    </div>
  );
}

import { useSelector } from "react-redux";
import { Compass, Eye, HeartHandshake, ShieldCheck, Sprout, Target } from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { Section } from "../components/ui/Section.jsx";
import { SectionHeading } from "../components/ui/SectionHeading.jsx";
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
      <Section>
        <FadeIn>
          <SectionHeading
            eyebrow="About us"
            title={`The ${schoolName} story`}
            lead="We started as a small community school and grew by keeping one promise: know every child, and tell their family the truth about how they are doing."
          />
        </FadeIn>
      </Section>

      <Section tone="surface">
        <div className="grid gap-4 md:grid-cols-2">
          <FadeIn>
            <Card className="h-full">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-fg">Our mission</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                To give Somali children a strong academic and Islamic education in a calm,
                organised environment, and to keep parents close to their child's progress.
              </p>
            </Card>
          </FadeIn>
          <FadeIn delay={0.05}>
            <Card className="h-full">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <Eye className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-fg">Our vision</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                A school families rely on for years, where good habits, curiosity and faith are
                built early and carried for life.
              </p>
            </Card>
          </FadeIn>
        </div>
      </Section>

      <Section>
        <FadeIn>
          <SectionHeading eyebrow="What we stand for" title="Core values" />
        </FadeIn>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <FadeIn key={v.title} delay={i * 0.05}>
                <Card className="h-full">
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-3 text-base font-bold text-fg">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted">{v.body}</p>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-start">
          <FadeIn>
            <SectionHeading eyebrow="From the principal" title="A word to parents" />
          </FadeIn>
          <FadeIn delay={0.05}>
            <blockquote className="border-l-2 border-primary pl-5 text-sm leading-relaxed text-fg sm:text-base">
              <p>
                When a family chooses our school, they are trusting us with the most important
                years of their child's life. We take that seriously. We keep classes small, we
                mark attendance every day, and we publish report cards on time. If something is
                wrong, you will hear it from us first.
              </p>
              <footer className="mt-4 text-sm font-semibold text-fg">
                The Principal
                <span className="block text-xs font-normal text-muted">{schoolName}</span>
              </footer>
            </blockquote>
          </FadeIn>
        </div>
      </Section>

      <Section>
        <FadeIn>
          <SectionHeading eyebrow="Our history" title="How we got here" />
        </FadeIn>
        <ol className="mt-10 space-y-6">
          {history.map((h, i) => (
            <FadeIn key={h.year} delay={i * 0.05}>
              <li className="flex gap-5">
                <span className="w-14 shrink-0 text-sm font-bold text-primary tabular-nums">{h.year}</span>
                <span className="border-l border-border pl-5 text-sm text-muted">{h.text}</span>
              </li>
            </FadeIn>
          ))}
        </ol>
      </Section>

      <Section tone="muted">
        <FadeIn>
          <Card className="text-center">
            <h3 className="text-base font-semibold text-fg">Accreditation and registration</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
              {schoolName} is a registered private school operating under the local education
              authority. Registration details are available from the school office on request.
            </p>
          </Card>
        </FadeIn>
      </Section>
    </div>
  );
}

import { useSelector } from "react-redux";
import {
  Compass,
  Eye,
  HeartHandshake,
  ShieldCheck,
  Sprout,
  Target,
} from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { Section } from "../components/ui/Section.jsx";
import { SectionHeading } from "../components/ui/SectionHeading.jsx";
import { PageHero } from "../components/ui/PageHero.jsx";
import { FadeIn } from "../components/ui/FadeIn.jsx";
import { siteImages } from "../utils/siteImages.js";

const values = [
  { icon: ShieldCheck, title: "Discipline", body: "Clear routines and high expectations, held kindly." },
  { icon: HeartHandshake, title: "Care", body: "Every child is known by name and followed closely." },
  { icon: Sprout, title: "Growth", body: "We measure progress, not just results." },
  { icon: Compass, title: "Faith", body: "Islamic values run through the whole school day." },
];

const numbers = [
  { value: "500+", label: "Students enrolled" },
  { value: "30+", label: "Qualified teachers" },
  { value: "25", label: "Pupils per class on average" },
  { value: "12", label: "Years serving families" },
];

const expectations = [
  "Attendance marked every day, with a message home when your child is absent.",
  "Report cards published on time each term, with a grade, a division and a class position.",
  "Fees, invoices and receipts visible in your account, payable in installments.",
  "A small class size so teachers can follow every child.",
  "A direct line to the school office when you have a question.",
];

const schoolDay = [
  { time: "7:30", text: "Gates open, morning assembly and Quran recitation." },
  { time: "8:00", text: "First lessons across the core subjects." },
  { time: "10:30", text: "Short break, then Islamic studies and Arabic." },
  { time: "12:30", text: "Dhuhr prayer and lunch." },
  { time: "13:15", text: "Afternoon lessons, reading and revision." },
  { time: "15:00", text: "School closes, clubs and extra help on set days." },
];

const history = [
  { year: "2013", text: "Opened with two classrooms and 40 pupils." },
  { year: "2016", text: "Grew to a full primary section, Grades 1 to 8." },
  { year: "2017", text: "Added the secondary programme and the first science lab." },
  { year: "2021", text: "Moved into a larger building with more classrooms and a library." },
  { year: "2024", text: "Brought attendance, report cards and fees fully online." },
  { year: "2026", text: "Over 500 students across primary and secondary." },
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
        <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <FadeIn>
            <div className="h-full overflow-hidden rounded-3xl border border-border shadow-card">
              <img
                src={siteImages.classroom}
                alt="Inside a classroom at the school"
                loading="lazy"
                className="h-full min-h-[280px] w-full object-cover"
              />
            </div>
          </FadeIn>
          <div className="grid gap-5">
            <FadeIn delay={0.05}>
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
            <FadeIn delay={0.1}>
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
        </div>
      </Section>

      <Section>
        <FadeIn>
          <SectionHeading eyebrow="By the numbers" title="Where we are today" />
        </FadeIn>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {numbers.map((n, i) => (
            <FadeIn key={n.label} delay={i * 0.05}>
              <Card className="h-full">
                <p className="font-heading text-3xl font-bold text-fg tabular-nums">{n.value}</p>
                <p className="mt-1.5 text-sm leading-snug text-muted">{n.label}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <FadeIn>
          <SectionHeading eyebrow="What we stand for" title="Core values" />
        </FadeIn>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <FadeIn key={v.title} delay={i * 0.05}>
                <Card hover className="h-full bg-bg">
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

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <SectionHeading eyebrow="For parents" title="What families can expect" />
            <ul className="mt-6 space-y-3">
              {expectations.map((e) => (
                <li
                  key={e}
                  className="flex gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-fg shadow-sm"
                >
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {e}
                </li>
              ))}
            </ul>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="overflow-hidden rounded-3xl border border-border shadow-card">
              <img
                src={siteImages.library}
                alt="The school library"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </Section>

      <Section tone="surface">
        <FadeIn>
          <SectionHeading eyebrow="A day at school" title="How the day runs" />
        </FadeIn>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schoolDay.map((s, i) => (
            <FadeIn key={s.time} delay={i * 0.04}>
              <Card className="h-full bg-bg">
                <p className="font-heading text-sm font-bold text-primary tabular-nums">{s.time}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.text}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:items-start">
          <FadeIn>
            <SectionHeading eyebrow="From the principal" title="A word to parents" />
          </FadeIn>
          <FadeIn delay={0.05}>
            <figure className="rounded-2xl border border-border bg-surface p-7 shadow-card">
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

      <Section tone="surface">
        <FadeIn>
          <SectionHeading eyebrow="Our history" title="How we got here" />
        </FadeIn>
        <ol className="mt-10 space-y-0 border-l border-border">
          {history.map((h, i) => (
            <FadeIn key={h.year} delay={i * 0.04}>
              <li className="relative pb-8 pl-8 last:pb-0">
                <span className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-2 border-surface bg-primary" />
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

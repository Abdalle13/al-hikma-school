import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  Library,
  MoonStar,
  Quote,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Trees,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Section } from "../components/ui/Section.jsx";
import { SectionHeading } from "../components/ui/SectionHeading.jsx";
import { FadeIn } from "../components/ui/FadeIn.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import api from "../utils/api.js";
import { formatDate } from "../utils/formatter.js";

const whyCards = [
  { icon: BookOpen, title: "Strong academics", body: "Primary, secondary, Quran and Islamic studies under one roof, taught to a clear standard." },
  { icon: HeartHandshake, title: "Caring teachers", body: "Small classes and daily contact with parents so no child slips through." },
  { icon: ShieldCheck, title: "Safe, calm campus", body: "An organised environment where the focus stays on learning." },
  { icon: Sparkles, title: "Modern tools", body: "Attendance, report cards and fees are all handled online for families." },
];

const programmes = [
  { title: "Primary", body: "Grades 1 to 8. A firm grounding in literacy, numeracy, Somali and the sciences." },
  { title: "Secondary", body: "Forms 1 to 4. Exam focused teaching that prepares students for the next step." },
  { title: "Quran and Islamic Studies", body: "Hifz, tajweed and Islamic studies alongside the full academic timetable." },
];

const campus = [
  { icon: BookOpen, label: "Classrooms" },
  { icon: Library, label: "Library" },
  { icon: MoonStar, label: "Masjid" },
  { icon: FlaskConical, label: "Science labs" },
  { icon: Trees, label: "Playground" },
];

const testimonials = [
  { quote: "The weekly attendance messages mean I always know how my daughter is doing. It has changed how involved I can be.", name: "Faadumo Aden", role: "Parent, Grade 4" },
  { quote: "Report cards come out on time and the teachers explain them clearly. Paying fees in installments took the pressure off.", name: "Cabdi Nuur", role: "Parent, Grade 6" },
  { quote: "My son loves the Quran programme and his maths has improved a lot this year.", name: "Sahra Yusuf", role: "Parent, Grade 2" },
  { quote: "Everything is in one place now. I check the timetable and grades from my phone in a minute.", name: "Maryan Ali", role: "Parent, Form 1" },
  { quote: "The office is organised and the teachers reply quickly. It feels like a school that respects families.", name: "Ibrahim Warsame", role: "Parent, Grade 7" },
];

const stats = [
  { value: "500+", label: "Students enrolled", icon: Users },
  { value: "30+", label: "Qualified teachers", icon: GraduationCap },
  { value: "95%", label: "Exam pass rate", icon: CheckCircle2 },
  { value: "12", label: "Years serving families", icon: CalendarCheck },
];

function NewsStrip() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let alive = true;
    api
      .get("/announcements/public")
      .then(({ data }) => alive && setItems(data.announcements.slice(0, 3)))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  if (items === null) {
    return (
      <div className="grid gap-5 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <Card className="text-center">
        <p className="text-sm text-muted">No news yet. Check back soon.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {items.map((n, i) => (
        <FadeIn key={n._id} delay={i * 0.06}>
          <Card as={Link} to={`/news/${n._id}`} hover className="flex h-full flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{formatDate(n.createdAt)}</p>
            <h3 className="mt-2 font-heading text-base font-bold text-fg">{n.title}</h3>
            <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted">{n.body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Read more <ArrowRight className="h-4 w-4" />
            </span>
          </Card>
        </FadeIn>
      ))}
    </div>
  );
}

function HeroVisual() {
  const chips = [
    { icon: CalendarCheck, title: "Attendance marked", note: "Grade 4A, today", tone: "text-success" },
    { icon: ReceiptText, title: "Term fee paid", note: "Installment 2 of 3", tone: "text-primary" },
    { icon: GraduationCap, title: "Report card ready", note: "Midterm, published", tone: "text-accent" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-primary/20 blur-3xl" />
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-card-hover">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-on-primary">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <p className="font-heading text-sm font-bold text-fg">Family portal</p>
            <p className="text-xs text-muted">One place for every child</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {chips.map((c) => (
            <div key={c.title} className="flex items-center gap-3 rounded-2xl border border-border bg-bg p-3">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 ${c.tone}`}>
                <c.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-fg">{c.title}</p>
                <p className="truncate text-xs text-muted">{c.note}</p>
              </div>
              <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-success" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-surface px-4 py-3 shadow-card sm:block">
        <p className="text-xs text-muted">Pass rate</p>
        <p className="font-heading text-xl font-bold text-fg tabular-nums">95%</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { schoolName, tagline } = useSelector((s) => s.settings.data);
  const loop = [...testimonials, ...testimonials];

  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-soft/60 via-bg to-bg" />
        </div>
        <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-4 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome to {schoolName}
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] text-fg sm:text-5xl md:text-[56px]">
              A calm, organised school for Somali families
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {tagline ||
                "Primary, secondary and Quran education, with attendance, report cards and fees your family can follow online."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/admissions" size="lg">
                Apply now <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as={Link} to="/login" size="lg" variant="outline">
                Portal login
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
              {["Primary and secondary", "Quran and Islamic studies", "Online fees and reports"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {t}
                </span>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <HeroVisual />
          </FadeIn>
        </div>
      </section>

      {/* why choose us */}
      <Section>
        <FadeIn>
          <SectionHeading eyebrow="Why families choose us" title="Everything a growing school should be" />
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeIn key={c.title} delay={i * 0.05}>
                <Card hover className="h-full">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-heading text-base font-bold text-fg">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.body}</p>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </Section>

      {/* academics preview */}
      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:items-center">
          <FadeIn>
            <SectionHeading
              eyebrow="Academics"
              title="Three programmes, one timetable"
              lead="Every student follows a full academic day. The Quran programme runs alongside it, not instead of it."
            />
            <Button as={Link} to="/academics" variant="outline" className="mt-6">
              Explore academics <ArrowRight className="h-4 w-4" />
            </Button>
          </FadeIn>
          <div className="grid gap-5 sm:grid-cols-3">
            {programmes.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.05}>
                <Card hover className="h-full bg-bg">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 font-heading text-base font-bold text-fg">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.body}</p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>

      {/* stats band */}
      <Section>
        <FadeIn>
          <div className="grid divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface shadow-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-4 p-7">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-heading text-2xl font-bold text-fg tabular-nums">{s.value}</p>
                  <p className="text-sm text-muted">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </Section>

      {/* latest news */}
      <Section tone="surface">
        <FadeIn>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="News and events" title="What is happening at school" />
            <Link to="/news" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2">
              All news <ArrowRight className="h-4 w-4 transition-all" />
            </Link>
          </div>
        </FadeIn>
        <div className="mt-12">
          <NewsStrip />
        </div>
      </Section>

      {/* campus life */}
      <Section>
        <FadeIn>
          <SectionHeading eyebrow="Campus life" title="Room to learn, pray and play" />
        </FadeIn>
        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {campus.map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeIn key={c.label} delay={i * 0.04}>
                <div className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-surface to-accent/10 p-4 text-center transition-transform duration-200 hover:-translate-y-0.5">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-primary shadow-sm">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-semibold text-fg">{c.label}</span>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </Section>

      {/* testimonials, auto scrolling rail */}
      <Section tone="surface" innerClassName="max-w-none px-0">
        <div className="mx-auto max-w-[1200px] px-4">
          <FadeIn>
            <SectionHeading eyebrow="From our parents" title="Families that trust us" align="center" />
          </FadeIn>
        </div>
        <div className="marquee-rail mt-12 overflow-hidden">
          <div className="marquee-track flex w-max gap-5 pl-5">
            {loop.map((t, i) => (
              <figure
                key={i}
                className="flex w-[320px] shrink-0 flex-col rounded-2xl border border-border bg-bg p-6 shadow-card"
              >
                <Quote className="h-6 w-6 text-primary/40" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-fg">{t.quote}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar name={t.name} size="sm" className="bg-primary/10 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-fg">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

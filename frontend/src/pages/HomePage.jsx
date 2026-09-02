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
  { icon: Sparkles, title: "Everything online", body: "Attendance, report cards and fees are all handled online for families." },
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
            <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{n.body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Read more <ArrowRight className="h-4 w-4" />
            </span>
          </Card>
        </FadeIn>
      ))}
    </div>
  );
}

// a bento of rounded panels that stands in for photos and reads as school life
function HeroMosaic() {
  const tile = "relative overflow-hidden rounded-3xl border border-border p-5 shadow-card";
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5">
      <div
        className={`${tile} row-span-2 flex flex-col justify-between bg-gradient-to-br from-primary to-primary-hover text-on-primary`}
      >
        <MoonStar className="h-6 w-6 opacity-90" />
        <div>
          <p className="font-heading text-lg font-bold">Quran and Islamic studies</p>
          <p className="mt-1 text-sm text-on-primary/80">Hifz and tajweed, every day.</p>
        </div>
      </div>

      <div className={`${tile} bg-surface`}>
        <BookOpen className="h-6 w-6 text-primary" />
        <p className="mt-6 font-heading text-base font-bold text-fg">Primary and secondary</p>
        <p className="mt-1 text-sm text-muted">Grades 1 to Form 4.</p>
      </div>

      <div className={`${tile} bg-surface`}>
        <Users className="h-6 w-6 text-primary" />
        <p className="mt-6 font-heading text-base font-bold text-fg">Small classes</p>
        <p className="mt-1 text-sm text-muted">Every child known by name.</p>
      </div>

      <div className={`${tile} col-span-2 bg-secondary-soft`}>
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface text-primary shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-heading text-base font-bold text-fg">Attendance, grades and fees online</p>
            <p className="mt-0.5 text-sm text-muted">Families follow every child from their phone.</p>
          </div>
        </div>
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
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-soft/50 via-bg to-bg" />
        </div>
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
            <FadeIn>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                <GraduationCap className="h-3.5 w-3.5" />
                Enrolling now for the new term
              </span>
              <h1 className="mt-5 text-[40px] font-bold leading-[1.05] text-fg sm:text-[52px] md:text-[60px]">
                A calm, organised school for Somali families
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
                {tagline ||
                  "Primary, secondary and Quran education at " +
                    (schoolName || "our school") +
                    ", with attendance, report cards and fees your family can follow online."}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button as={Link} to="/admissions" size="xl">
                  Apply now <ArrowRight className="h-4 w-4" />
                </Button>
                <Button as={Link} to="/login" size="xl" variant="outline">
                  Portal login
                </Button>
              </div>
              <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-8">
                {stats.slice(0, 3).map((s) => (
                  <div key={s.label}>
                    <dt className="font-heading text-2xl font-bold text-fg tabular-nums">{s.value}</dt>
                    <dd className="mt-1 text-xs leading-snug text-muted">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </FadeIn>
            <FadeIn delay={0.1}>
              <HeroMosaic />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* why choose us */}
      <Section tone="surface">
        <FadeIn>
          <SectionHeading eyebrow="Why families choose us" title="Everything a growing school should be" />
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeIn key={c.title} delay={i * 0.05}>
                <Card hover className="h-full bg-bg">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-heading text-base font-bold text-fg">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </Section>

      {/* academics preview */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:items-center">
          <FadeIn>
            <SectionHeading
              eyebrow="Academics"
              title="Three programmes, one timetable"
              lead="Every student follows a full academic day. The Quran programme runs alongside it, not instead of it."
            />
            <Button as={Link} to="/academics" variant="outline" className="mt-7">
              Explore academics <ArrowRight className="h-4 w-4" />
            </Button>
          </FadeIn>
          <div className="grid gap-5 sm:grid-cols-3">
            {programmes.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.05}>
                <Card hover className="h-full">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <h3 className="mt-4 font-heading text-base font-bold text-fg">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>

      {/* stats band */}
      <Section tone="surface">
        <FadeIn>
          <div className="grid divide-y divide-border overflow-hidden rounded-3xl border border-border bg-bg shadow-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-4 p-7">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
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
      <Section>
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
      <Section tone="surface">
        <FadeIn>
          <SectionHeading eyebrow="Campus life" title="Room to learn, pray and play" />
        </FadeIn>
        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {campus.map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeIn key={c.label} delay={i * 0.04}>
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-bg p-4 text-center shadow-card transition-transform duration-200 hover:-translate-y-1">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
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
      <Section innerClassName="max-w-none px-0">
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
                className="flex w-[340px] shrink-0 flex-col rounded-3xl border border-border bg-surface p-6 shadow-card"
              >
                <Quote className="h-7 w-7 text-primary/30" />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-fg">{t.quote}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
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

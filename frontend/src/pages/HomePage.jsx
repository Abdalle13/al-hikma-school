import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FlaskConical,
  HeartHandshake,
  Library,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Trees,
} from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Section } from "../components/ui/Section.jsx";
import { SectionHeading } from "../components/ui/SectionHeading.jsx";
import { FadeIn } from "../components/ui/FadeIn.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
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
  { quote: "The weekly attendance messages mean I always know how my daughter is doing. It has changed how involved I can be.", name: "Faadumo A.", role: "Parent, Grade 4" },
  { quote: "Report cards come out on time and the teachers explain them clearly. Paying fees in installments took the pressure off.", name: "Cabdi N.", role: "Parent, Grade 6" },
  { quote: "My son loves the Quran programme and his maths has improved a lot this year.", name: "Sahra Y.", role: "Parent, Grade 2" },
];

const stats = [
  { value: "500+", label: "Students enrolled" },
  { value: "30+", label: "Qualified teachers" },
  { value: "95%", label: "Exam pass rate" },
  { value: "12", label: "Years serving families" },
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
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40" />
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
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((n) => (
        <Card key={n._id} className="flex flex-col transition-colors hover:border-primary/40">
          <p className="text-xs font-medium text-muted">{formatDate(n.createdAt)}</p>
          <h3 className="mt-2 text-base font-bold text-fg">{n.title}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-muted">{n.body}</p>
          <Link
            to={`/news/${n._id}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2"
          >
            Read more <ArrowRight className="h-4 w-4 transition-all" />
          </Link>
        </Card>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { schoolName, tagline } = useSelector((s) => s.settings.data);

  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-bg to-bg" />
        <div className="relative mx-auto max-w-[1200px] px-4 py-20 sm:py-28">
          <FadeIn>
            <p className="text-sm font-semibold text-primary">Welcome to {schoolName}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-fg sm:text-5xl md:text-6xl">
              A calm, organised school for Somali families
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {tagline ||
                "Primary, secondary and Quran education, with attendance, report cards and fees your family can follow online."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/admissions" size="lg">
                Apply now
              </Button>
              <Button as={Link} to="/login" size="lg" variant="outline">
                Parent login
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* why choose us */}
      <Section>
        <FadeIn>
          <SectionHeading eyebrow="Why families choose us" title="Everything a growing school should be" />
        </FadeIn>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeIn key={c.title} delay={i * 0.05}>
                <Card className="h-full">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-fg">{c.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{c.body}</p>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </Section>

      {/* academics preview */}
      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-center">
          <FadeIn>
            <SectionHeading
              eyebrow="Academics"
              title="Three programmes, one timetable"
              lead="Every student follows a full academic day. The Quran programme runs alongside it, not instead of it."
            />
            <Button as={Link} to="/academics" variant="outline" className="mt-6">
              Explore academics
            </Button>
          </FadeIn>
          <div className="grid gap-4 sm:grid-cols-3">
            {programmes.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.05}>
                <Card className="h-full bg-bg">
                  <h3 className="text-base font-bold text-fg">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{p.body}</p>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>

      {/* stats band */}
      <Section tone="muted">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.05}>
              <div className="rounded-2xl border border-border bg-surface p-6 text-center">
                <p className="text-3xl font-bold text-fg tabular-nums">{s.value}</p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* latest news */}
      <Section>
        <FadeIn>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="News and events" title="What is happening at school" />
            <Link
              to="/news"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2"
            >
              All news <ArrowRight className="h-4 w-4 transition-all" />
            </Link>
          </div>
        </FadeIn>
        <div className="mt-10">
          <NewsStrip />
        </div>
      </Section>

      {/* campus life */}
      <Section tone="surface">
        <FadeIn>
          <SectionHeading eyebrow="Campus life" title="Room to learn, pray and play" />
        </FadeIn>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {campus.map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeIn key={c.label} delay={i * 0.04}>
                <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 p-4 text-center">
                  <Icon className="h-7 w-7 text-primary" />
                  <span className="text-sm font-medium text-fg">{c.label}</span>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </Section>

      {/* testimonials */}
      <Section>
        <FadeIn>
          <SectionHeading eyebrow="From our parents" title="Families that trust us" align="center" />
        </FadeIn>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.05}>
              <Card className="h-full">
                <p className="text-sm leading-relaxed text-fg">"{t.quote}"</p>
                <p className="mt-4 text-sm font-semibold text-fg">{t.name}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* closing cta */}
      <Section tone="muted">
        <FadeIn>
          <div className="rounded-2xl border border-border bg-primary px-6 py-12 text-center text-white sm:px-12">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to join {schoolName}?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/85 sm:text-base">
              Start an application online. An admin reviews it and gets back to you about the next steps.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button as={Link} to="/admissions" size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                Start an application
              </Button>
              <Button as={Link} to="/contact" size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                Contact the school
              </Button>
            </div>
          </div>
        </FadeIn>
      </Section>
    </div>
  );
}

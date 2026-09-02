import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, FlaskConical, Library, MoonStar, Trees } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Section } from "../components/ui/Section.jsx";
import { SectionHeading } from "../components/ui/SectionHeading.jsx";
import { PageHero } from "../components/ui/PageHero.jsx";
import { FadeIn } from "../components/ui/FadeIn.jsx";

const programmes = [
  {
    title: "Primary",
    grades: "Grades 1 to 8",
    body: "Literacy, numeracy, Somali, English, science and social studies, taught in small classes with daily attendance.",
  },
  {
    title: "Secondary",
    grades: "Forms 1 to 4",
    body: "Exam focused teaching across the core subjects, with regular quizzes, a midterm and a final each term.",
  },
  {
    title: "Quran and Islamic Studies",
    grades: "All grades",
    body: "Hifz, tajweed and Islamic studies scheduled alongside the academic timetable, not as a replacement for it.",
  },
];

const grading = [
  ["90 to 100", "A", "Excellent"],
  ["80 to 89", "B", "Very good"],
  ["70 to 79", "C", "Good"],
  ["60 to 69", "D", "Satisfactory"],
  ["Below 60", "F", "Needs support"],
];

const terms = [
  { name: "Term 1", when: "September to December" },
  { name: "Term 2", when: "January to April" },
  { name: "Term 3", when: "April to July" },
];

const subjects = [
  "Mathematics", "English", "Somali", "Science", "Social Studies",
  "Quran", "Islamic Studies", "Arabic", "ICT", "Physical Education",
];

const facilities = [
  { icon: FlaskConical, label: "Science labs" },
  { icon: Library, label: "Library" },
  { icon: MoonStar, label: "Masjid" },
  { icon: Trees, label: "Playground" },
  { icon: BookOpen, label: "Reading rooms" },
];

export default function AcademicsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Academics"
        title="A full academic day, every day"
        lead="Students follow a structured timetable from primary through secondary, with the Quran programme built into the week."
      />

      <Section tone="surface">
        <FadeIn>
          <SectionHeading eyebrow="Programmes" title="What we teach" />
        </FadeIn>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {programmes.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.05}>
              <Card hover className="h-full bg-bg">
                <Badge tone="info">{p.grades}</Badge>
                <h3 className="mt-3 font-heading text-lg font-bold text-fg">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <FadeIn>
            <SectionHeading
              eyebrow="Grading system"
              title="How results are reported"
              lead="Each subject is scored as a percentage, then a letter grade. The term result is the average across subjects with an overall grade, a division and a class position."
            />
            <p className="mt-4 text-sm text-muted">
              Divisions: First from 60 percent, Second from 45 to 59, Third below 45.
            </p>
          </FadeIn>
          <FadeIn delay={0.05}>
            <div className="overflow-hidden rounded-2xl border border-border shadow-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-semibold">Percentage</th>
                    <th className="px-4 py-3 font-semibold">Grade</th>
                    <th className="px-4 py-3 font-semibold">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {grading.map((row) => (
                    <tr key={row[1]}>
                      <td className="px-4 py-3 text-fg tabular-nums">{row[0]}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                          {row[1]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </Section>

      <Section tone="surface">
        <FadeIn>
          <SectionHeading eyebrow="The school year" title="Three terms" />
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {terms.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.05}>
              <Card hover className="bg-bg text-center">
                <p className="font-heading text-base font-bold text-fg">{t.name}</p>
                <p className="mt-1 text-sm text-muted">{t.when}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section>
        <FadeIn>
          <SectionHeading eyebrow="Curriculum" title="Subjects offered" />
        </FadeIn>
        <div className="mt-8 flex flex-wrap gap-2.5">
          {subjects.map((s) => (
            <span
              key={s}
              className="rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-fg shadow-sm"
            >
              {s}
            </span>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <FadeIn>
          <SectionHeading eyebrow="On campus" title="Facilities" />
        </FadeIn>
        <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {facilities.map((f, i) => {
            const Icon = f.icon;
            return (
              <FadeIn key={f.label} delay={i * 0.04}>
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6 text-center shadow-card transition-transform duration-200 hover:-translate-y-0.5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-fg">{f.label}</span>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </Section>

      <Section>
        <FadeIn>
          <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary-soft to-surface p-8 text-center shadow-card sm:p-12">
            <h3 className="font-heading text-xl font-bold text-fg sm:text-2xl">
              Want to see the timetable and results up close?
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
              Parents and students get a login to view attendance, report cards and the weekly
              timetable.
            </p>
            <Button as={Link} to="/admissions" size="lg" className="mt-6">
              Apply for a place <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </FadeIn>
      </Section>
    </div>
  );
}

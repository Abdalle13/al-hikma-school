import { Link } from "react-router-dom";
import { BookOpen, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/Button.jsx";
import { StatCard } from "../../components/ui/StatCard.jsx";
import { Card } from "../../components/ui/Card.jsx";

const whyCards = [
  { icon: BookOpen, title: "Strong academics", body: "Primary, secondary, Quran and Islamic studies under one roof." },
  { icon: HeartHandshake, title: "Caring teachers", body: "Small classes and daily contact with parents." },
  { icon: ShieldCheck, title: "Safe campus", body: "A calm, organised environment focused on learning." },
  { icon: Sparkles, title: "Modern tools", body: "Attendance, report cards and fees managed online." },
];

export function Home() {
  return (
    <div>
      <section className="mx-auto max-w-[1200px] px-4 py-16 sm:py-24">
        <p className="text-sm font-medium text-primary">Welcome to School Name</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-fg sm:text-5xl">
          A calm, organised school for Somali families
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Placeholder tagline. This page will be wired to the school settings and the
          latest public news once the backend is ready.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button as={Link} to="/admissions" size="lg">Apply now</Button>
          <Button as={Link} to="/login" size="lg" variant="outline">Parent login</Button>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyCards.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.title}>
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 text-base font-bold text-fg">{c.title}</h3>
                <p className="mt-1 text-sm text-muted">{c.body}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-[1200px] gap-4 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Students" value="000" />
          <StatCard label="Teachers" value="00" />
          <StatCard label="Pass rate" value="00%" />
          <StatCard label="Years running" value="00" />
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-fg">Ready to join?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
          Start an application from the admissions page. An admin will review it and
          get back to you.
        </p>
        <Button as={Link} to="/admissions" size="lg" className="mt-6">Start an application</Button>
      </section>
    </div>
  );
}

export default Home;

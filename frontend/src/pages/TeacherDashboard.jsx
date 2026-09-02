import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, BookOpen, CalendarClock, ClipboardCheck, GraduationCap, Megaphone, School } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import api from "../utils/api.js";

const quick = [
  { to: "/teacher/attendance", label: "Mark attendance", icon: ClipboardCheck },
  { to: "/teacher/exams", label: "Exams and marks", icon: GraduationCap },
  { to: "/teacher/timetable", label: "My timetable", icon: CalendarClock },
  { to: "/teacher/announcements", label: "Announcements", icon: Megaphone },
];

export default function TeacherDashboard() {
  const me = useSelector((s) => s.auth.user);
  const [assignments, setAssignments] = useState(null);

  useEffect(() => {
    api
      .get("/assignments")
      .then(({ data }) => setAssignments(data.assignments || []))
      .catch(() => setAssignments([]));
  }, []);

  const classes = assignments
    ? [...new Map(assignments.filter((a) => a.schoolClass).map((a) => [a.schoolClass._id, a.schoolClass])).values()]
    : [];
  const subjects = assignments
    ? new Set(assignments.filter((a) => a.subject).map((a) => a.subject._id)).size
    : 0;

  return (
    <div>
      <PageHeader title={`Welcome, ${me.name.split(" ")[0]}`} description="Your classes and tasks for the term." />

      {assignments === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Classes I teach" value={classes.length} icon={School} />
            <StatCard label="Subjects I teach" value={subjects} icon={BookOpen} />
            <StatCard label="Teaching slots" value={assignments.length} icon={CalendarClock} />
          </div>

          <div>
            <h3 className="mb-3 font-heading text-sm font-bold text-fg">My classes</h3>
            {classes.length === 0 ? (
              <EmptyState
                title="No classes assigned yet"
                description="An admin assigns you to classes and subjects. They will show here."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((c) => {
                  const subs = assignments
                    .filter((a) => a.schoolClass?._id === c._id && a.subject)
                    .map((a) => a.subject.name);
                  return (
                    <Card key={c._id} hover>
                      <p className="font-heading text-base font-bold text-fg">{c.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{c.academicYear}</p>
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        {subs.length ? subs.join(", ") : "No subject set"}
                      </p>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quick.map((q) => (
              <Link
                key={q.label}
                to={q.to}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <q.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-fg">{q.label}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-muted" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, CalendarClock, ClipboardCheck, GraduationCap, Megaphone, Wallet } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import api from "../utils/api.js";
import { greeting } from "../utils/greeting.js";
import { formatCurrency } from "../utils/formatter.js";

const quick = [
  { to: "/student/timetable", label: "Timetable", icon: CalendarClock },
  { to: "/student/grades", label: "Grades", icon: GraduationCap },
  { to: "/student/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/student/fees", label: "Fees", icon: Wallet },
  { to: "/student/news", label: "News", icon: Megaphone },
];

const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

export default function StudentDashboard() {
  const me = useSelector((s) => s.auth.user);
  const currency = useSelector((s) => s.settings.data.currency) || "USD";
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!me?._id) return;
    let alive = true;
    Promise.all([
      api.get(`/attendance/summary/${me._id}`).then((r) => r.data).catch(() => null),
      api.get(`/report-cards/student/${me._id}`).then((r) => r.data).catch(() => null),
      api.get("/timetable/me").then((r) => r.data).catch(() => null),
      api.get("/invoices", { params: { student: me._id } }).then((r) => r.data).catch(() => null),
    ]).then(([att, rc, tt, inv]) => {
      if (!alive) return;
      const entries = tt?.timetable?.entries || [];
      setData({
        rate: att?.attendanceRate,
        days: att?.totalDays ?? 0,
        latest: rc?.reportCards?.[0] || null,
        classesToday: entries.filter((e) => e.day === today).length,
        outstanding: inv?.totals?.outstanding ?? null,
      });
    });
    return () => {
      alive = false;
    };
  }, [me?._id]);

  return (
    <div>
      <PageHeader title={`${greeting()}, ${me.name.split(" ")[0]}`} description="Your term at a glance." />

      {data === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Attendance this term"
              value={data.rate != null ? `${data.rate}%` : "n/a"}
              icon={ClipboardCheck}
              hint={data.days ? `${data.days} days recorded` : "No days recorded yet"}
            />
            <StatCard
              label="Latest average"
              value={data.latest ? `${data.latest.average}%` : "n/a"}
              icon={GraduationCap}
              hint={data.latest ? `${data.latest.term?.name || "Term"}, grade ${data.latest.overallGrade}` : "No report card yet"}
            />
            <StatCard
              label={`Classes ${today}`}
              value={data.classesToday}
              icon={CalendarClock}
              hint={data.classesToday ? "See your timetable" : "No classes scheduled"}
            />
            <StatCard
              label="Fee balance"
              value={data.outstanding != null ? formatCurrency(data.outstanding, currency) : "n/a"}
              icon={Wallet}
              hint={data.outstanding === 0 ? "Nothing outstanding" : "Due this term"}
            />
          </div>

          {data.latest ? (
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-bold text-fg">Latest report card</h3>
                <Link to="/student/grades" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Open <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="neutral">{data.latest.term?.name}</Badge>
                <Badge tone="info">Average {data.latest.average}%</Badge>
                <Badge tone="success">Grade {data.latest.overallGrade}</Badge>
                <Badge tone="neutral">{data.latest.division} division</Badge>
                <Badge tone="neutral">
                  Position {data.latest.position} of {data.latest.totalStudents}
                </Badge>
              </div>
            </Card>
          ) : null}

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

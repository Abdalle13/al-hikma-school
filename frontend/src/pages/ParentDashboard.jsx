import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, ClipboardCheck, GraduationCap, Wallet } from "lucide-react";
import { StatCard } from "../components/ui/StatCard.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import api from "../utils/api.js";
import { formatCurrency } from "../utils/formatter.js";
import { greeting } from "../utils/greeting.js";

const quick = [
  { to: "/parent/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/parent/grades", label: "Report cards", icon: GraduationCap },
  { to: "/parent/fees", label: "Fees", icon: Wallet },
];

export default function ParentDashboard() {
  const { selectedChild } = useOutletContext();
  const currency = useSelector((s) => s.settings.data.currency) || "USD";
  const parentName = useSelector((s) => s.auth.user?.name?.split(" ")[0] || "there");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!selectedChild?._id) return;
    let alive = true;
    setData(null);
    Promise.all([
      api.get(`/attendance/summary/${selectedChild._id}`).then((r) => r.data).catch(() => null),
      api.get("/invoices", { params: { student: selectedChild._id } }).then((r) => r.data).catch(() => null),
      api.get(`/report-cards/student/${selectedChild._id}`).then((r) => r.data).catch(() => null),
    ]).then(([att, inv, rc]) => {
      if (!alive) return;
      setData({
        rate: att?.attendanceRate,
        days: att?.totalDays ?? 0,
        outstanding: inv?.totals?.outstanding ?? 0,
        latest: rc?.reportCards?.[0] || null,
      });
    });
    return () => {
      alive = false;
    };
  }, [selectedChild?._id]);

  if (!selectedChild) {
    return <EmptyState title="No child selected" description="Pick a child at the top to see their overview." />;
  }

  return (
    <div>
      <div className="mb-7 border-b border-border pb-5">
        <h1 className="font-heading text-xl font-bold text-fg sm:text-[26px]">
          {greeting()}, {parentName}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Here is how {selectedChild.name.split(" ")[0]} is doing
          {selectedChild.schoolClass?.name ? ` in ${selectedChild.schoolClass.name}` : ""}
          {selectedChild.admissionNo ? `, admission no. ${selectedChild.admissionNo}` : ""}.
        </p>
      </div>

      {data === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
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
              label="Fee balance"
              value={formatCurrency(data.outstanding, currency)}
              icon={Wallet}
              hint={data.outstanding === 0 ? "Nothing outstanding" : "Due this term"}
            />
          </div>

          {data.latest ? (
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-bold text-fg">Latest report card</h3>
                <Link to="/parent/grades" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
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

          <div className="grid gap-4 sm:grid-cols-3">
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

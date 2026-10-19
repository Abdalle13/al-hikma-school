import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  GraduationCap,
  Megaphone,
  Phone,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { StatCard } from "../components/ui/StatCard.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import api from "../utils/api.js";
import { formatCurrency, formatDate } from "../utils/formatter.js";
import { greeting } from "../utils/greeting.js";

const quick = [
  { to: "/parent/attendance", label: "Attendance Record", icon: ClipboardCheck, desc: "Absences & punctuality", tone: "bg-emerald-500/10 text-emerald-600" },
  { to: "/parent/grades", label: "Report Cards & Grades", icon: GraduationCap, desc: "Term marks & rankings", tone: "bg-purple-500/10 text-purple-600" },
  { to: "/parent/fees", label: "Fee Invoices & Payments", icon: Wallet, desc: "Tuition status & receipts", tone: "bg-blue-500/10 text-blue-600" },
  { to: "/parent/news", label: "School Announcements", icon: Megaphone, desc: "Official school bulletins", tone: "bg-amber-500/10 text-amber-600" },
];

export default function ParentDashboard() {
  const { selectedChild } = useOutletContext();
  const currency = useSelector((s) => s.settings.data.currency) || "USD";
  const parentName = useSelector((s) => s.auth.user?.name?.split(" ")[0] || "Parent");
  const [data, setData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (!selectedChild?._id) return;
    let alive = true;
    setData(null);

    Promise.all([
      api.get(`/attendance/summary/${selectedChild._id}`).then((r) => r.data).catch(() => null),
      api.get("/invoices", { params: { student: selectedChild._id } }).then((r) => r.data).catch(() => null),
      api.get(`/report-cards/student/${selectedChild._id}`).then((r) => r.data).catch(() => null),
      api.get("/announcements", { params: { limit: 3 } }).then((r) => r.data?.announcements || []).catch(() => []),
    ]).then(([att, inv, rc, news]) => {
      if (!alive) return;
      setData({
        rate: att?.attendanceRate,
        days: att?.totalDays ?? 0,
        present: att?.presentCount ?? 0,
        absent: att?.absentCount ?? 0,
        late: att?.lateCount ?? 0,
        outstanding: inv?.totals?.outstanding ?? 0,
        latest: rc?.reportCards?.[0] || null,
      });
      setAnnouncements(news.slice(0, 3));
    });
    return () => {
      alive = false;
    };
  }, [selectedChild?._id]);

  if (!selectedChild) {
    return (
      <EmptyState
        title="No child selected"
        description="Please select a child from the switcher above to view their academic dashboard."
      />
    );
  }

  const childFirst = selectedChild.name.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Child Identity Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-surface p-5 shadow-sm sm:p-7">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Avatar name={selectedChild.name} size="lg" className="border-2 border-primary/30" />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-heading text-xl font-bold text-fg sm:text-2xl">
                  {selectedChild.name}
                </h1>
                <Badge tone="info" className="text-xs">
                  {selectedChild.schoolClass?.name ? `${selectedChild.schoolClass.name} ${selectedChild.schoolClass.section || ""}`.trim() : "Enrolled"}
                </Badge>
                {selectedChild.feeCategory && selectedChild.feeCategory !== "Regular" ? (
                  <Badge tone="success" className="text-xs">
                    {selectedChild.feeCategory === "Orphan" ? "Agoon (Free Tuition)" : selectedChild.feeCategory}
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs text-muted">
                Admission No: <span className="font-mono font-medium text-fg">{selectedChild.admissionNo || "Pending"}</span>
                {selectedChild.gender ? ` · Gender: ${selectedChild.gender}` : ""}
                {selectedChild.bloodGroup ? ` · Blood: ${selectedChild.bloodGroup}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/parent/grades"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all"
            >
              <GraduationCap className="h-4 w-4" /> Full Report Card
            </Link>
            <Link
              to="/parent/fees"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-fg shadow-xs hover:bg-surface-2 transition-all"
            >
              <CreditCard className="h-4 w-4 text-emerald-600" /> View Invoices
            </Link>
          </div>
        </div>
      </div>

      {data === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Vitals Row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Term Attendance Rate"
              value={data.rate != null ? `${data.rate}%` : "N/A"}
              icon={ClipboardCheck}
              hint={
                data.days
                  ? `${data.present} present, ${data.absent} absent of ${data.days} days`
                  : "No attendance days recorded yet"
              }
            />

            <StatCard
              label="Academic Average"
              value={data.latest ? `${data.latest.average}%` : "N/A"}
              icon={GraduationCap}
              hint={
                data.latest
                  ? `${data.latest.term?.name || "Term"} · Grade ${data.latest.overallGrade}`
                  : "No report card published yet"
              }
            />

            <StatCard
              label="Fee Account Balance"
              value={formatCurrency(data.outstanding, currency)}
              icon={Wallet}
              hint={
                data.outstanding === 0
                  ? "All term tuition fees fully cleared"
                  : "Balance due for current academic term"
              }
            />
          </div>

          {/* Academic Highlights & Performance Card */}
          {data.latest ? (
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-fg">Latest Academic Report Card</h3>
                    <p className="text-xs text-muted">{data.latest.term?.name || "Term Examination"}</p>
                  </div>
                </div>

                <Link
                  to="/parent/grades"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-1.5 transition-all"
                >
                  View full report <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Badge tone="info" className="text-xs py-1 px-3">
                  Overall Average: {data.latest.average}%
                </Badge>
                <Badge tone="success" className="text-xs py-1 px-3">
                  Overall Grade: {data.latest.overallGrade}
                </Badge>
                {data.latest.division ? (
                  <Badge tone="neutral" className="text-xs py-1 px-3">
                    {data.latest.division} Division
                  </Badge>
                ) : null}
                {data.latest.position ? (
                  <Badge tone="warning" className="text-xs py-1 px-3">
                    Class Rank: #{data.latest.position} of {data.latest.totalStudents} students
                  </Badge>
                ) : null}
              </div>

              {/* Subject Scores Preview */}
              {data.latest.subjects && data.latest.subjects.length > 0 ? (
                <div className="mt-4 pt-3 border-t border-border/50">
                  <p className="text-xs font-semibold text-muted mb-2">Subject Performance Summary:</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {data.latest.subjects.slice(0, 4).map((s, idx) => (
                      <div key={idx} className="rounded-xl border border-border/70 bg-surface-2/40 p-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-fg truncate">{s.subject?.name || "Subject"}</span>
                          <span className="font-bold text-primary font-mono">{s.finalMarks}%</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                          <span>Grade: {s.grade}</span>
                          <span className="capitalize">{s.grade === "A" ? "Excellent" : s.grade === "B" ? "Good" : "Passed"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>
          ) : null}

          {/* School Announcements for Parents */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Megaphone className="h-3.5 w-3.5" />
                </div>
                <h3 className="font-heading text-sm font-bold text-fg">School Announcements & Notices</h3>
              </div>
              <Link to="/parent/news" className="text-xs font-semibold text-primary hover:underline">
                All bulletins →
              </Link>
            </div>

            {announcements.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted">No active school announcements at this time.</p>
            ) : (
              <div className="space-y-2.5">
                {announcements.map((a) => (
                  <div key={a._id} className="rounded-xl border border-border/70 bg-surface-2/30 p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-xs text-fg">{a.title}</span>
                      <span className="text-[10px] text-muted">{formatDate(a.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">{a.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Portal Navigation Links */}
          <div>
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-muted mb-3">
              Quick Parent Services
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quick.map((q) => (
                <Link
                  key={q.label}
                  to={q.to}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${q.tone}`}>
                    <q.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-fg group-hover:text-primary transition-colors">{q.label}</p>
                    <p className="text-xs text-muted truncate">{q.desc}</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted/60 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

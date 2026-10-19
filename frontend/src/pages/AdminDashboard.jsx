import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  DollarSign,
  FileText,
  GraduationCap,
  Megaphone,
  Plus,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { useChartColors } from "../components/ui/useChartColors.js";
import api from "../utils/api.js";
import { formatCurrency, formatDate } from "../utils/formatter.js";
import { greeting } from "../utils/greeting.js";

const quickLinks = [
  { to: "/admin/students", label: "Students", icon: Users, desc: "Enrolment & profiles", tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { to: "/admin/staff", label: "Teachers", icon: Briefcase, desc: "Faculty & staff", tone: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
  { to: "/admin/classes", label: "Classes", icon: BookOpen, desc: "Sections & rosters", tone: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
  { to: "/admin/attendance", label: "Attendance", icon: ClipboardCheck, desc: "Daily registers", tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { to: "/admin/exams", label: "Exams & Marks", icon: Award, desc: "Grading & scores", tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { to: "/admin/report-cards", label: "Report Cards", icon: GraduationCap, desc: "Term distributions", tone: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { to: "/admin/fees", label: "Fees & Finance", icon: Wallet, desc: "Invoices & payments", tone: "bg-green-500/10 text-green-600 dark:text-green-400" },
  { to: "/admin/applications", label: "Admissions", icon: FileText, desc: "New inquiries", tone: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
];

function ChartCard({ title, description, badge, children }) {
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-4">
        <div>
          <h3 className="font-heading text-base font-bold text-fg">{title}</h3>
          {description ? <p className="text-xs text-muted mt-0.5">{description}</p> : null}
        </div>
        {badge}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const c = useChartColors();
  const user = useSelector((s) => s.auth.user);
  const currency = useSelector((s) => s.settings.data.currency) || "USD";
  const schoolName = useSelector((s) => s.settings.data.schoolName) || "School";
  const [data, setData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.get("/reports/dashboard").then(({ data }) => data).catch(() => ({})),
      api.get("/announcements", { params: { limit: 3 } }).then(({ data }) => data.announcements || []).catch(() => []),
    ]).then(([dashData, news]) => {
      if (!alive) return;
      setData(dashData);
      setAnnouncements(news.slice(0, 3));
    });
    return () => {
      alive = false;
    };
  }, []);

  const who = user && /admin/i.test(user.name) ? "Administrator" : user?.name?.split(" ")[0] || "Admin";
  const money = (n) => formatCurrency(n || 0, currency);

  const overview = data?.overview || {};
  const enrolment = data?.enrolment || {};
  const attendance = data?.attendance || {};
  const exams = data?.exams || {};
  const fees = data?.fees || {};

  const enrolByClass = (enrolment.perClass || []).map((k) => ({
    name: `${k.name} ${k.section || ""}`.trim(),
    enrolled: k.enrolled || 0,
    capacity: k.capacity || 0,
  }));

  const totalGender = (enrolment.gender?.Male || 0) + (enrolment.gender?.Female || 0);
  const malePct = totalGender ? Math.round(((enrolment.gender?.Male || 0) / totalGender) * 100) : 0;
  const femalePct = totalGender ? Math.round(((enrolment.gender?.Female || 0) / totalGender) * 100) : 0;

  const genderData = [
    { name: `Male (${malePct}%)`, value: enrolment.gender?.Male || 0 },
    { name: `Female (${femalePct}%)`, value: enrolment.gender?.Female || 0 },
  ];

  const attByClass = (attendance.perClass || []).map((k) => ({
    name: k.className,
    rate: k.rate || 0,
  }));

  const gradeDist = Object.entries(exams.gradeDistribution || {}).map(([g, n]) => ({
    name: g,
    count: n,
  }));

  const tooltip = {
    contentStyle: {
      background: c.surface,
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      fontSize: 12,
      boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    },
  };
  const axis = { stroke: c.muted, fontSize: 12, tickLine: false, axisLine: false };

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-7">
      {/* Executive Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-surface p-6 shadow-sm sm:p-8">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> School Management System
              </span>
              {overview.activeTerm ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {overview.activeTerm.name} Active
                </span>
              ) : null}
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-fg sm:text-3xl">
              {greeting()}, {who}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Today is <span className="font-medium text-fg">{todayStr}</span>. Here is the real-time operational overview of {schoolName}.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/students"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow"
            >
              <Plus className="h-3.5 w-3.5" /> Enrol Student
            </Link>
            <Link
              to="/admin/attendance"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-fg shadow-sm transition-all hover:bg-surface-2"
            >
              <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" /> Attendance
            </Link>
            <Link
              to="/admin/fees"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-fg shadow-sm transition-all hover:bg-surface-2"
            >
              <DollarSign className="h-3.5 w-3.5 text-amber-600" /> Collect Fee
            </Link>
            <Link
              to="/admin/announcements"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-fg shadow-sm transition-all hover:bg-surface-2"
            >
              <Megaphone className="h-3.5 w-3.5 text-primary" /> Post Notice
            </Link>
          </div>
        </div>
      </div>

      {data === null ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-7">
          {/* Main KPI Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Enrolled Students"
              value={overview.students ?? 0}
              icon={Users}
              hint={enrolment.totalEnrolled ? `${enrolment.totalEnrolled} active enrolment` : "No active students"}
            />
            <StatCard
              label="Teaching Faculty"
              value={overview.teachers ?? 0}
              icon={Briefcase}
              hint={overview.classes ? `Across ${overview.classes} class sections` : undefined}
            />
            <StatCard
              label="Fee Collection"
              value={overview.feeCollectionRate != null ? `${overview.feeCollectionRate}%` : "0%"}
              icon={Wallet}
              hint={overview.outstanding != null ? `${money(overview.outstanding)} outstanding` : undefined}
            />
            <StatCard
              label="Attendance Rate"
              value={attendance.overallRate != null ? `${attendance.overallRate}%` : "N/A"}
              icon={ClipboardCheck}
              hint={attendance.totalRecords ? `${attendance.totalRecords} total entries recorded` : "No records yet"}
            />
          </div>

          {/* Financial & Institutional Health Snapshot Bar */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-fg">Term Financial Health</h4>
                  <p className="text-xs text-muted">
                    {fees.billed ? `Total billed: ${money(fees.billed)} · Received: ${money(fees.paid)}` : "Fee records for current active term"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-muted">Collection Rate</p>
                  <p className="text-sm font-bold text-fg">
                    {fees.collectionRate != null ? `${fees.collectionRate}%` : overview.feeCollectionRate != null ? `${overview.feeCollectionRate}%` : "0%"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">Outstanding Balance</p>
                  <p className="text-sm font-bold text-danger">{money(fees.outstanding || overview.outstanding || 0)}</p>
                </div>
                {fees.overdueCount > 0 ? (
                  <Badge tone="danger" className="hidden sm:inline-flex">
                    {fees.overdueCount} Overdue Invoices
                  </Badge>
                ) : (
                  <Badge tone="success" className="hidden sm:inline-flex">
                    Healthy Accounts
                  </Badge>
                )}
              </div>
            </div>

            {/* Collection Progress bar */}
            <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, fees.collectionRate || overview.feeCollectionRate || 0)}%`,
                }}
              />
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Enrolment Bar Chart (3 Cols) */}
            <div className="lg:col-span-3">
              <ChartCard
                title="Student Enrolment by Class"
                description="Current student distribution across classrooms"
                badge={<Badge tone="info">{enrolByClass.length} Classes</Badge>}
              >
                <BarChart data={enrolByClass} margin={{ left: -16, right: 10, bottom: 5 }}>
                  <CartesianGrid stroke={c.border} vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" {...axis} />
                  <YAxis allowDecimals={false} {...axis} />
                  <Tooltip cursor={{ fill: `${c.primary}12` }} {...tooltip} />
                  <Bar dataKey="enrolled" name="Enrolled" fill={c.primary} radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ChartCard>
            </div>

            {/* Gender Demographics (2 Cols) */}
            <div className="lg:col-span-2">
              <ChartCard
                title="Gender Demographics"
                description="Student population ratio"
                badge={<Badge tone="neutral">{totalGender} Total</Badge>}
              >
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={56}
                    outerRadius={86}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    <Cell fill={c.primary} />
                    <Cell fill={c.accent} />
                  </Pie>
                  <Tooltip {...tooltip} />
                </PieChart>
              </ChartCard>
            </div>
          </div>

          {/* Attendance and Academic Performance */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Attendance Rate by Class"
              description="Present & Late counted as attended"
              badge={
                attendance.overallRate ? (
                  <Badge tone={attendance.overallRate >= 80 ? "success" : "warning"}>
                    {attendance.overallRate}% Average
                  </Badge>
                ) : null
              }
            >
              <BarChart data={attByClass} margin={{ left: -16, right: 10 }}>
                <CartesianGrid stroke={c.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" {...axis} />
                <YAxis unit="%" domain={[0, 100]} {...axis} />
                <Tooltip cursor={{ fill: `${c.success}12` }} {...tooltip} />
                <Bar dataKey="rate" name="Attendance %" fill={c.success} radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ChartCard>

            <ChartCard
              title="Examination Grade Distribution"
              description={exams.passRate != null ? `Overall School Pass Rate: ${exams.passRate}%` : "Marks summary"}
              badge={
                exams.passRate != null ? (
                  <Badge tone={exams.passRate >= 70 ? "success" : "warning"}>
                    {exams.passRate}% Pass Rate
                  </Badge>
                ) : null
              }
            >
              <BarChart data={gradeDist} margin={{ left: -16, right: 10 }}>
                <CartesianGrid stroke={c.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" {...axis} />
                <YAxis allowDecimals={false} {...axis} />
                <Tooltip cursor={{ fill: `${c.accent}12` }} {...tooltip} />
                <Bar dataKey="count" name="Students" fill={c.accent} radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ChartCard>
          </div>

          {/* Notice Board Widget */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-fg">Active Notices & Announcements</h3>
                  <p className="text-xs text-muted">Latest bulletins broadcast to families and staff</p>
                </div>
              </div>
              <Link
                to="/admin/announcements"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-1.5 transition-all"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {announcements.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No active announcements. Click "Post Notice" to create one.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {announcements.map((a) => (
                  <div key={a._id} className="rounded-xl border border-border/80 bg-surface-2/40 p-3.5 transition-colors hover:border-primary/40">
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <span className="font-semibold text-xs text-fg truncate">{a.title}</span>
                      <Badge tone={a.priority === "Urgent" ? "danger" : a.priority === "Important" ? "warning" : "info"} className="text-[10px] py-0 px-1.5">
                        {a.priority || "Normal"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">{a.body}</p>
                    <p className="mt-2 text-[11px] text-muted/80">{formatDate(a.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Management Navigation Grid */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-muted">
                Quick School Management Access
              </h3>
              <Link to="/admin/reports" className="text-xs font-semibold text-primary hover:underline">
                Open Full Analytics & PDF Reports →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((q) => {
                const Icon = q.icon;
                return (
                  <Link
                    key={q.to}
                    to={q.to}
                    className="group flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
                  >
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${q.tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-fg group-hover:text-primary transition-colors">{q.label}</p>
                      <p className="text-xs text-muted truncate">{q.desc}</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted/60 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

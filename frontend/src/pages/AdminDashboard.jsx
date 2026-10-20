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
  Briefcase,
  ClipboardCheck,
  DollarSign,
  Plus,
  Users,
  Wallet,
} from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { useChartColors } from "../components/ui/useChartColors.js";
import api from "../utils/api.js";
import { formatCurrency } from "../utils/formatter.js";
import { greeting } from "../utils/greeting.js";

function HorizontalStatCard({ label, value, icon: Icon, hint, tone = "primary" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tones[tone] || tones.primary}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted truncate">{label}</p>
        <p className="mt-0.5 font-heading text-2xl font-bold tracking-tight text-fg tabular-nums">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-muted truncate">{hint}</p>}
      </div>
    </div>
  );
}

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

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let res;
        try {
          res = await api.get("/reports/dashboard");
        } catch {
          res = await api.get("/dashboard/admin");
        }
        if (alive && res?.data) {
          setData(res.data);
        }
      } catch (e) {
        console.error("Dashboard error", e);
        if (alive) setData({});
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const overview = data?.overview || {};
  const enrolment = data?.enrolment || {};
  const fees = data?.fees || {};
  const attendance = data?.attendance || {};
  const exams = data?.exams || {};

  const rawClasses = enrolment.perClass || enrolment.byClass || [];
  const enrolByClass = rawClasses.map((b) => ({
    name: b.name ? `${b.name} ${b.section || ""}`.trim() : (b.className || "Class"),
    enrolled: b.enrolled || 0,
    capacity: b.capacity || 0,
  }));

  const genderData = [
    { name: "Male", value: enrolment.gender?.Male ?? enrolment.byGender?.male ?? 0 },
    { name: "Female", value: enrolment.gender?.Female ?? enrolment.byGender?.female ?? 0 },
  ];
  const totalGender = genderData.reduce((s, g) => s + g.value, 0);

  const rawAttendance = attendance.perClass || attendance.byClass || [];
  const attByClass = rawAttendance.map((a) => ({
    name: a.className || a.name || "Class",
    rate: a.rate != null ? a.rate : 0,
    present: a.present || a.attended || 0,
    total: a.total || 0,
  }));

  const gradeDistMap = exams.gradeDistribution || exams.distribution || {};
  const gradeDist = Object.entries(gradeDistMap).map(([grade, count]) => ({
    name: grade,
    count,
  }));

  const money = (n) => formatCurrency(n, currency);
  const who = user?.name ? user.name.split(" ")[0] : "Administrator";
  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const axis = {
    stroke: c.axis,
    fontSize: 12,
    tickLine: false,
  };

  const tooltip = {
    contentStyle: {
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      color: c.tooltipText,
      borderRadius: 12,
      fontSize: 12,
      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
    },
  };

  return (
    <div className="space-y-7">
      {/* Executive Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-surface p-6 shadow-sm sm:p-8">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-fg sm:text-3xl">
              {greeting()}, {who}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Today is <span className="font-medium text-fg">{todayStr}</span>. Here is the operational overview of {schoolName}.
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
          </div>
        </div>
      </div>

      {data === null ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
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
          {/* Main Horizontal KPI Row ("Jiif" cards) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HorizontalStatCard
              label="Enrolled Students"
              value={overview.students ?? 0}
              icon={Users}
              tone="primary"
              hint={enrolment.totalEnrolled ? `${enrolment.totalEnrolled} active enrolment` : "No active students"}
            />
            <HorizontalStatCard
              label="Teaching Faculty"
              value={overview.teachers ?? 0}
              icon={Briefcase}
              tone="indigo"
              hint={overview.classes ? `Across ${overview.classes} class sections` : undefined}
            />
            <HorizontalStatCard
              label="Fee Collection"
              value={overview.feeCollectionRate != null ? `${overview.feeCollectionRate}%` : "0%"}
              icon={Wallet}
              tone="amber"
              hint={overview.outstanding != null ? `${money(overview.outstanding)} outstanding` : undefined}
            />
            <HorizontalStatCard
              label="Attendance Rate"
              value={attendance.overallRate != null ? `${attendance.overallRate}%` : "N/A"}
              icon={ClipboardCheck}
              tone="emerald"
              hint={attendance.totalRecords ? `${attendance.totalRecords} total entries recorded` : "No records yet"}
            />
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
        </div>
      )}
    </div>
  );
}

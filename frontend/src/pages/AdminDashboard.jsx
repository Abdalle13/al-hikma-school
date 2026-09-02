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
  ArrowRight,
  Briefcase,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { useChartColors } from "../components/ui/useChartColors.js";
import api from "../utils/api.js";
import { formatCurrency, formatDate } from "../utils/formatter.js";

const quickLinks = [
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/admin/fees", label: "Fees", icon: Wallet },
  { to: "/admin/applications", label: "Applications", icon: FileText },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function ChartCard({ title, description, children }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
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
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/reports/dashboard")
      .then(({ data }) => setData(data))
      .catch(() => setData({}));
  }, []);

  const who = user && /admin/i.test(user.name) ? "Admin" : user?.name?.split(" ")[0] || "there";
  const money = (n) => formatCurrency(n || 0, currency);

  const overview = data?.overview || {};
  const enrolment = data?.enrolment || {};
  const attendance = data?.attendance || {};
  const exams = data?.exams || {};

  const enrolByClass = (enrolment.perClass || []).map((k) => ({
    name: `${k.name} ${k.section || ""}`.trim(),
    enrolled: k.enrolled,
  }));
  const genderData = [
    { name: "Male", value: enrolment.gender?.Male || 0 },
    { name: "Female", value: enrolment.gender?.Female || 0 },
  ];
  const attByClass = (attendance.perClass || []).map((k) => ({ name: k.className, rate: k.rate || 0 }));
  const gradeDist = Object.entries(exams.gradeDistribution || {}).map(([g, n]) => ({ name: g, count: n }));

  const tooltip = {
    contentStyle: {
      background: c.surface,
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      fontSize: 12,
    },
  };
  const axis = { stroke: c.muted, fontSize: 12, tickLine: false, axisLine: false };

  return (
    <div>
      {/* greeting */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-heading text-xl font-bold text-fg sm:text-[26px]">
            {greeting()}, {who}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {formatDate(new Date())}
            {overview.activeTerm
              ? ` · Active term: ${overview.activeTerm.name} (${overview.activeTerm.academicYear})`
              : ""}
          </p>
        </div>
        <Link
          to="/admin/reports"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2"
        >
          Full reports <ArrowRight className="h-4 w-4 transition-all" />
        </Link>
      </div>

      {data === null ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Enrolled students" value={overview.students ?? "-"} icon={Users} />
            <StatCard label="Teachers" value={overview.teachers ?? "-"} icon={Briefcase} />
            <StatCard
              label="Fee collection"
              value={overview.feeCollectionRate != null ? `${overview.feeCollectionRate}%` : "n/a"}
              icon={Wallet}
              hint={overview.outstanding != null ? `${money(overview.outstanding)} outstanding` : undefined}
            />
            <StatCard
              label="Attendance rate"
              value={attendance.overallRate != null ? `${attendance.overallRate}%` : "n/a"}
              icon={ClipboardCheck}
              hint={attendance.totalRecords ? `${attendance.totalRecords} marks` : undefined}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ChartCard title="Enrolment by class">
                <BarChart data={enrolByClass} margin={{ left: -16 }}>
                  <CartesianGrid stroke={c.border} vertical={false} />
                  <XAxis dataKey="name" {...axis} />
                  <YAxis allowDecimals={false} {...axis} />
                  <Tooltip cursor={{ fill: `${c.primary}12` }} {...tooltip} />
                  <Bar dataKey="enrolled" fill={c.primary} radius={[6, 6, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ChartCard>
            </div>
            <div className="lg:col-span-2">
              <ChartCard title="Gender split">
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={84}
                    paddingAngle={3}
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

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Attendance rate by class" description="Present and late count as attended.">
              <BarChart data={attByClass} margin={{ left: -16 }}>
                <CartesianGrid stroke={c.border} vertical={false} />
                <XAxis dataKey="name" {...axis} />
                <YAxis unit="%" domain={[0, 100]} {...axis} />
                <Tooltip cursor={{ fill: `${c.success}12` }} {...tooltip} />
                <Bar dataKey="rate" fill={c.success} radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ChartCard>

            <ChartCard
              title="Grade distribution"
              description={exams.passRate != null ? `Pass rate ${exams.passRate}%` : undefined}
            >
              <BarChart data={gradeDist} margin={{ left: -16 }}>
                <CartesianGrid stroke={c.border} vertical={false} />
                <XAxis dataKey="name" {...axis} />
                <YAxis allowDecimals={false} {...axis} />
                <Tooltip cursor={{ fill: `${c.accent}12` }} {...tooltip} />
                <Bar dataKey="count" fill={c.accent} radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ChartCard>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((q) => {
              const Icon = q.icon;
              return (
                <Link
                  key={q.to}
                  to={q.to}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-fg">{q.label}</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

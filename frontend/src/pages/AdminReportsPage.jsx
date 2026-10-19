import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
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
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Tabs } from "../components/ui/Tabs.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { useChartColors } from "../components/ui/useChartColors.js";
import api, { apiError } from "../utils/api.js";
import { formatCurrency } from "../utils/formatter.js";
import { exportReportsPdf } from "../utils/reportPdf.js";

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

export default function AdminReportsPage() {
  const c = useChartColors();
  const { schoolName, currency } = useSelector((s) => s.settings.data);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    api
      .get("/reports/dashboard")
      .then(({ data }) =>
        setData({
          overview: data.overview || {},
          enrolment: data.enrolment || {},
          attendance: data.attendance || {},
          exams: data.exams || {},
          fees: data.fees || {},
        })
      )
      .catch((err) => {
        toast.error(apiError(err, "Could not load report metrics"));
        setData({});
      });
  }, []);

  async function onExportPdf() {
    setExportingPdf(true);
    try {
      await exportReportsPdf({
        schoolName: schoolName || "School",
        term: data.overview?.activeTerm?.name,
        ...data,
      });
      toast.success("PDF report generated");
    } catch (err) {
      toast.error(apiError(err, "Could not build PDF report"));
    } finally {
      setExportingPdf(false);
    }
  }

  function onExportCsv() {
    if (!data) return;
    try {
      const rows = [
        ["School Analytics & Operations Summary Report"],
        ["Generated", new Date().toLocaleString()],
        ["School", schoolName || "School"],
        ["Term", data.overview?.activeTerm?.name || "N/A"],
        [],
        ["1. ENROLMENT & CLASSES"],
        ["Class", "Enrolled", "Capacity", "Graduated", "Withdrawn"],
        ...(data.enrolment?.perClass || []).map((c) => [
          `${c.name} ${c.section || ""}`.trim(),
          c.enrolled,
          c.capacity,
          c.graduated || 0,
          c.withdrawn || 0,
        ]),
        [],
        ["2. FEES & REVENUE BY CLASS"],
        ["Class", "Billed", "Paid", "Outstanding", "Collection %"],
        ...(data.fees?.perClass || []).map((f) => [
          `${f.className} ${f.section || ""}`.trim(),
          f.billed,
          f.paid,
          f.outstanding,
          f.billed ? `${Math.round((f.paid / f.billed) * 100)}%` : "0%",
        ]),
        [],
        ["3. ACADEMIC PERFORMANCE BY SUBJECT"],
        ["Subject", "Average Score %", "Marks Counted"],
        ...(data.exams?.perSubject || []).map((s) => [s.name, `${s.averagePercentage}%`, s.marksCounted]),
        [],
        ["4. ATTENDANCE BY CLASS"],
        ["Class", "Attendance Rate %"],
        ...(data.attendance?.perClass || []).map((a) => [a.className, `${a.rate}%`]),
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `school_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV spreadsheet exported");
    } catch (err) {
      toast.error("Could not export CSV data");
    }
  }

  if (data === null) {
    return (
      <div className="space-y-6">
        <PageHeader title="School Reports & Analytics" description="Loading report aggregates..." />
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
    );
  }

  const { overview = {}, enrolment = {}, attendance = {}, exams = {}, fees = {} } = data;
  const money = (n) => formatCurrency(n || 0, currency || "USD");

  const enrolByClass = (enrolment.perClass || []).map((k) => ({
    name: `${k.name} ${k.section || ""}`.trim(),
    enrolled: k.enrolled,
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
  const axis = { stroke: c.muted, fontSize: 12, tickLine: false };

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Reports & Intelligence"
        description="Comprehensive analysis of enrolment demographics, academic grades, attendance health, and fee collections."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={onExportCsv} className="text-xs">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export CSV
            </Button>
            <Button onClick={onExportPdf} disabled={exportingPdf} className="text-xs">
              <Download className="h-4 w-4" /> {exportingPdf ? "Generating PDF..." : "Export PDF Report"}
            </Button>
          </div>
        }
      />

      {/* KPI Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Enrolment"
          value={overview.students ?? 0}
          icon={Users}
          hint={enrolment.totalEnrolled ? `${enrolment.totalEnrolled} active in class` : "No active students"}
        />
        <StatCard
          label="Teaching Staff"
          value={overview.teachers ?? 0}
          icon={GraduationCap}
          hint={overview.classes ? `${overview.classes} registered classes` : undefined}
        />
        <StatCard
          label="Fee Collection Efficiency"
          value={overview.feeCollectionRate != null ? `${overview.feeCollectionRate}%` : "0%"}
          icon={Wallet}
          hint={overview.outstanding != null ? `${money(overview.outstanding)} outstanding` : undefined}
        />
        <StatCard
          label="Overall Attendance"
          value={attendance.overallRate != null ? `${attendance.overallRate}%` : "N/A"}
          icon={ClipboardCheck}
          hint={attendance.totalRecords ? `${attendance.totalRecords} attendance marks` : undefined}
        />
      </div>

      {/* Report Categories Tabs */}
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          { value: "overview", label: "Executive Overview" },
          { value: "fees", label: "Financial & Fees" },
          { value: "academics", label: "Academics & Exams" },
          { value: "attendance", label: "Attendance & Enrolment" },
        ]}
      />

      {/* Tab 1: Executive Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Class Enrolment Volume">
              <BarChart data={enrolByClass}>
                <CartesianGrid stroke={c.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" {...axis} />
                <YAxis allowDecimals={false} {...axis} />
                <Tooltip {...tooltip} />
                <Bar dataKey="enrolled" name="Enrolled" fill={c.primary} radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Gender Distribution">
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={86} paddingAngle={4}>
                  <Cell fill={c.primary} />
                  <Cell fill={c.accent} />
                </Pie>
                <Tooltip {...tooltip} />
              </PieChart>
            </ChartCard>

            <ChartCard title="Attendance Rate by Class" description="Present and late count as attended.">
              <BarChart data={attByClass}>
                <CartesianGrid stroke={c.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" {...axis} />
                <YAxis unit="%" domain={[0, 100]} {...axis} />
                <Tooltip {...tooltip} />
                <Bar dataKey="rate" name="Rate %" fill={c.success} radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ChartCard>

            <ChartCard
              title="Exam Grade Distribution"
              description={exams.passRate != null ? `Pass rate ${exams.passRate}%` : undefined}
            >
              <BarChart data={gradeDist}>
                <CartesianGrid stroke={c.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" {...axis} />
                <YAxis allowDecimals={false} {...axis} />
                <Tooltip {...tooltip} />
                <Bar dataKey="count" name="Count" fill={c.accent} radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ChartCard>
          </div>
        </div>
      )}

      {/* Tab 2: Financial & Fees Report */}
      {activeTab === "fees" && (
        <div className="space-y-6">
          {/* Financial summary KPIs */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-medium text-muted">Total Invoiced (Billed)</p>
              <p className="mt-1 text-xl font-bold text-fg">{money(fees.billed)}</p>
              <p className="mt-1 text-[11px] text-muted">{fees.invoices || 0} invoices issued</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-medium text-muted">Total Collected (Paid)</p>
              <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{money(fees.paid)}</p>
              <p className="mt-1 text-[11px] text-emerald-600">
                {fees.collectionRate != null ? `${fees.collectionRate}% efficiency` : "0%"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-medium text-muted">Total Outstanding Balance</p>
              <p className="mt-1 text-xl font-bold text-danger">{money(fees.outstanding)}</p>
              <p className="mt-1 text-[11px] text-danger">Pending collection</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-medium text-muted">Overdue Invoices</p>
              <p className="mt-1 text-xl font-bold text-amber-600">{fees.overdueCount || 0}</p>
              <p className="mt-1 text-[11px] text-muted">Past payment due date</p>
            </div>
          </div>

          {/* Fees Per Class Breakdown Table */}
          <Card>
            <CardHeader
              title="Class Fee Collection Breakdown"
              description="Detailed billing, collected revenue, and outstanding balance by classroom section."
            />
            {(fees.perClass || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">No fee records found for current term.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table headers={["Class Section", "Total Billed", "Total Paid", "Outstanding Balance", "Collection %", "Status"]}>
                  {fees.perClass.map((k, i) => {
                    const rate = k.billed ? Math.round((k.paid / k.billed) * 100) : 0;
                    return (
                      <Table.Row key={i}>
                        <Table.Cell className="font-semibold text-fg">
                          {k.className} {k.section}
                        </Table.Cell>
                        <Table.Cell className="tabular-nums font-mono text-muted">{money(k.billed)}</Table.Cell>
                        <Table.Cell className="tabular-nums font-mono font-medium text-emerald-600">{money(k.paid)}</Table.Cell>
                        <Table.Cell className="tabular-nums font-mono font-medium text-danger">{money(k.outstanding)}</Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                              <div
                                className={`h-full rounded-full ${rate >= 80 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-500" : "bg-danger"}`}
                                style={{ width: `${Math.min(100, rate)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold tabular-nums">{rate}%</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge tone={rate >= 80 ? "success" : rate >= 50 ? "warning" : "danger"} className="text-[10px]">
                            {rate >= 80 ? "Healthy" : rate >= 50 ? "Moderate" : "Action Needed"}
                          </Badge>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 3: Academics & Exams Report */}
      {activeTab === "academics" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Grade Distribution Overview"
              description={`Pass rate: ${exams.passRate != null ? `${exams.passRate}%` : "N/A"}`}
              badge={<Badge tone="info">{exams.totalMarks || 0} Total Marks</Badge>}
            >
              <BarChart data={gradeDist}>
                <CartesianGrid stroke={c.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" {...axis} />
                <YAxis allowDecimals={false} {...axis} />
                <Tooltip {...tooltip} />
                <Bar dataKey="count" name="Students" fill={c.accent} radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ChartCard>

            <Card>
              <CardHeader
                title="Subject Performance Ranking"
                description="Average score achieved across classes in each subject curriculum."
              />
              {(exams.perSubject || []).length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">No examination marks entered yet.</p>
              ) : (
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <Table headers={["Subject", "Class Average", "Marks Entered", "Rating"]}>
                    {exams.perSubject.map((s) => (
                      <Table.Row key={s.subject}>
                        <Table.Cell className="font-semibold text-fg">{s.name}</Table.Cell>
                        <Table.Cell className="tabular-nums font-mono font-medium text-fg">
                          {s.averagePercentage}%
                        </Table.Cell>
                        <Table.Cell className="tabular-nums text-muted">{s.marksCounted}</Table.Cell>
                        <Table.Cell>
                          <Badge
                            tone={
                              s.averagePercentage >= 75
                                ? "success"
                                : s.averagePercentage >= 50
                                ? "info"
                                : "danger"
                            }
                            className="text-[10px]"
                          >
                            {s.averagePercentage >= 75
                              ? "Distinction"
                              : s.averagePercentage >= 50
                              ? "Satisfactory"
                              : "Needs Review"}
                          </Badge>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab 4: Attendance & Enrolment Report */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Attendance Health by Class"
              description="Overall rate is calculated from present and late entries."
              badge={<Badge tone="success">{attendance.overallRate || 0}% School Average</Badge>}
            >
              <BarChart data={attByClass}>
                <CartesianGrid stroke={c.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" {...axis} />
                <YAxis unit="%" domain={[0, 100]} {...axis} />
                <Tooltip {...tooltip} />
                <Bar dataKey="rate" name="Attendance %" fill={c.success} radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ChartCard>

            <Card>
              <CardHeader
                title="Classroom Attendance & Enrolment Roster"
                description="Status breakdown per active classroom section."
              />
              {(enrolment.perClass || []).length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">No classrooms found.</p>
              ) : (
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <Table headers={["Class Section", "Enrolled", "Capacity", "Occupancy %"]}>
                    {enrolment.perClass.map((c) => {
                      const occ = c.capacity ? Math.round((c.enrolled / c.capacity) * 100) : 0;
                      return (
                        <Table.Row key={c._id}>
                          <Table.Cell className="font-semibold text-fg">
                            {c.name} {c.section}
                          </Table.Cell>
                          <Table.Cell className="tabular-nums font-medium text-fg">{c.enrolled}</Table.Cell>
                          <Table.Cell className="tabular-nums text-muted">{c.capacity}</Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-surface-2">
                                <div
                                  className={`h-full rounded-full ${occ >= 90 ? "bg-amber-500" : "bg-primary"}`}
                                  style={{ width: `${Math.min(100, occ)}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold tabular-nums">{occ}%</span>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

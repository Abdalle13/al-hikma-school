import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Download, Users, Wallet, GraduationCap, ClipboardCheck } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { useChartColors } from "../components/ui/useChartColors.js";
import api, { apiError } from "../utils/api.js";
import { formatCurrency } from "../utils/formatter.js";
import { exportReportsPdf } from "../utils/reportPdf.js";

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

export default function AdminReportsPage() {
  const c = useChartColors();
  const { schoolName, currency } = useSelector((s) => s.settings.data);
  const [data, setData] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api.get("/reports/dashboard")
      .then(({ data }) => setData({
        overview: data.overview || {},
        enrolment: data.enrolment || {},
        attendance: data.attendance || {},
        exams: data.exams || {},
        fees: data.fees || {},
      }))
      .catch((err) => { toast.error(apiError(err, "Could not load the reports")); setData({}); });
  }, []);

  async function onExport() {
    setExporting(true);
    try {
      await exportReportsPdf({
        schoolName,
        term: data.overview?.activeTerm?.name,
        ...data,
      });
    } catch (err) {
      toast.error(apiError(err, "Could not build the PDF"));
    } finally {
      setExporting(false);
    }
  }

  if (data === null) {
    return (
      <div>
        <PageHeader
          title="Reports"
          description="Enrolment, attendance, exam performance and fee collection at a glance."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      </div>
    );
  }

  const { overview = {}, enrolment = {}, attendance = {}, exams = {}, fees = {} } = data;
  const money = (n) => formatCurrency(n || 0, currency || "USD");

  const enrolByClass = (enrolment.perClass || []).map((k) => ({ name: `${k.name} ${k.section || ""}`.trim(), enrolled: k.enrolled }));
  const genderData = [
    { name: "Male", value: enrolment.gender?.Male || 0 },
    { name: "Female", value: enrolment.gender?.Female || 0 },
  ];
  const attByClass = (attendance.perClass || []).map((k) => ({ name: k.className, rate: k.rate || 0 }));
  const gradeDist = Object.entries(exams.gradeDistribution || {}).map(([g, n]) => ({ name: g, count: n }));

  const tooltip = { contentStyle: { background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, fontSize: 12 } };
  const axis = { stroke: c.muted, fontSize: 12, tickLine: false };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Enrolment, attendance, exam performance and fee collection at a glance."
        action={
          <Button onClick={onExport} disabled={exporting}>
            <Download className="h-4 w-4" /> {exporting ? "Building..." : "Export PDF"}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled students" value={overview.students ?? "-"} icon={Users} />
        <StatCard label="Teachers" value={overview.teachers ?? "-"} icon={GraduationCap} />
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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Enrolment by class">
          <BarChart data={enrolByClass}>
            <CartesianGrid stroke={c.border} vertical={false} />
            <XAxis dataKey="name" {...axis} />
            <YAxis allowDecimals={false} {...axis} />
            <Tooltip {...tooltip} />
            <Bar dataKey="enrolled" fill={c.primary} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Gender split">
          <PieChart>
            <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
              <Cell fill={c.primary} />
              <Cell fill={c.accent} />
            </Pie>
            <Tooltip {...tooltip} />
          </PieChart>
        </ChartCard>

        <ChartCard title="Attendance rate by class" description="Present and late count as attended.">
          <BarChart data={attByClass}>
            <CartesianGrid stroke={c.border} vertical={false} />
            <XAxis dataKey="name" {...axis} />
            <YAxis unit="%" domain={[0, 100]} {...axis} />
            <Tooltip {...tooltip} />
            <Bar dataKey="rate" fill={c.success} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Grade distribution" description={exams.passRate != null ? `Pass rate ${exams.passRate}%` : undefined}>
          <BarChart data={gradeDist}>
            <CartesianGrid stroke={c.border} vertical={false} />
            <XAxis dataKey="name" {...axis} />
            <YAxis allowDecimals={false} {...axis} />
            <Tooltip {...tooltip} />
            <Bar dataKey="count" fill={c.accent} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Fees by class" />
          {(fees.perClass || []).length === 0 ? (
            <p className="text-sm text-muted">No invoices yet.</p>
          ) : (
            <Table headers={["Class", "Billed", "Paid", "Outstanding"]}>
              {fees.perClass.map((k, i) => (
                <Table.Row key={i}>
                  <Table.Cell className="font-medium">{k.className} {k.section}</Table.Cell>
                  <Table.Cell className="tabular-nums text-muted">{money(k.billed)}</Table.Cell>
                  <Table.Cell className="tabular-nums text-success">{money(k.paid)}</Table.Cell>
                  <Table.Cell className="tabular-nums text-danger">{money(k.outstanding)}</Table.Cell>
                </Table.Row>
              ))}
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="Exam averages by subject" />
          {(exams.perSubject || []).length === 0 ? (
            <p className="text-sm text-muted">No marks entered yet.</p>
          ) : (
            <Table headers={["Subject", "Average", "Marks"]}>
              {exams.perSubject.map((s) => (
                <Table.Row key={s.subject}>
                  <Table.Cell className="font-medium">{s.name}</Table.Cell>
                  <Table.Cell className="tabular-nums text-muted">{s.averagePercentage}%</Table.Cell>
                  <Table.Cell className="tabular-nums text-muted">{s.marksCounted}</Table.Cell>
                </Table.Row>
              ))}
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}

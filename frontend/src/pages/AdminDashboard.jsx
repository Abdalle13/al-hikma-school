import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, Briefcase, ClipboardCheck, GraduationCap, School, Users, Wallet } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import api from "../utils/api.js";
import { formatCurrency } from "../utils/formatter.js";

const quickLinks = [
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/admin/fees", label: "Fees", icon: Wallet },
  { to: "/admin/applications", label: "Applications", icon: School },
];

export default function AdminDashboard() {
  const currency = useSelector((s) => s.settings.data.currency) || "USD";
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    api.get("/reports/overview").then(({ data }) => setOverview(data)).catch(() => setOverview({}));
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={overview?.activeTerm ? `Active term: ${overview.activeTerm.name} (${overview.activeTerm.academicYear})` : "Welcome back."}
        action={
          <Link to="/admin/reports" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2">
            Full reports <ArrowRight className="h-4 w-4 transition-all" />
          </Link>
        }
      />

      {overview === null ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Enrolled students" value={overview.students ?? "-"} icon={Users} />
          <StatCard label="Teachers" value={overview.teachers ?? "-"} icon={Briefcase} />
          <StatCard label="Classes" value={overview.classes ?? "-"} icon={GraduationCap} />
          <StatCard
            label="Fee collection"
            value={overview.feeCollectionRate != null ? `${overview.feeCollectionRate}%` : "n/a"}
            icon={Wallet}
            hint={overview.outstanding != null ? `${formatCurrency(overview.outstanding, currency)} outstanding` : undefined}
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
  );
}

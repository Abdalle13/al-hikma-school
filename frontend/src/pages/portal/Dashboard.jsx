import { Users, ClipboardCheck, Wallet, GraduationCap } from "lucide-react";
import { PageHeader } from "../../components/PageHeader.jsx";
import { StatCard } from "../../components/ui/StatCard.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";

export function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview placeholder. Real numbers arrive with the reports phase."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value="000" icon={Users} />
        <StatCard label="Attendance today" value="00%" icon={ClipboardCheck} />
        <StatCard label="Fees collected" value="0%" icon={Wallet} />
        <StatCard label="Report cards published" value="00" icon={GraduationCap} />
      </div>
      <div className="mt-6">
        <EmptyState
          title="No activity yet"
          description="Recent attendance, payments and announcements will show here."
        />
      </div>
    </div>
  );
}

export default Dashboard;

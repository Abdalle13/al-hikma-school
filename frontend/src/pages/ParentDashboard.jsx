import { ClipboardCheck, GraduationCap, Wallet } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";

export default function ParentDashboard() {
  return (
    <div>
      <PageHeader
        title="Parent dashboard"
        description="Placeholder. Once wired, a child switcher shows here when you have more than one child."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Attendance this term" value="00%" icon={ClipboardCheck} />
        <StatCard label="Latest average" value="00%" icon={GraduationCap} />
        <StatCard label="Fee balance" value="0.00" icon={Wallet} />
      </div>
      <div className="mt-6">
        <EmptyState title="Nothing here yet" description="Your children's attendance, report cards and fees will show here." />
      </div>
    </div>
  );
}

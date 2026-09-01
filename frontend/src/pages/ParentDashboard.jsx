import { useOutletContext } from "react-router-dom";
import { ClipboardCheck, GraduationCap, Wallet } from "lucide-react";
import { StatCard } from "../components/ui/StatCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";

export default function ParentDashboard() {
  const { selectedChild } = useOutletContext();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-fg">
          {selectedChild ? `${selectedChild.name.split(" ")[0]}'s dashboard` : "Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {selectedChild?.admissionNo ? `Admission no. ${selectedChild.admissionNo}` : "Placeholder overview."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Attendance this term" value="00%" icon={ClipboardCheck} />
        <StatCard label="Latest average" value="00%" icon={GraduationCap} />
        <StatCard label="Fee balance" value="0.00" icon={Wallet} />
      </div>
      <div className="mt-6">
        <EmptyState
          title="Nothing here yet"
          description="Attendance, report cards and fees for this child arrive in later phases."
        />
      </div>
    </div>
  );
}

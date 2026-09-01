import { ClipboardCheck, GraduationCap, CalendarClock } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";

export default function TeacherDashboard() {
  return (
    <div>
      <PageHeader
        title="Teacher dashboard"
        description="Placeholder. Attendance marking and mark entry are built in later phases."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="My classes" value="0" icon={CalendarClock} />
        <StatCard label="Attendance to mark today" value="0" icon={ClipboardCheck} />
        <StatCard label="Marks pending" value="0" icon={GraduationCap} />
      </div>
      <div className="mt-6">
        <EmptyState title="Nothing to do yet" description="Your classes and today's tasks will show here." />
      </div>
    </div>
  );
}

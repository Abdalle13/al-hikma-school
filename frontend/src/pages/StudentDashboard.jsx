import { ClipboardCheck, GraduationCap, CalendarClock } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";

export default function StudentDashboard() {
  return (
    <div>
      <PageHeader
        title="Student dashboard"
        description="Placeholder. A light view of your own timetable, grades and attendance."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Attendance this term" value="00%" icon={ClipboardCheck} />
        <StatCard label="Latest average" value="00%" icon={GraduationCap} />
        <StatCard label="Classes today" value="0" icon={CalendarClock} />
      </div>
      <div className="mt-6">
        <EmptyState title="Nothing here yet" description="Your timetable, grades and attendance will show here." />
      </div>
    </div>
  );
}

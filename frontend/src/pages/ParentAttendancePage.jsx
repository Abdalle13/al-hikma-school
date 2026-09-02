import { useOutletContext } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { StudentAttendanceView } from "../components/ui/StudentAttendanceView.jsx";

export default function ParentAttendancePage() {
  const { selectedChild } = useOutletContext();

  return (
    <div>
      <PageHeader
        title="Attendance"
        description={selectedChild ? `${selectedChild.name}'s daily register this term.` : "Pick a child at the top."}
      />
      {selectedChild ? (
        <StudentAttendanceView studentId={selectedChild._id} />
      ) : (
        <EmptyState title="No child selected" description="Choose a child at the top of the page." />
      )}
    </div>
  );
}

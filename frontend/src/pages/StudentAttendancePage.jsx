import { useSelector } from "react-redux";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StudentAttendanceView } from "../components/ui/StudentAttendanceView.jsx";

export default function StudentAttendancePage() {
  const me = useSelector((s) => s.auth.user);

  return (
    <div>
      <PageHeader title="My attendance" description="Your daily register for the term." />
      <StudentAttendanceView studentId={me._id} />
    </div>
  );
}

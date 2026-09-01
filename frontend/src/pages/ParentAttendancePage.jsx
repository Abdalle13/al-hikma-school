import { useOutletContext } from "react-router-dom";
import { StudentAttendanceView } from "../components/ui/StudentAttendanceView.jsx";

export default function ParentAttendancePage() {
  const { selectedChild } = useOutletContext();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-fg">Attendance</h1>
      <p className="mb-5 text-sm text-muted">
        {selectedChild ? selectedChild.name : "Select a child"}
      </p>
      {selectedChild ? <StudentAttendanceView studentId={selectedChild._id} /> : null}
    </div>
  );
}

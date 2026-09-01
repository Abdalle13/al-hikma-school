import { useOutletContext } from "react-router-dom";
import { StudentGradesView } from "../components/ui/StudentGradesView.jsx";

export default function ParentGradesPage() {
  const { selectedChild } = useOutletContext();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-fg">Report cards</h1>
      <p className="mb-5 text-sm text-muted">{selectedChild ? selectedChild.name : "Select a child"}</p>
      {selectedChild ? <StudentGradesView studentId={selectedChild._id} /> : null}
    </div>
  );
}

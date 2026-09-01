import { useSelector } from "react-redux";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StudentGradesView } from "../components/ui/StudentGradesView.jsx";

export default function StudentGradesPage() {
  const me = useSelector((s) => s.auth.user);

  return (
    <div>
      <PageHeader title="My report cards" description="Published results for each term." />
      <StudentGradesView studentId={me._id} />
    </div>
  );
}

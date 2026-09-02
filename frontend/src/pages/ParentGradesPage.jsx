import { useOutletContext } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { StudentGradesView } from "../components/ui/StudentGradesView.jsx";

export default function ParentGradesPage() {
  const { selectedChild } = useOutletContext();

  return (
    <div>
      <PageHeader
        title="Report cards"
        description={selectedChild ? `${selectedChild.name}'s published results, term by term.` : "Pick a child at the top."}
      />
      {selectedChild ? (
        <StudentGradesView studentId={selectedChild._id} />
      ) : (
        <EmptyState title="No child selected" description="Choose a child at the top of the page." />
      )}
    </div>
  );
}

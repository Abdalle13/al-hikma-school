import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { ExamsView } from "../components/ui/ExamsView.jsx";
import api from "../utils/api.js";

// a teacher can create exams only for class + subject pairs they are assigned
// to teach, so the class options come from their teaching assignments.
export default function TeacherExamsPage() {
  const me = useSelector((s) => s.auth.user);
  const [classOptions, setClassOptions] = useState(null);

  useEffect(() => {
    api
      .get("/assignments")
      .then(({ data }) => {
        const map = new Map();
        data.assignments.forEach((a) => {
          if (!a.schoolClass) return;
          const entry = map.get(a.schoolClass._id) || {
            _id: a.schoolClass._id,
            name: a.schoolClass.name,
            section: a.schoolClass.section,
            subjects: [],
          };
          if (a.subject && !entry.subjects.some((s) => s._id === a.subject._id)) {
            entry.subjects.push({ _id: a.subject._id, name: a.subject.name, code: a.subject.code });
          }
          map.set(a.schoolClass._id, entry);
        });
        setClassOptions([...map.values()]);
      })
      .catch(() => setClassOptions([]));
  }, [me._id]);

  return (
    <div>
      <PageHeader title="Exams and marks" description="Create exams and enter marks for the subjects you teach." />
      {classOptions === null ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : classOptions.length === 0 ? (
        <EmptyState
          title="No teaching assignments"
          description="Ask an admin to assign you a subject in a class, then you can create exams here."
        />
      ) : (
        <ExamsView classOptions={classOptions} />
      )}
    </div>
  );
}

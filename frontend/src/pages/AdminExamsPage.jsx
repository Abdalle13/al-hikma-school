import { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { ExamsView } from "../components/ui/ExamsView.jsx";
import api from "../utils/api.js";

export default function AdminExamsPage() {
  const [classes, setClasses] = useState(null);

  useEffect(() => {
    api.get("/classes").then(({ data }) => setClasses(data.classes)).catch(() => setClasses([]));
  }, []);

  return (
    <div>
      <PageHeader title="Exams" description="Exams and mark entry across every class." />
      {classes === null ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : (
        <ExamsView classOptions={classes} />
      )}
    </div>
  );
}

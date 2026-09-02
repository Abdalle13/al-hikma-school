import { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { TimetableGrid } from "../components/ui/TimetableGrid.jsx";
import api from "../utils/api.js";

export default function TeacherTimetablePage() {
  const [slots, setSlots] = useState(null);

  useEffect(() => {
    api
      .get("/timetable/me")
      .then(({ data }) => setSlots(data.slots || []))
      .catch(() => setSlots([]));
  }, []);

  return (
    <div>
      <PageHeader title="My timetable" description="Every period you teach this week, across all classes." />
      {slots === null ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : (
        <TimetableGrid
          entries={slots}
          secondaryLabel={(e) => `${e.schoolClass?.name || ""} ${e.schoolClass?.section || ""}`.trim()}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { TimetableGrid } from "../components/ui/TimetableGrid.jsx";
import api from "../utils/api.js";

export default function StudentTimetablePage() {
  const [state, setState] = useState({ status: "loading", entries: [] });

  useEffect(() => {
    api
      .get("/timetable/me")
      .then(({ data }) => setState({ status: "ok", entries: data.timetable?.entries || [] }))
      .catch((err) =>
        setState({ status: err.response?.status === 404 ? "none" : "error", entries: [] })
      );
  }, []);

  return (
    <div>
      <PageHeader title="My timetable" description="Your class schedule for the week." />
      {state.status === "loading" ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : state.status === "none" ? (
        <EmptyState title="No timetable yet" description="Your class does not have a timetable set up yet." />
      ) : (
        <TimetableGrid entries={state.entries} secondaryLabel={(e) => e.teacher?.name} />
      )}
    </div>
  );
}

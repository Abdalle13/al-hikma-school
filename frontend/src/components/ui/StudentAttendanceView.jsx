import { useEffect, useState } from "react";
import { CalendarX } from "lucide-react";
import { Card } from "./Card.jsx";
import { Badge } from "./Badge.jsx";
import { Spinner } from "./Spinner.jsx";
import { EmptyState } from "./EmptyState.jsx";
import api from "../../utils/api.js";
import { formatDate } from "../../utils/formatter.js";

const tone = { Present: "success", Absent: "danger", Late: "warning", Excused: "info" };

export function StudentAttendanceView({ studentId }) {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    let alive = true;
    setSummary(null);
    setHistory(null);
    api.get(`/attendance/summary/${studentId}`).then(({ data }) => alive && setSummary(data)).catch(() => alive && setSummary({}));
    api.get("/attendance", { params: { student: studentId } }).then(({ data }) => alive && setHistory(data.history)).catch(() => alive && setHistory([]));
    return () => {
      alive = false;
    };
  }, [studentId]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Attendance rate</p>
          <p className="mt-1 text-2xl font-bold text-fg tabular-nums">
            {summary === null ? "-" : summary.attendanceRate == null ? "n/a" : `${summary.attendanceRate}%`}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Days recorded</p>
          <p className="mt-1 text-2xl font-bold text-fg tabular-nums">
            {summary === null ? "-" : summary.totalDays ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Absences</p>
          <p className="mt-1 text-2xl font-bold text-fg tabular-nums">
            {summary === null ? "-" : summary.counts?.Absent ?? 0}
          </p>
        </Card>
      </div>

      {history === null ? (
        <div className="grid place-items-center py-12">
          <Spinner />
        </div>
      ) : history.length === 0 ? (
        <EmptyState icon={CalendarX} title="No attendance recorded yet" description="Days will appear here once the teacher starts marking the register." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <ul className="divide-y divide-border">
            {history.map((h) => (
              <li key={h.attendanceId} className="flex items-center justify-between bg-surface px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-fg">{formatDate(h.date)}</p>
                  {h.schoolClass ? (
                    <p className="text-xs text-muted">{h.schoolClass.name} {h.schoolClass.section}</p>
                  ) : null}
                </div>
                <Badge tone={tone[h.status] || "neutral"}>{h.status}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default StudentAttendanceView;

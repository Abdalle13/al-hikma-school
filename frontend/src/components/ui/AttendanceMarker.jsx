import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckCheck } from "lucide-react";
import { Button } from "./Button.jsx";
import { Select } from "./Select.jsx";
import { Input } from "./Input.jsx";
import { Textarea } from "./Textarea.jsx";
import { Avatar } from "./Avatar.jsx";
import { Spinner } from "./Spinner.jsx";
import { EmptyState } from "./EmptyState.jsx";
import api, { apiError } from "../../utils/api.js";
import { cn } from "../../utils/formatter.js";

const STATUSES = ["Present", "Absent", "Late", "Excused"];
const statusStyle = {
  Present: "bg-success text-white border-success",
  Absent: "bg-danger text-white border-danger",
  Late: "bg-warning text-white border-warning",
  Excused: "bg-primary text-white border-primary",
};

function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function AttendanceMarker({ classes }) {
  const [classId, setClassId] = useState(classes[0]?._id || "");
  const [date, setDate] = useState(todayISO());
  const [roster, setRoster] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [note, setNote] = useState("");
  const [existingId, setExistingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!classId) return;
    let alive = true;
    setRoster(null);
    Promise.all([
      api.get("/students", { params: { schoolClass: classId, enrollmentStatus: "Enrolled", limit: 200 } }),
      api.get("/attendance", { params: { schoolClass: classId, date } }),
    ])
      .then(([{ data: r }, { data: a }]) => {
        if (!alive) return;
        const record = a.attendance?.[0] || null;
        const byId = {};
        (record?.records || []).forEach((rec) => {
          byId[rec.student?._id || rec.student] = rec.status;
        });
        setRoster(r.students);
        setStatuses(Object.fromEntries(r.students.map((s) => [s._id, byId[s._id] || "Present"])));
        setNote(record?.note || "");
        setExistingId(record?._id || null);
      })
      .catch((err) => {
        if (alive) {
          toast.error(apiError(err, "Could not load the roster"));
          setRoster([]);
        }
      });
    return () => {
      alive = false;
    };
  }, [classId, date]);

  const counts = useMemo(() => {
    const c = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    Object.values(statuses).forEach((s) => (c[s] += 1));
    return c;
  }, [statuses]);

  function setAll(status) {
    setStatuses((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, status])));
  }

  async function save() {
    if (!roster?.length) return;
    setSaving(true);
    try {
      const { data } = await api.post("/attendance", {
        schoolClass: classId,
        date,
        note,
        records: roster.map((s) => ({ student: s._id, status: statuses[s._id] })),
      });
      setExistingId(data.attendance._id);
      toast.success(
        data.notificationsSent
          ? `Saved. ${data.notificationsSent} parent notification(s) sent for absences.`
          : "Attendance saved"
      );
    } catch (err) {
      toast.error(apiError(err, "Could not save attendance"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)} className="min-w-[12rem]">
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name} {c.section}</option>
          ))}
        </Select>
        <Input label="Date" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
        {existingId ? (
          <span className="pb-2 text-xs font-medium text-muted">Editing an existing record for this day</span>
        ) : null}
      </div>

      {roster === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : roster.length === 0 ? (
        <EmptyState
          title="No students in this class"
          description="Enrol students into this class before marking attendance."
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 text-xs text-muted">
              <span className="text-success">{counts.Present} present</span>
              <span className="text-danger">{counts.Absent} absent</span>
              <span className="text-warning">{counts.Late} late</span>
              <span className="text-primary">{counts.Excused} excused</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setAll("Present")}>
              <CheckCheck className="h-4 w-4" /> Mark all present
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <ul className="divide-y divide-border">
              {roster.map((s) => (
                <li key={s._id} className="flex flex-wrap items-center justify-between gap-3 bg-surface px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-fg">{s.name}</p>
                      <p className="text-xs text-muted tabular-nums">{s.admissionNo}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {STATUSES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatuses((p) => ({ ...p, [s._id]: st }))}
                        className={cn(
                          "rounded-xl border px-2.5 py-1 text-xs font-medium transition-colors",
                          statuses[s._id] === st
                            ? statusStyle[st]
                            : "border-border text-muted hover:bg-surface-2"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Textarea
            label="Note (optional)"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. school trip, half day"
          />

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : existingId ? "Update attendance" : "Save attendance"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default AttendanceMarker;

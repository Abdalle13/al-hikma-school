import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckCheck, RotateCcw, Calendar, Search } from "lucide-react";
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

function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
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
  const [search, setSearch] = useState("");

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
    Object.values(statuses).forEach((s) => {
      if (c[s] !== undefined) c[s] += 1;
    });
    const total = Object.keys(statuses).length || 1;
    const rate = Math.round((c.Present / total) * 100);
    return { ...c, total, rate };
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
        records: roster.map((s) => ({ student: s._id, status: statuses[s._id] || "Present" })),
      });
      setExistingId(data.attendance._id);
      toast.success(
        data.notificationsSent
          ? `Attendance saved. ${data.notificationsSent} parent SMS/notifications queued for absences.`
          : "Attendance saved successfully"
      );
    } catch (err) {
      toast.error(apiError(err, "Could not save attendance"));
    } finally {
      setSaving(false);
    }
  }

  const visibleRoster = useMemo(() => {
    if (!roster) return [];
    if (!search) return roster;
    const q = search.toLowerCase();
    return roster.filter((s) => s.name?.toLowerCase().includes(q) || s.admissionNo?.toLowerCase().includes(q));
  }, [roster, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4">
        <Select
          label="Select Class"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="min-w-[14rem]"
        >
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} {c.section}
            </option>
          ))}
        </Select>

        <div>
          <label className="text-xs font-medium text-fg mb-1 block">Date</label>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs"
            />
            <Button
              type="button"
              variant={date === todayISO() ? "primary" : "outline"}
              size="sm"
              onClick={() => setDate(todayISO())}
            >
              Today
            </Button>
            <Button
              type="button"
              variant={date === yesterdayISO() ? "primary" : "outline"}
              size="sm"
              onClick={() => setDate(yesterdayISO())}
            >
              Yesterday
            </Button>
          </div>
        </div>

        {existingId ? (
          <span className="pb-2 text-xs font-medium text-warning">
            Updating previously recorded register for this date
          </span>
        ) : null}
      </div>

      {roster === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : roster.length === 0 ? (
        <EmptyState
          title="No students enrolled in this class"
          description="Enrol students into this class first to mark the daily register."
        />
      ) : (
        <>
          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3.5">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="font-semibold text-fg">
                Rate: <strong className="text-success text-sm">{counts.rate}%</strong>
              </span>
              <span className="text-success font-medium">{counts.Present} Present</span>
              <span className="text-danger font-medium">{counts.Absent} Absent</span>
              <span className="text-warning font-medium">{counts.Late} Late</span>
              <span className="text-primary font-medium">{counts.Excused} Excused</span>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Search student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-40 text-xs"
              />
              <Button variant="outline" size="sm" onClick={() => setAll("Present")}>
                <CheckCheck className="h-4 w-4" /> All Present
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setAll("Absent")}>
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <ul className="divide-y divide-border">
              {visibleRoster.map((s) => (
                <li
                  key={s._id}
                  className="flex flex-wrap items-center justify-between gap-3 bg-surface px-4 py-3 hover:bg-surface-2/30"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-fg">{s.name}</p>
                      <p className="text-xs text-muted tabular-nums">{s.admissionNo}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {STATUSES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatuses((p) => ({ ...p, [s._id]: st }))}
                        className={cn(
                          "rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
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
            label="Attendance Session Note (optional)"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Rainy morning, special school assembly, sports day"
          />

          <div className="flex justify-end pt-2">
            <Button onClick={save} disabled={saving} size="lg">
              {saving ? "Saving Register..." : existingId ? "Update Attendance Register" : "Submit Attendance Register"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default AttendanceMarker;

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarClock, Plus, X } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { TimetableGrid } from "../components/ui/TimetableGrid.jsx";
import api, { apiError } from "../utils/api.js";

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

export default function AdminTimetablePage() {
  const [classes, setClasses] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [classId, setClassId] = useState("");
  const [entries, setEntries] = useState(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ day: "Saturday", startTime: "08:00", endTime: "08:45", subject: "", teacher: "" });

  const cls = classes?.find((c) => c._id === classId);

  useEffect(() => {
    api.get("/classes").then(({ data }) => {
      setClasses(data.classes);
      setClassId(data.classes[0]?._id || "");
    });
    api.get("/staff").then(({ data }) => setTeachers(data.staff)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!classId) return;
    setEntries(null);
    api
      .get(`/timetable/class/${classId}`)
      .then(({ data }) =>
        setEntries(
          data.timetable.entries.map((e) => ({
            day: e.day,
            startTime: e.startTime,
            endTime: e.endTime,
            subject: e.subject?._id || e.subject,
            teacher: e.teacher?._id || e.teacher,
            _subjectName: e.subject?.name,
            _teacherName: e.teacher?.name,
          }))
        )
      )
      .catch(() => setEntries([]));
  }, [classId]);

  function addSlot() {
    if (!draft.subject || !draft.teacher) {
      toast.error("Pick a subject and a teacher");
      return;
    }
    if (draft.endTime <= draft.startTime) {
      toast.error("End time must be after start time");
      return;
    }
    const sub = cls.subjects.find((s) => s._id === draft.subject);
    const tch = teachers.find((t) => t._id === draft.teacher);
    setEntries((p) => [...p, { ...draft, _subjectName: sub?.name, _teacherName: tch?.name }]);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        schoolClass: classId,
        academicYear: cls.academicYear,
        entries: entries.map((e) => ({
          day: e.day,
          startTime: e.startTime,
          endTime: e.endTime,
          subject: e.subject,
          teacher: e.teacher,
        })),
      };
      await api.put("/timetable", payload);
      toast.success("Timetable saved");
    } catch (err) {
      toast.error(apiError(err, "Could not save the timetable"));
    } finally {
      setSaving(false);
    }
  }

  const gridEntries = (entries || []).map((e) => ({
    day: e.day,
    startTime: e.startTime,
    endTime: e.endTime,
    subject: { name: e._subjectName },
    teacher: { name: e._teacherName },
  }));

  return (
    <div>
      <PageHeader title="Timetable" description="Build the weekly schedule for a class, period by period." />

      {classes === null ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : classes.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No classes yet" description="Add a class first, then build its timetable." />
      ) : (
        <>
          <div className="mb-5 max-w-xs">
            <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
            </Select>
          </div>

          {entries === null ? (
            <div className="grid place-items-center py-12"><Spinner /></div>
          ) : (
            <>
              <div className="mb-5 rounded-2xl border border-border bg-surface p-4">
                <p className="mb-3 text-sm font-semibold text-fg">Add a slot</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <Select label="Day" value={draft.day} onChange={(e) => setDraft((d) => ({ ...d, day: e.target.value }))}>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </Select>
                  <Input label="Start" type="time" value={draft.startTime} onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))} />
                  <Input label="End" type="time" value={draft.endTime} onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))} />
                  <Select label="Subject" value={draft.subject} onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}>
                    <option value="">Choose</option>
                    {(cls?.subjects || []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </Select>
                  <Select label="Teacher" value={draft.teacher} onChange={(e) => setDraft((d) => ({ ...d, teacher: e.target.value }))}>
                    <option value="">Choose</option>
                    {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </Select>
                </div>
                <Button className="mt-3" size="sm" onClick={addSlot}>
                  <Plus className="h-4 w-4" /> Add slot
                </Button>
              </div>

              {entries.length > 0 ? (
                <div className="mb-4 overflow-hidden rounded-2xl border border-border">
                  <ul className="divide-y divide-border">
                    {entries
                      .map((e, i) => ({ ...e, _i: i }))
                      .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.startTime.localeCompare(b.startTime))
                      .map((e) => (
                        <li key={e._i} className="flex items-center justify-between bg-surface px-4 py-2.5 text-sm">
                          <span>
                            <span className="font-medium text-fg">{e.day}</span>
                            <span className="text-muted"> {e.startTime}-{e.endTime} · {e._subjectName} · {e._teacherName}</span>
                          </span>
                          <button type="button" onClick={() => setEntries((p) => p.filter((_, j) => j !== e._i))} className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger">
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : (
                <p className="mb-4 text-sm text-muted">No slots yet. Add the first one above.</p>
              )}

              <div className="mb-6 flex justify-end">
                <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save timetable"}</Button>
              </div>

              <p className="mb-3 text-sm font-semibold text-fg">Preview</p>
              <TimetableGrid entries={gridEntries} secondaryLabel={(e) => e.teacher?.name} />
            </>
          )}
        </>
      )}
    </div>
  );
}

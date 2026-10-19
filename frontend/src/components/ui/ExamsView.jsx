import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ClipboardList,
  Pencil,
  Plus,
  Trash2,
  Award,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  BarChart3,
  Users,
} from "lucide-react";
import { Button } from "./Button.jsx";
import { Input } from "./Input.jsx";
import { Select } from "./Select.jsx";
import { Badge } from "./Badge.jsx";
import { Avatar } from "./Avatar.jsx";
import { Table } from "./Table.jsx";
import { Spinner } from "./Spinner.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { Modal } from "./Modal.jsx";
import { ConfirmDialog } from "./ConfirmDialog.jsx";
import api, { apiError } from "../../utils/api.js";
import { formatDate } from "../../utils/formatter.js";

const TYPES = ["Quiz", "Midterm", "Final"];
const DEFAULT_MARKS = {
  Quiz: 20,
  Midterm: 30,
  Final: 50,
};

function ExamForm({ classOptions, terms, onCancel, onSaved }) {
  const initialClassId = classOptions[0]?._id || "";
  const initialSubjects = classOptions[0]?.subjects || [];

  const [form, setForm] = useState({
    title: "",
    type: "Midterm",
    schoolClass: initialClassId,
    subject: initialSubjects[0]?._id || "",
    term: terms.find((t) => t.isActive)?._id || terms[0]?._id || "",
    maxMarks: 30,
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const subjects = useMemo(
    () => classOptions.find((c) => c._id === form.schoolClass)?.subjects || [],
    [classOptions, form.schoolClass]
  );

  // When class changes, ensure subject is valid
  function handleClassChange(e) {
    const newClassId = e.target.value;
    const cls = classOptions.find((c) => c._id === newClassId);
    const firstSub = cls?.subjects?.[0]?._id || "";
    setForm((f) => ({ ...f, schoolClass: newClassId, subject: firstSub }));
  }

  // When type changes, auto-suggest default marks
  function handleTypeChange(e) {
    const newType = e.target.value;
    setForm((f) => ({
      ...f,
      type: newType,
      maxMarks: DEFAULT_MARKS[newType] || 50,
    }));
  }

  // Auto-generate a clean professional exam title
  function autoGenerateTitle() {
    const cls = classOptions.find((c) => c._id === form.schoolClass);
    const sub = subjects.find((s) => s._id === form.subject);
    const trm = terms.find((t) => t._id === form.term);
    const subName = sub?.name || "Subject";
    const trmName = trm?.name || "Term";
    setForm((f) => ({
      ...f,
      title: `${trmName} ${f.type} - ${subName} (${cls?.name || ""})`,
    }));
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.schoolClass || !form.subject || !form.term || !(Number(form.maxMarks) > 0)) {
      toast.error("Please fill in title, class, subject, term, and valid max marks");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, maxMarks: Number(form.maxMarks) };
      if (!payload.date) delete payload.date;
      const { data } = await api.post("/exams", payload);
      toast.success("Exam created successfully");
      onSaved(data.exam);
    } catch (err) {
      toast.error(apiError(err, "Could not create the exam"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <div>
        <div className="flex items-center justify-between pb-1">
          <label className="text-xs font-medium text-fg">Exam Title</label>
          <button
            type="button"
            onClick={autoGenerateTitle}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Sparkles className="h-3 w-3" /> Auto-fill Title
          </button>
        </div>
        <Input
          value={form.title}
          onChange={set("title")}
          placeholder="e.g. Term 1 Midterm - Mathematics (Grade 4)"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Exam Type" value={form.type} onChange={handleTypeChange}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t} ({DEFAULT_MARKS[t]} Marks)
            </option>
          ))}
        </Select>
        <Input
          label="Maximum Marks"
          type="number"
          min="1"
          value={form.maxMarks}
          onChange={set("maxMarks")}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Class" value={form.schoolClass} onChange={handleClassChange}>
          {classOptions.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} {c.section}
            </option>
          ))}
        </Select>
        <Select label="Subject" value={form.subject} onChange={set("subject")}>
          <option value="">Choose subject</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.code || "SUB"})
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Academic Term" value={form.term} onChange={set("term")}>
          {terms.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} ({t.academicYear}) {t.isActive ? "— Active" : ""}
            </option>
          ))}
        </Select>
        <Input label="Exam Date" type="date" value={form.date} onChange={set("date")} />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create Exam"}
        </Button>
      </div>
    </form>
  );
}

function EditExamForm({ exam, onCancel, onSaved }) {
  const [form, setForm] = useState({
    title: exam.title,
    type: exam.type,
    maxMarks: exam.maxMarks,
    date: exam.date ? new Date(exam.date).toISOString().slice(0, 10) : "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/exams/${exam._id}`, { ...form, maxMarks: Number(form.maxMarks) });
      toast.success("Exam updated");
      onSaved(data.exam);
    } catch (err) {
      toast.error(apiError(err, "Could not update the exam"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <Input label="Title" value={form.title} onChange={set("title")} placeholder="Enter the exam title" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Type" value={form.type} onChange={set("type")}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Input label="Max marks" type="number" min="1" value={form.maxMarks} onChange={set("maxMarks")} />
      </div>
      <Input label="Date" type="date" value={form.date} onChange={set("date")} />
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function MarksModal({ exam, onClose, onSaved }) {
  const [roster, setRoster] = useState(null);
  const [marks, setMarks] = useState({});
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // "all" | "missing" | "graded"
  const [quickScore, setQuickScore] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/students", {
        params: { schoolClass: exam.schoolClass._id, enrollmentStatus: "Enrolled", limit: 200 },
      }),
      api.get(`/exams/${exam._id}/marks`),
    ])
      .then(([{ data: r }, { data: m }]) => {
        setRoster(r.students);
        const by = {};
        m.marks.forEach((x) => {
          by[x.student._id] = { score: x.score, remark: x.remark || "" };
        });
        setMarks(Object.fromEntries(r.students.map((s) => [s._id, by[s._id] || { score: "", remark: "" }])));
      })
      .catch((err) => {
        toast.error(apiError(err, "Could not load the class roster"));
        setRoster([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam._id]);

  // Real-time Class Performance Statistics
  const stats = useMemo(() => {
    if (!roster) return { avg: 0, high: 0, low: 0, graded: 0, passCount: 0 };
    const scores = Object.values(marks)
      .map((m) => Number(m.score))
      .filter((n) => !Number.isNaN(n) && n !== null && n !== undefined && String(n) !== "");

    if (scores.length === 0) return { avg: 0, high: 0, low: 0, graded: 0, passCount: 0 };

    const total = scores.reduce((sum, n) => sum + n, 0);
    const passMarks = Math.round(exam.maxMarks * 0.5);
    const passCount = scores.filter((n) => n >= passMarks).length;

    return {
      avg: Math.round((total / scores.length) * 10) / 10,
      high: Math.max(...scores),
      low: Math.min(...scores),
      graded: scores.length,
      passCount,
      passRate: Math.round((passCount / scores.length) * 100),
    };
  }, [roster, marks, exam.maxMarks]);

  // Bulk fill empty scores
  function applyQuickScore() {
    const val = Number(quickScore);
    if (Number.isNaN(val) || val < 0 || val > exam.maxMarks) {
      toast.error(`Score must be between 0 and ${exam.maxMarks}`);
      return;
    }
    setMarks((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        if (updated[id].score === "" || updated[id].score == null) {
          updated[id] = { ...updated[id], score: val };
        }
      });
      return updated;
    });
    setQuickScore("");
    toast.success("Applied to empty students");
  }

  async function save() {
    const list = (roster || [])
      .filter((s) => marks[s._id]?.score !== "" && marks[s._id]?.score != null)
      .map((s) => ({
        student: s._id,
        score: Number(marks[s._id].score),
        remark: marks[s._id].remark || undefined,
      }));

    if (!list.length) {
      toast.error("Please enter at least one student mark");
      return;
    }
    if (list.some((m) => m.score < 0 || m.score > exam.maxMarks)) {
      toast.error(`All scores must be between 0 and ${exam.maxMarks}`);
      return;
    }
    setSaving(true);
    try {
      await api.put(`/exams/${exam._id}/marks`, { marks: list });
      toast.success("Marks saved successfully");
      onSaved();
    } catch (err) {
      toast.error(apiError(err, "Could not save marks"));
    } finally {
      setSaving(false);
    }
  }

  const visibleRoster = useMemo(() => {
    if (!roster) return [];
    return roster.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.admissionNo?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      const hasScore = marks[s._id]?.score !== "" && marks[s._id]?.score != null;
      if (filterMode === "missing" && hasScore) return false;
      if (filterMode === "graded" && !hasScore) return false;
      return true;
    });
  }, [roster, search, filterMode, marks]);

  return (
    <Modal
      open
      onClose={onClose}
      title={`Mark Entry · ${exam.title}`}
      className="max-w-3xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="text-xs text-muted">
            Graded: <strong className="text-fg">{stats.graded}</strong> / {roster?.length || 0} students
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Close
            </Button>
            <Button onClick={save} disabled={saving || !roster?.length}>
              {saving ? "Saving..." : "Save Marks"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Header exam details */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-surface-2 p-3 text-xs text-muted">
          <div>
            Subject: <strong className="text-fg">{exam.subject?.name}</strong> · Class:{" "}
            <strong className="text-fg">{exam.schoolClass?.name} {exam.schoolClass?.section}</strong>
          </div>
          <div>
            Max Marks: <strong className="text-primary font-bold">{exam.maxMarks}</strong>
          </div>
        </div>

        {/* Live Performance Stats Strip */}
        {roster && stats.graded > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 rounded-2xl border border-border bg-surface p-3 text-center">
            <div>
              <p className="text-[11px] text-muted">Class Average</p>
              <p className="text-base font-bold text-fg tabular-nums">{stats.avg} / {exam.maxMarks}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Highest Score</p>
              <p className="text-base font-bold text-success tabular-nums">{stats.high}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Lowest Score</p>
              <p className="text-base font-bold text-danger tabular-nums">{stats.low}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Pass Rate</p>
              <p className="text-base font-bold text-info tabular-nums">{stats.passRate}%</p>
            </div>
          </div>
        )}

        {/* Filter and Quick Fill Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 text-xs"
            />
            <div className="flex rounded-xl border border-border bg-surface p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  filterMode === "all" ? "bg-primary text-primary-fg" : "text-muted hover:text-fg"
                }`}
              >
                All ({roster?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("missing")}
                className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  filterMode === "missing" ? "bg-primary text-primary-fg" : "text-muted hover:text-fg"
                }`}
              >
                Missing ({(roster?.length || 0) - stats.graded})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("graded")}
                className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                  filterMode === "graded" ? "bg-primary text-primary-fg" : "text-muted hover:text-fg"
                }`}
              >
                Graded ({stats.graded})
              </button>
            </div>
          </div>

          {/* Quick-fill tool */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted">Fill blanks:</span>
            <input
              type="number"
              min="0"
              max={exam.maxMarks}
              value={quickScore}
              onChange={(e) => setQuickScore(e.target.value)}
              placeholder="Score"
              className="w-16 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-fg focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button size="sm" variant="outline" onClick={applyQuickScore}>
              Apply
            </Button>
          </div>
        </div>

        {/* Student Roster List */}
        {roster === null ? (
          <div className="grid place-items-center py-12">
            <Spinner />
          </div>
        ) : visibleRoster.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted">No students match this view.</div>
        ) : (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto rounded-2xl border border-border">
            {visibleRoster.map((s) => {
              const currentScore = marks[s._id]?.score;
              const hasScore = currentScore !== "" && currentScore != null;
              const isPass = hasScore && Number(currentScore) >= exam.maxMarks * 0.5;

              return (
                <li key={s._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 hover:bg-surface-2/40">
                  <div className="flex items-center gap-3 min-w-[12rem] flex-1">
                    <Avatar name={s.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-fg">{s.name}</p>
                      <p className="text-xs text-muted tabular-nums">{s.admissionNo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={exam.maxMarks}
                        value={currentScore ?? ""}
                        onChange={(e) =>
                          setMarks((p) => ({
                            ...p,
                            [s._id]: { ...p[s._id], score: e.target.value },
                          }))
                        }
                        className={`w-20 rounded-xl border px-2 py-1 text-center text-sm font-semibold text-fg focus:outline-none focus:ring-2 focus:ring-primary ${
                          hasScore
                            ? isPass
                              ? "border-success/50 bg-success/5"
                              : "border-danger/50 bg-danger/5"
                            : "border-border bg-surface"
                        }`}
                        placeholder="0"
                      />
                    </div>
                    <span className="text-xs text-muted">/ {exam.maxMarks}</span>

                    {hasScore && (
                      <span className="text-xs">
                        {isPass ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-danger" />
                        )}
                      </span>
                    )}

                    <input
                      value={marks[s._id]?.remark ?? ""}
                      onChange={(e) =>
                        setMarks((p) => ({
                          ...p,
                          [s._id]: { ...p[s._id], remark: e.target.value },
                        }))
                      }
                      className="w-36 rounded-xl border border-border bg-surface px-2 py-1 text-xs text-fg focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Teacher remark"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}

export function ExamsView({ classOptions }) {
  const [exams, setExams] = useState(null);
  const [terms, setTerms] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");
  const [create, setCreate] = useState(false);
  const [edit, setEdit] = useState(null);
  const [marksFor, setMarksFor] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const { data } = await api.get("/exams", {
        params: {
          schoolClass: filterClass || undefined,
          type: filterType || undefined,
        },
      });
      const allowed = new Set(classOptions.map((c) => c._id));
      setExams(data.exams.filter((e) => allowed.has(e.schoolClass?._id || e.schoolClass)));
    } catch (err) {
      toast.error(apiError(err, "Could not load exams"));
      setExams([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterClass, filterType]);

  useEffect(() => {
    api.get("/terms").then(({ data }) => setTerms(data.terms)).catch(() => {});
  }, []);

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.delete(`/exams/${toDelete._id}`);
      toast.success("Exam deleted");
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not delete this exam"));
    } finally {
      setBusy(false);
    }
  }

  const filteredExams = useMemo(() => {
    if (!exams) return [];
    if (!search) return exams;
    const q = search.toLowerCase();
    return exams.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.subject?.name?.toLowerCase().includes(q) ||
        e.schoolClass?.name?.toLowerCase().includes(q)
    );
  }, [exams, search]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search exams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-44 text-xs"
          />
          <Select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="min-w-[9rem]"
          >
            <option value="">All Classes</option>
            {classOptions.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {c.section}
              </option>
            ))}
          </Select>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-32"
          >
            <option value="">All Types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>

        {classOptions.length ? (
          <Button onClick={() => setCreate(true)}>
            <Plus className="h-4 w-4" /> Schedule New Exam
          </Button>
        ) : null}
      </div>

      {exams === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : filteredExams.length === 0 ? (
        <EmptyState
          icon={Award}
          title={exams.length === 0 ? "No exams scheduled" : "No matching exams"}
          description={
            exams.length === 0
              ? "Create an exam for a class and subject, then input marks to generate report cards."
              : "Try adjusting your class or type filter."
          }
          action={classOptions.length ? <Button onClick={() => setCreate(true)}>Create Exam</Button> : null}
        />
      ) : (
        <Table headers={["Exam / Assessment", "Class", "Subject", "Term", "Mark Entry Progress", ""]}>
          {filteredExams.map((ex) => {
            const isCompleted = ex.marksEntered >= ex.rosterSize && ex.rosterSize > 0;
            return (
              <Table.Row key={ex._id}>
                <Table.Cell>
                  <p className="font-semibold text-fg">{ex.title}</p>
                  <p className="text-xs text-muted">
                    <span className="font-medium text-primary">{ex.type}</span> · out of {ex.maxMarks} marks
                    {ex.date ? ` · ${formatDate(ex.date)}` : ""}
                  </p>
                </Table.Cell>
                <Table.Cell className="text-muted font-medium text-xs">
                  {ex.schoolClass?.name} {ex.schoolClass?.section}
                </Table.Cell>
                <Table.Cell className="text-muted font-medium text-xs">
                  {ex.subject?.name}
                </Table.Cell>
                <Table.Cell className="text-muted text-xs">
                  {ex.term?.name}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-2">
                    <Badge tone={isCompleted ? "success" : ex.marksEntered ? "warning" : "neutral"}>
                      {ex.marksEntered} / {ex.rosterSize} Graded
                    </Badge>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant={isCompleted ? "outline" : "primary"}
                      onClick={() => setMarksFor(ex)}
                    >
                      {isCompleted ? "Edit Marks" : "Enter Marks"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setEdit(ex)}
                      aria-label={`Edit ${ex.title}`}
                      className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(ex)}
                      aria-label={`Delete ${ex.title}`}
                      className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table>
      )}

      <Modal open={create} onClose={() => setCreate(false)} title="Schedule New Exam" className="max-w-xl">
        {create ? (
          <ExamForm
            classOptions={classOptions}
            terms={terms}
            onCancel={() => setCreate(false)}
            onSaved={() => {
              setCreate(false);
              load();
            }}
          />
        ) : null}
      </Modal>

      <Modal open={Boolean(edit)} onClose={() => setEdit(null)} title="Edit Exam Details">
        {edit ? (
          <EditExamForm
            exam={edit}
            onCancel={() => setEdit(null)}
            onSaved={() => {
              setEdit(null);
              load();
            }}
          />
        ) : null}
      </Modal>

      {marksFor ? (
        <MarksModal
          exam={marksFor}
          onClose={() => setMarksFor(null)}
          onSaved={() => {
            setMarksFor(null);
            load();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Delete this exam?"
        description={`"${toDelete?.title}" will be permanently removed. (Note: cannot be deleted if marks are already entered).`}
        confirmLabel="Delete Exam"
      />
    </div>
  );
}

export default ExamsView;

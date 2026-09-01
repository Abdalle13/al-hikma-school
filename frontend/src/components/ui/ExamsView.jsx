import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "./Button.jsx";
import { Input } from "./Input.jsx";
import { Select } from "./Select.jsx";
import { Badge } from "./Badge.jsx";
import { Table } from "./Table.jsx";
import { Spinner } from "./Spinner.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { Modal } from "./Modal.jsx";
import { ConfirmDialog } from "./ConfirmDialog.jsx";
import api, { apiError } from "../../utils/api.js";
import { formatDate } from "../../utils/formatter.js";

const TYPES = ["Quiz", "Midterm", "Final"];

function ExamForm({ classOptions, terms, onCancel, onSaved }) {
  const [form, setForm] = useState({
    title: "", type: "Quiz", schoolClass: classOptions[0]?._id || "", subject: "",
    term: terms.find((t) => t.isActive)?._id || terms[0]?._id || "", maxMarks: 20, date: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const subjects = useMemo(
    () => classOptions.find((c) => c._id === form.schoolClass)?.subjects || [],
    [classOptions, form.schoolClass]
  );

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.schoolClass || !form.subject || !form.term || !(Number(form.maxMarks) > 0)) {
      toast.error("Fill in title, class, subject, term and a max mark");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, maxMarks: Number(form.maxMarks) };
      if (!payload.date) delete payload.date;
      const { data } = await api.post("/exams", payload);
      toast.success("Exam created");
      onSaved(data.exam);
    } catch (err) {
      toast.error(apiError(err, "Could not create the exam"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <Input label="Title" value={form.title} onChange={set("title")} placeholder="Term 1 Maths Quiz" />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Type" value={form.type} onChange={set("type")}>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Input label="Max marks" type="number" min="1" value={form.maxMarks} onChange={set("maxMarks")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Class" value={form.schoolClass} onChange={(e) => setForm((f) => ({ ...f, schoolClass: e.target.value, subject: "" }))}>
          {classOptions.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </Select>
        <Select label="Subject" value={form.subject} onChange={set("subject")}>
          <option value="">Choose subject</option>
          {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Term" value={form.term} onChange={set("term")}>
          {terms.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.academicYear})</option>)}
        </Select>
        <Input label="Date (optional)" type="date" value={form.date} onChange={set("date")} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Create exam"}</Button>
      </div>
    </form>
  );
}

function EditExamForm({ exam, onCancel, onSaved }) {
  const [form, setForm] = useState({
    title: exam.title, type: exam.type, maxMarks: exam.maxMarks,
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
      <Input label="Title" value={form.title} onChange={set("title")} />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Type" value={form.type} onChange={set("type")}>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Input label="Max marks" type="number" min="1" value={form.maxMarks} onChange={set("maxMarks")} />
      </div>
      <Input label="Date" type="date" value={form.date} onChange={set("date")} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
      </div>
    </form>
  );
}

function MarksModal({ exam, onClose, onSaved }) {
  const [roster, setRoster] = useState(null);
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/students", { params: { schoolClass: exam.schoolClass._id, enrollmentStatus: "Enrolled", limit: 200 } }),
      api.get(`/exams/${exam._id}/marks`),
    ])
      .then(([{ data: r }, { data: m }]) => {
        setRoster(r.students);
        const by = {};
        m.marks.forEach((x) => { by[x.student._id] = { score: x.score, remark: x.remark || "" }; });
        setMarks(Object.fromEntries(r.students.map((s) => [s._id, by[s._id] || { score: "", remark: "" }])));
      })
      .catch((err) => { toast.error(apiError(err, "Could not load the roster")); setRoster([]); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam._id]);

  async function save() {
    const list = roster
      .filter((s) => marks[s._id]?.score !== "" && marks[s._id]?.score != null)
      .map((s) => ({ student: s._id, score: Number(marks[s._id].score), remark: marks[s._id].remark || undefined }));
    if (!list.length) { toast.error("Enter at least one score"); return; }
    if (list.some((m) => m.score < 0 || m.score > exam.maxMarks)) {
      toast.error(`Scores must be between 0 and ${exam.maxMarks}`);
      return;
    }
    setSaving(true);
    try {
      await api.put(`/exams/${exam._id}/marks`, { marks: list });
      toast.success("Marks saved");
      onSaved();
    } catch (err) {
      toast.error(apiError(err, "Could not save marks"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Marks · ${exam.title}`}
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>Close</Button>
          <Button onClick={save} disabled={saving || !roster?.length}>{saving ? "Saving..." : "Save marks"}</Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-muted">{exam.subject.name} · {exam.schoolClass.name} {exam.schoolClass.section} · out of {exam.maxMarks}</p>
      {roster === null ? (
        <div className="grid place-items-center py-10"><Spinner /></div>
      ) : roster.length === 0 ? (
        <p className="text-sm text-muted">No enrolled students in this class.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {roster.map((s) => (
            <li key={s._id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
              <span className="min-w-[9rem] flex-1 text-sm text-fg">{s.name}</span>
              <input
                type="number"
                min="0"
                max={exam.maxMarks}
                value={marks[s._id]?.score ?? ""}
                onChange={(e) => setMarks((p) => ({ ...p, [s._id]: { ...p[s._id], score: e.target.value } }))}
                className="w-20 rounded-xl border border-border bg-surface px-2 py-1 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="-"
              />
              <input
                value={marks[s._id]?.remark ?? ""}
                onChange={(e) => setMarks((p) => ({ ...p, [s._id]: { ...p[s._id], remark: e.target.value } }))}
                className="w-40 rounded-xl border border-border bg-surface px-2 py-1 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="remark"
              />
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

export function ExamsView({ classOptions }) {
  const [exams, setExams] = useState(null);
  const [terms, setTerms] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [create, setCreate] = useState(false);
  const [edit, setEdit] = useState(null);
  const [marksFor, setMarksFor] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const { data } = await api.get("/exams", { params: filterClass ? { schoolClass: filterClass } : {} });
      // only show exams for classes this user can act on
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
  }, [filterClass]);

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

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="min-w-[10rem]">
          <option value="">All classes</option>
          {classOptions.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </Select>
        {classOptions.length ? (
          <Button onClick={() => setCreate(true)}><Plus className="h-4 w-4" /> New exam</Button>
        ) : null}
      </div>

      {exams === null ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : exams.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No exams yet"
          description="Create an exam for a class and subject, then enter the marks."
          action={classOptions.length ? <Button onClick={() => setCreate(true)}>New exam</Button> : null}
        />
      ) : (
        <Table headers={["Exam", "Class", "Subject", "Term", "Marks", ""]}>
          {exams.map((ex) => (
            <Table.Row key={ex._id}>
              <Table.Cell>
                <p className="font-medium">{ex.title}</p>
                <p className="text-xs text-muted">{ex.type} · out of {ex.maxMarks}{ex.date ? ` · ${formatDate(ex.date)}` : ""}</p>
              </Table.Cell>
              <Table.Cell className="text-muted">{ex.schoolClass?.name} {ex.schoolClass?.section}</Table.Cell>
              <Table.Cell className="text-muted">{ex.subject?.name}</Table.Cell>
              <Table.Cell className="text-muted">{ex.term?.name}</Table.Cell>
              <Table.Cell>
                <Badge tone={ex.marksEntered >= ex.rosterSize && ex.rosterSize > 0 ? "success" : ex.marksEntered ? "warning" : "neutral"}>
                  {ex.marksEntered}/{ex.rosterSize}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="outline" onClick={() => setMarksFor(ex)}>Marks</Button>
                  <button type="button" onClick={() => setEdit(ex)} aria-label={`Edit ${ex.title}`} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setToDelete(ex)} aria-label={`Delete ${ex.title}`} className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>
      )}

      <Modal open={create} onClose={() => setCreate(false)} title="New exam">
        {create ? (
          <ExamForm classOptions={classOptions} terms={terms} onCancel={() => setCreate(false)} onSaved={() => { setCreate(false); load(); }} />
        ) : null}
      </Modal>

      <Modal open={Boolean(edit)} onClose={() => setEdit(null)} title="Edit exam">
        {edit ? <EditExamForm exam={edit} onCancel={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} /> : null}
      </Modal>

      {marksFor ? (
        <MarksModal exam={marksFor} onClose={() => setMarksFor(null)} onSaved={() => { setMarksFor(null); load(); }} />
      ) : null}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Delete this exam?"
        description={`"${toDelete?.title}" will be removed. This is blocked once marks are entered.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

export default ExamsView;

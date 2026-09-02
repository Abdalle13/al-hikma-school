import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, School, Settings2, Trash2, X } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Table } from "../components/ui/Table.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import api, { apiError } from "../utils/api.js";

const empty = { name: "", section: "", academicYear: "", capacity: 40, classTeacher: "", subjects: [] };

function ClassForm({ initial, teachers, subjects, onCancel, onSaved }) {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          section: initial.section || "",
          academicYear: initial.academicYear,
          capacity: initial.capacity,
          classTeacher: initial.classTeacher?._id || "",
          subjects: initial.subjects?.map((s) => s._id) || [],
        }
      : empty
  );
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?._id);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleSubject = (id) =>
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(id) ? f.subjects.filter((s) => s !== id) : [...f.subjects, id],
    }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.academicYear.trim()) {
      toast.error("Name and academic year are required");
      return;
    }
    setSaving(true);
    const payload = { ...form, classTeacher: form.classTeacher || null, capacity: Number(form.capacity) || 40 };
    try {
      if (isEdit) {
        const { data } = await api.put(`/classes/${initial._id}`, payload);
        toast.success("Class updated");
        onSaved(data.schoolClass);
      } else {
        const { data } = await api.post("/classes", payload);
        toast.success("Class added");
        onSaved(data.schoolClass);
      }
    } catch (err) {
      toast.error(apiError(err, "Could not save the class"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Name" value={form.name} onChange={set("name")} placeholder="Enter the class name, for example Grade 4" />
        <Input label="Section" value={form.section} onChange={set("section")} placeholder="Enter the section, for example A" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Academic year" value={form.academicYear} onChange={set("academicYear")} placeholder="Enter the academic year, for example 2025/2026" />
        <Input label="Capacity" type="number" min="1" value={form.capacity} onChange={set("capacity")} />
      </div>
      <Select label="Class teacher" value={form.classTeacher} onChange={set("classTeacher")}>
        <option value="">Not set</option>
        {teachers.map((t) => (
          <option key={t._id} value={t._id}>{t.name}</option>
        ))}
      </Select>

      <div>
        <p className="mb-2 text-sm font-medium text-fg">Subjects</p>
        {subjects.length === 0 ? (
          <p className="text-sm text-muted">Add subjects first from the Subjects page.</p>
        ) : (
          <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-border p-3">
            {subjects.map((s) => (
              <label key={s._id} className="flex items-center gap-2 text-sm text-fg">
                <input
                  type="checkbox"
                  checked={form.subjects.includes(s._id)}
                  onChange={() => toggleSubject(s._id)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                {s.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Add class"}
        </Button>
      </div>
    </form>
  );
}

function ManageClassModal({ schoolClass, teachers, onClose }) {
  const [detail, setDetail] = useState(null);
  const [assignments, setAssignments] = useState(null);
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [{ data: d }, { data: a }] = await Promise.all([
      api.get(`/classes/${schoolClass._id}`),
      api.get("/assignments", { params: { schoolClass: schoolClass._id } }),
    ]);
    setDetail(d);
    setAssignments(a.assignments);
  }

  useEffect(() => {
    load().catch((err) => toast.error(apiError(err, "Could not load the class")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolClass._id]);

  async function addAssignment(e) {
    e.preventDefault();
    if (!subjectId || !teacherId) {
      toast.error("Pick a subject and a teacher");
      return;
    }
    setBusy(true);
    try {
      await api.post("/assignments", { teacher: teacherId, schoolClass: schoolClass._id, subject: subjectId });
      toast.success("Assignment added");
      setSubjectId("");
      setTeacherId("");
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not add that assignment"));
    } finally {
      setBusy(false);
    }
  }

  async function removeAssignment(id) {
    setBusy(true);
    try {
      await api.delete(`/assignments/${id}`);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not remove that assignment"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`${schoolClass.name}${schoolClass.section ? " " + schoolClass.section : ""}`}
      className="max-w-2xl"
    >
      {!detail || !assignments ? (
        <div className="grid place-items-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <span>{detail.enrolledCount} of {detail.schoolClass.capacity} enrolled</span>
            <span>{detail.schoolClass.academicYear}</span>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-fg">Teaching assignments</p>
            {assignments.length === 0 ? (
              <p className="text-sm text-muted">No subject has a teacher assigned yet.</p>
            ) : (
              <ul className="divide-y divide-border rounded-2xl border border-border">
                {assignments.map((a) => (
                  <li key={a._id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span>
                      <span className="font-medium text-fg">{a.subject?.name}</span>
                      <span className="text-muted"> taught by {a.teacher?.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAssignment(a._id)}
                      disabled={busy}
                      aria-label="Remove assignment"
                      className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={addAssignment} className="mt-3 flex flex-wrap items-end gap-2">
              <Select
                label="Subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="min-w-[10rem] flex-1"
              >
                <option value="">Choose subject</option>
                {detail.schoolClass.subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </Select>
              <Select
                label="Teacher"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="min-w-[10rem] flex-1"
              >
                <option value="">Choose teacher</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </Select>
              <Button type="submit" size="md" disabled={busy}>Add</Button>
            </form>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-fg">Students ({detail.students.length})</p>
            {detail.students.length === 0 ? (
              <p className="text-sm text-muted">No students enrolled in this class yet.</p>
            ) : (
              <ul className="max-h-40 divide-y divide-border overflow-y-auto rounded-2xl border border-border">
                {detail.students.map((s) => (
                  <li key={s._id} className="flex items-center justify-between px-4 py-2 text-sm">
                    <span className="text-fg">{s.name}</span>
                    <span className="text-muted tabular-nums">{s.admissionNo}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modal, setModal] = useState(null);
  const [manage, setManage] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const { data } = await api.get("/classes");
      setClasses(data.classes);
    } catch (err) {
      toast.error(apiError(err, "Could not load classes"));
      setClasses([]);
    }
  }

  useEffect(() => {
    load();
    api.get("/staff").then(({ data }) => setTeachers(data.staff)).catch(() => {});
    api.get("/subjects").then(({ data }) => setSubjects(data.subjects)).catch(() => {});
  }, []);

  function onSaved() {
    setModal(null);
    load();
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.delete(`/classes/${toDelete._id}`);
      toast.success("Class deleted");
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not delete this class"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Classes"
        description="Sections, class teachers and subject lists for the current academic year."
        action={
          <Button onClick={() => setModal({ mode: "create" })}>
            <Plus className="h-4 w-4" /> Add class
          </Button>
        }
      />

      {classes === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          icon={School}
          title="No classes yet"
          description="Add your first class, then assign a class teacher and subjects."
          action={<Button onClick={() => setModal({ mode: "create" })}>Add class</Button>}
        />
      ) : (
        <Table headers={["Class", "Class teacher", "Subjects", "Enrolled", ""]}>
          {classes.map((c) => (
            <Table.Row key={c._id}>
              <Table.Cell className="font-medium">
                {c.name}{c.section ? ` ${c.section}` : ""}
                <span className="ml-2 text-xs text-muted">{c.academicYear}</span>
              </Table.Cell>
              <Table.Cell className="text-muted">{c.classTeacher?.name || "Not set"}</Table.Cell>
              <Table.Cell>
                <div className="flex flex-wrap gap-1">
                  {c.subjects.length === 0 ? (
                    <span className="text-muted">None</span>
                  ) : (
                    c.subjects.slice(0, 3).map((s) => <Badge key={s._id}>{s.code}</Badge>)
                  )}
                  {c.subjects.length > 3 ? <Badge>+{c.subjects.length - 3}</Badge> : null}
                </div>
              </Table.Cell>
              <Table.Cell className="tabular-nums text-muted">
                {c.enrolledCount} / {c.capacity}
              </Table.Cell>
              <Table.Cell>
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setManage(c)}
                    aria-label={`Manage ${c.name}`}
                    title="Manage assignments and roster"
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                  >
                    <Settings2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ mode: "edit", schoolClass: c })}
                    aria-label={`Edit ${c.name}`}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(c)}
                    aria-label={`Delete ${c.name}`}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>
      )}

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Edit class" : "Add class"}
      >
        {modal ? (
          <ClassForm
            initial={modal.schoolClass}
            teachers={teachers}
            subjects={subjects}
            onCancel={() => setModal(null)}
            onSaved={onSaved}
          />
        ) : null}
      </Modal>

      {manage ? (
        <ManageClassModal schoolClass={manage} teachers={teachers} onClose={() => { setManage(null); load(); }} />
      ) : null}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Delete this class?"
        description={`"${toDelete?.name}" will be removed. This is blocked if students are enrolled in it.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

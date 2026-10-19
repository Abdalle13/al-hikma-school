import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { BookOpen, Pencil, Plus, Trash2, Layers, Clock, Award } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Textarea } from "../components/ui/Textarea.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import api, { apiError } from "../utils/api.js";

const DEPARTMENTS = [
  "Islamic Studies & Quran",
  "Mathematics & Science",
  "Languages & Literature",
  "Social Studies & History",
  "Information Technology",
  "General Academics",
];

const empty = {
  name: "",
  code: "",
  department: "General Academics",
  gradeLevel: "",
  periodsPerWeek: 5,
  passMarks: 50,
  totalMarks: 100,
  description: "",
};

function SubjectForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(initial ? { ...empty, ...initial } : empty);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?._id);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Quick auto-generate code from name
  function handleNameChange(e) {
    const name = e.target.value;
    setForm((f) => {
      const updated = { ...f, name };
      if (!isEdit && !f.code) {
        // e.g. "Islamic Studies" -> "ISL" or "Mathematics" -> "MATH"
        const words = name.trim().split(/\s+/);
        if (words.length > 1) {
          updated.code = words.map((w) => w[0]).join("").toUpperCase().slice(0, 5);
        } else if (name.length >= 3) {
          updated.code = name.slice(0, 4).toUpperCase();
        }
      }
      return updated;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Subject name and code are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        periodsPerWeek: Number(form.periodsPerWeek) || 4,
        passMarks: Number(form.passMarks) || 50,
        totalMarks: Number(form.totalMarks) || 100,
      };
      if (isEdit) {
        const { data } = await api.put(`/subjects/${initial._id}`, payload);
        toast.success("Subject updated successfully");
        onSaved(data.subject);
      } else {
        const { data } = await api.post("/subjects", payload);
        toast.success("Subject added successfully");
        onSaved(data.subject);
      }
    } catch (err) {
      toast.error(apiError(err, "Could not save the subject"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Subject Name"
          value={form.name}
          onChange={handleNameChange}
          placeholder="e.g. Tarbiyada & Islaamka, Mathematics"
          required
        />
        <Input
          label="Subject Code"
          value={form.code}
          onChange={set("code")}
          placeholder="e.g. MATH, ISL, SOM"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Department / Category" value={form.department} onChange={set("department")}>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </Select>
        <Input
          label="Target Grade Level"
          value={form.gradeLevel}
          onChange={set("gradeLevel")}
          placeholder="e.g. Primary (Grades 1-6), Grade 4"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Periods / Week"
          type="number"
          min="1"
          max="15"
          value={form.periodsPerWeek}
          onChange={set("periodsPerWeek")}
          placeholder="5"
        />
        <Input
          label="Pass Marks (%)"
          type="number"
          min="1"
          max="100"
          value={form.passMarks}
          onChange={set("passMarks")}
          placeholder="50"
        />
        <Input
          label="Total Marks"
          type="number"
          min="1"
          value={form.totalMarks}
          onChange={set("totalMarks")}
          placeholder="100"
        />
      </div>

      <Textarea
        label="Description / Curriculum Objectives (optional)"
        rows={3}
        value={form.description}
        onChange={set("description")}
        placeholder="Short description of this subject's syllabus and learning goals"
      />

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Add subject"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState(null);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    try {
      const { data } = await api.get("/subjects", { params: search ? { search } : {} });
      setSubjects(data.subjects);
    } catch (err) {
      toast.error(apiError(err, "Could not load subjects"));
      setSubjects([]);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function onSaved() {
    setModal(null);
    load();
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await api.delete(`/subjects/${toDelete._id}`);
      toast.success("Subject deleted");
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not delete this subject"));
    } finally {
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    if (!subjects) return [];
    return subjects.filter((s) => {
      if (departmentFilter && s.department !== departmentFilter) return false;
      return true;
    });
  }, [subjects, departmentFilter]);

  // Statistics
  const stats = useMemo(() => {
    if (!subjects) return { total: 0, depts: 0, avgPeriods: 0 };
    const depts = new Set(subjects.map((s) => s.department || "General")).size;
    const totalPeriods = subjects.reduce((sum, s) => sum + (s.periodsPerWeek || 4), 0);
    return {
      total: subjects.length,
      depts,
      avgPeriods: subjects.length ? Math.round(totalPeriods / subjects.length) : 0,
    };
  }, [subjects]);

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="Comprehensive curriculum subjects for classes, exams, and weekly timetables."
        action={
          <Button onClick={() => setModal({ mode: "create" })}>
            <Plus className="h-4 w-4" /> Add subject
          </Button>
        }
      />

      {/* Quick Summary Cards */}
      {subjects && subjects.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Total Subjects</p>
              <p className="text-xl font-bold text-fg tabular-nums">{stats.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-info/10 text-info">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Departments</p>
              <p className="text-xl font-bold text-fg tabular-nums">{stats.depts}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/10 text-success">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Avg. Periods/Week</p>
              <p className="text-xl font-bold text-fg tabular-nums">{stats.avgPeriods} hrs</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="max-w-xs"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </div>

      {subjects === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={subjects.length === 0 ? "No subjects yet" : "No matching subjects"}
          description={
            subjects.length === 0
              ? "Add your school subjects here so they can be assigned to classes and exam timetables."
              : "Try adjusting your search query or department filter."
          }
          action={
            subjects.length === 0 ? (
              <Button onClick={() => setModal({ mode: "create" })}>Add subject</Button>
            ) : null
          }
        />
      ) : (
        <Table headers={["Subject", "Code", "Department", "Grade Level", "Weekly Load", "Pass / Max", ""]}>
          {filtered.map((s) => (
            <Table.Row key={s._id}>
              <Table.Cell>
                <div>
                  <p className="font-semibold text-fg">{s.name}</p>
                  {s.description && (
                    <p className="line-clamp-1 text-xs text-muted">{s.description}</p>
                  )}
                </div>
              </Table.Cell>
              <Table.Cell>
                <Badge tone="info" className="font-mono font-bold tracking-wider">
                  {s.code}
                </Badge>
              </Table.Cell>
              <Table.Cell className="text-muted text-xs">
                {s.department || "General"}
              </Table.Cell>
              <Table.Cell className="text-muted text-xs">
                {s.gradeLevel || "All Grades"}
              </Table.Cell>
              <Table.Cell className="text-muted text-xs tabular-nums">
                {s.periodsPerWeek ? `${s.periodsPerWeek} per/wk` : "4 per/wk"}
              </Table.Cell>
              <Table.Cell className="text-muted text-xs tabular-nums">
                <span className="font-medium text-success">{s.passMarks || 50}</span> / {s.totalMarks || 100}
              </Table.Cell>
              <Table.Cell>
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setModal({ mode: "edit", subject: s })}
                    aria-label={`Edit ${s.name}`}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(s)}
                    aria-label={`Delete ${s.name}`}
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
        title={modal?.mode === "edit" ? "Edit Subject" : "Add New Subject"}
        className="max-w-xl"
      >
        {modal ? (
          <SubjectForm initial={modal.subject} onCancel={() => setModal(null)} onSaved={onSaved} />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this subject?"
        description={`"${toDelete?.name}" will be removed. Note: deletion is blocked if any class has enrolled this subject.`}
        confirmLabel="Delete Subject"
      />
    </div>
  );
}

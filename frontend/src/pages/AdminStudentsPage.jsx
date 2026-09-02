import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GraduationCap, Pencil, Plus, Trash2, UserPlus, X } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Pagination } from "../components/ui/Pagination.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import api, { apiError } from "../utils/api.js";
import { formatDate } from "../utils/formatter.js";

const statusTone = { Enrolled: "success", Graduated: "info", Withdrawn: "warning" };

const empty = {
  name: "", admissionNo: "", password: "", dob: "", gender: "", phone: "", schoolClass: "",
};

function toDateInput(d) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

function GuardianPicker({ studentId, onLinked }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [relation, setRelation] = useState("Guardian");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      api
        .get("/users", { params: { role: "Parent", search: term, limit: 6 } })
        .then(({ data }) => setResults(data.users))
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(t);
  }, [term]);

  async function link() {
    if (!selected) return;
    setBusy(true);
    try {
      await api.post(`/students/${studentId}/guardians`, { parentId: selected._id, relation });
      toast.success(`${selected.name} linked as ${relation.toLowerCase()}`);
      setSelected(null);
      setTerm("");
      setResults([]);
      onLinked();
    } catch (err) {
      toast.error(apiError(err, "Could not link that parent"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-border p-3">
      {selected ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-fg">{selected.name} ({selected.email})</span>
          <button type="button" onClick={() => setSelected(null)} className="text-muted hover:text-fg">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Input
            placeholder="Search a parent by name or email"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          {results.length > 0 ? (
            <ul className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface p-1 shadow-md">
              {results.map((p) => (
                <li key={p._id}>
                  <button
                    type="button"
                    onClick={() => { setSelected(p); setResults([]); }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2"
                  >
                    {p.name} <span className="text-muted">{p.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2">
        <Select value={relation} onChange={(e) => setRelation(e.target.value)} className="flex-1">
          <option value="Father">Father</option>
          <option value="Mother">Mother</option>
          <option value="Guardian">Guardian</option>
          <option value="Other">Other</option>
        </Select>
        <Button type="button" size="sm" disabled={!selected || busy} onClick={link}>
          <UserPlus className="h-4 w-4" /> Link
        </Button>
      </div>
    </div>
  );
}

function StudentForm({ initial, classes, onCancel, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          admissionNo: initial.admissionNo,
          password: "",
          dob: toDateInput(initial.dob),
          gender: initial.gender || "",
          phone: initial.phone || "",
          schoolClass: initial.schoolClass?._id || "",
          enrollmentStatus: initial.enrollmentStatus || "Enrolled",
        }
      : empty
  );
  const [saving, setSaving] = useState(false);
  const [guardians, setGuardians] = useState(initial?.guardians || []);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.admissionNo.trim() || (!isEdit && form.password.length < 6)) {
      toast.error("Name, admission number and a password of at least 6 characters are required");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        // on edit, send null for cleared optionals so they can be unset
        const payload = {
          name: form.name,
          admissionNo: form.admissionNo,
          phone: form.phone,
          dob: form.dob || null,
          gender: form.gender || null,
          schoolClass: form.schoolClass || null,
          enrollmentStatus: form.enrollmentStatus,
        };
        if (form.password) payload.password = form.password;
        const { data } = await api.put(`/students/${initial._id}`, payload);
        toast.success("Student updated");
        onSaved(data.student);
      } else {
        // on create, omit empty optionals entirely (dob is a date, "" breaks the cast)
        const payload = { name: form.name, admissionNo: form.admissionNo, password: form.password };
        ["dob", "gender", "phone", "schoolClass"].forEach((k) => {
          if (form[k]) payload[k] = form[k];
        });
        const { data } = await api.post("/students", payload);
        toast.success(`${data.student.name} enrolled`);
        onSaved(data.student);
      }
    } catch (err) {
      toast.error(apiError(err, "Could not save this student"));
    } finally {
      setSaving(false);
    }
  }

  async function removeGuardian(parentId) {
    try {
      await api.delete(`/students/${initial._id}/guardians/${parentId}`);
      setGuardians((g) => g.filter((x) => x.user._id !== parentId));
      toast.success("Guardian unlinked");
    } catch (err) {
      toast.error(apiError(err, "Could not unlink that guardian"));
    }
  }

  return (
    <div className="space-y-6">
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Full name" value={form.name} onChange={set("name")} />
          <Input label="Admission number" value={form.admissionNo} onChange={set("admissionNo")} placeholder="ADM-0001" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Date of birth" type="date" value={form.dob} onChange={set("dob")} />
          <Select label="Gender" value={form.gender} onChange={set("gender")}>
            <option value="">Not set</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Select>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Phone" value={form.phone} onChange={set("phone")} placeholder="+252 ..." />
          <Select label="Class" value={form.schoolClass} onChange={set("schoolClass")}>
            <option value="">Not assigned</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name} {c.section}</option>
            ))}
          </Select>
        </div>
        {isEdit ? (
          <Select label="Enrolment status" value={form.enrollmentStatus} onChange={set("enrollmentStatus")}>
            <option value="Enrolled">Enrolled</option>
            <option value="Graduated">Graduated</option>
            <option value="Withdrawn">Withdrawn</option>
          </Select>
        ) : null}
        <Input
          label={isEdit ? "Reset password (optional)" : "Password"}
          value={form.password}
          onChange={set("password")}
          placeholder={isEdit ? "Leave blank to keep it" : "At least 6 characters, a 6 digit number works"}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Enrol student"}
          </Button>
        </div>
      </form>

      {isEdit ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-fg">Guardians</p>
          {guardians.length ? (
            <ul className="mb-3 divide-y divide-border rounded-2xl border border-border">
              {guardians.map((g) => (
                <li key={g.user._id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span>
                    <span className="font-medium text-fg">{g.user.name}</span>
                    <span className="text-muted"> · {g.relation}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeGuardian(g.user._id)}
                    className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                    aria-label="Unlink guardian"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 text-sm text-muted">No parent linked yet.</p>
          )}
          <GuardianPicker
            studentId={initial._id}
            onLinked={async () => {
              const { data } = await api.get(`/students/${initial._id}`);
              setGuardians(data.student.guardians || []);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState(null);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const { data } = await api.get("/students", {
        params: {
          search: search || undefined,
          schoolClass: classFilter || undefined,
          enrollmentStatus: statusFilter || undefined,
          page,
          limit: 15,
        },
      });
      setStudents(data.students);
      setMeta({ page: data.page, pages: data.pages });
    } catch (err) {
      toast.error(apiError(err, "Could not load students"));
      setStudents([]);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, classFilter, statusFilter, page]);

  useEffect(() => {
    api.get("/classes").then(({ data }) => setClasses(data.classes)).catch(() => {});
  }, []);

  function onSaved() {
    setModal(null);
    load();
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.delete(`/students/${toDelete._id}`);
      toast.success("Student removed");
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not remove this student"));
    } finally {
      setBusy(false);
    }
  }

  async function openEdit(row) {
    const { data } = await api.get(`/students/${row._id}`);
    setModal({ mode: "edit", student: data.student });
  }

  return (
    <div>
      <PageHeader
        title="Students"
        description="Enrolment, class assignment and parent links."
        action={
          <Button onClick={() => setModal({ mode: "create" })}>
            <Plus className="h-4 w-4" /> Enrol student
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by name or admission number"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          className="max-w-xs"
        />
        <Select value={classFilter} onChange={(e) => { setPage(1); setClassFilter(e.target.value); }} className="max-w-[10rem]">
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name} {c.section}</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }} className="max-w-[10rem]">
          <option value="">Any status</option>
          <option value="Enrolled">Enrolled</option>
          <option value="Graduated">Graduated</option>
          <option value="Withdrawn">Withdrawn</option>
        </Select>
      </div>

      {students === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          description="Try a different search, or enrol your first student."
          action={<Button onClick={() => setModal({ mode: "create" })}>Enrol student</Button>}
        />
      ) : (
        <>
          <Table headers={["Student", "Admission no.", "Class", "Gender", "Status", ""]}>
            {students.map((s) => (
              <Table.Row key={s._id}>
                <Table.Cell>
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} size="sm" />
                    <div>
                      <p className="font-medium">{s.name}</p>
                      {s.dob ? <p className="text-xs text-muted">Born {formatDate(s.dob)}</p> : null}
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell className="tabular-nums">{s.admissionNo}</Table.Cell>
                <Table.Cell className="text-muted">
                  {s.schoolClass ? `${s.schoolClass.name} ${s.schoolClass.section || ""}` : "Not assigned"}
                </Table.Cell>
                <Table.Cell className="text-muted">{s.gender || "-"}</Table.Cell>
                <Table.Cell>
                  <Badge tone={statusTone[s.enrollmentStatus] || "neutral"}>{s.enrollmentStatus}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
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
          <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
        </>
      )}

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Edit student" : "Enrol a student"}
        className="max-w-xl"
      >
        {modal ? (
          <StudentForm initial={modal.student} classes={classes} onCancel={() => setModal(null)} onSaved={onSaved} />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Remove this student?"
        description={`"${toDelete?.name}" and their account will be deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

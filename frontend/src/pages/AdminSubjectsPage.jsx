import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Textarea } from "../components/ui/Textarea.jsx";
import { Table } from "../components/ui/Table.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import api, { apiError } from "../utils/api.js";

const empty = { name: "", code: "", gradeLevel: "", description: "" };

function SubjectForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(initial || empty);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?._id);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        const { data } = await api.put(`/subjects/${initial._id}`, form);
        toast.success("Subject updated");
        onSaved(data.subject);
      } else {
        const { data } = await api.post("/subjects", form);
        toast.success("Subject added");
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
      <Input label="Name" value={form.name} onChange={set("name")} placeholder="Enter the subject name" />
      <Input label="Code" value={form.code} onChange={set("code")} placeholder="Enter a short code, for example MATH" />
      <Input label="Grade level" value={form.gradeLevel} onChange={set("gradeLevel")} placeholder="Enter the grade level" />
      <Textarea label="Description" rows={3} value={form.description} onChange={set("description")} placeholder="Enter a short description (optional)" />
      <div className="flex justify-end gap-2">
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
  const [modal, setModal] = useState(null); // { mode: "create" | "edit", subject }
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

  return (
    <div>
      <PageHeader
        title="Subjects"
        description="The subject list used when building classes, exams and the timetable."
        action={
          <Button onClick={() => setModal({ mode: "create" })}>
            <Plus className="h-4 w-4" /> Add subject
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search by name or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {subjects === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description="Add the subjects the school teaches, they can then be added to classes."
          action={<Button onClick={() => setModal({ mode: "create" })}>Add subject</Button>}
        />
      ) : (
        <Table headers={["Name", "Code", "Grade level", ""]}>
          {subjects.map((s) => (
            <Table.Row key={s._id}>
              <Table.Cell className="font-medium">{s.name}</Table.Cell>
              <Table.Cell className="tabular-nums">{s.code}</Table.Cell>
              <Table.Cell className="text-muted">{s.gradeLevel || "-"}</Table.Cell>
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
        title={modal?.mode === "edit" ? "Edit subject" : "Add subject"}
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
        description={`"${toDelete?.name}" will be removed. This is blocked if any class still uses it.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

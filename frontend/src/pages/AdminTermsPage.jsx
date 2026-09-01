import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarRange, CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Table } from "../components/ui/Table.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import api, { apiError } from "../utils/api.js";
import { formatDate } from "../utils/formatter.js";

const empty = { name: "", academicYear: "", startDate: "", endDate: "" };

function toDateInput(d) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

function TermForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, startDate: toDateInput(initial.startDate), endDate: toDateInput(initial.endDate) }
      : empty
  );
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?._id);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.academicYear.trim() || !form.startDate || !form.endDate) {
      toast.error("Fill in every field");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        const { data } = await api.put(`/terms/${initial._id}`, form);
        toast.success("Term updated");
        onSaved(data.term);
      } else {
        const { data } = await api.post("/terms", form);
        toast.success("Term added");
        onSaved(data.term);
      }
    } catch (err) {
      toast.error(apiError(err, "Could not save the term"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <Input label="Name" value={form.name} onChange={set("name")} placeholder="Term 1" />
      <Input label="Academic year" value={form.academicYear} onChange={set("academicYear")} placeholder="2025/2026" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start date" type="date" value={form.startDate} onChange={set("startDate")} />
        <Input label="End date" type="date" value={form.endDate} onChange={set("endDate")} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Add term"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminTermsPage() {
  const [terms, setTerms] = useState(null);
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      const { data } = await api.get("/terms");
      setTerms(data.terms);
    } catch (err) {
      toast.error(apiError(err, "Could not load terms"));
      setTerms([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onSaved() {
    setModal(null);
    load();
  }

  async function activate(term) {
    setBusyId(term._id);
    try {
      await api.post(`/terms/${term._id}/activate`);
      toast.success(`${term.name} is now the active term`);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not activate this term"));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    setBusyId(toDelete._id);
    try {
      await api.delete(`/terms/${toDelete._id}`);
      toast.success("Term deleted");
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not delete this term"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Terms"
        description="Three terms make up an academic year. One term is active at a time."
        action={
          <Button onClick={() => setModal({ mode: "create" })}>
            <Plus className="h-4 w-4" /> Add term
          </Button>
        }
      />

      {terms === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : terms.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No terms yet"
          description="Add your first term to start recording attendance, exams and fees."
          action={<Button onClick={() => setModal({ mode: "create" })}>Add term</Button>}
        />
      ) : (
        <Table headers={["Term", "Academic year", "Dates", "Status", ""]}>
          {terms.map((t) => (
            <Table.Row key={t._id}>
              <Table.Cell className="font-medium">{t.name}</Table.Cell>
              <Table.Cell className="tabular-nums">{t.academicYear}</Table.Cell>
              <Table.Cell className="text-muted">
                {formatDate(t.startDate)} to {formatDate(t.endDate)}
              </Table.Cell>
              <Table.Cell>
                {t.isActive ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>}
              </Table.Cell>
              <Table.Cell>
                <div className="flex justify-end gap-1">
                  {!t.isActive ? (
                    <button
                      type="button"
                      onClick={() => activate(t)}
                      disabled={busyId === t._id}
                      title="Make active"
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-success/10 hover:text-success"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setModal({ mode: "edit", term: t })}
                    aria-label={`Edit ${t.name}`}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(t)}
                    disabled={t.isActive}
                    title={t.isActive ? "Activate another term first" : "Delete"}
                    aria-label={`Delete ${t.name}`}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-30"
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
        title={modal?.mode === "edit" ? "Edit term" : "Add term"}
      >
        {modal ? (
          <TermForm initial={modal.term} onCancel={() => setModal(null)} onSaved={onSaved} />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busyId === toDelete?._id}
        title="Delete this term?"
        description={`"${toDelete?.name}" will be removed.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

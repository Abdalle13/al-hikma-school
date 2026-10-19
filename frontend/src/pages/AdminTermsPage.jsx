import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { CalendarRange, CheckCircle2, Pencil, Plus, Trash2, Calendar, Clock, Sparkles } from "lucide-react";
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

const empty = { name: "Term 1", academicYear: "2025/2026", startDate: "", endDate: "", makeActive: false };

function toDateInput(d) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

function calculateWeeks(start, end) {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = e - s;
  if (diffTime <= 0) return null;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.round((diffDays / 7) * 10) / 10;
  return { days: diffDays, weeks };
}

function TermForm({ initial, onCancel, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          startDate: toDateInput(initial.startDate),
          endDate: toDateInput(initial.endDate),
          makeActive: initial.isActive || false,
        }
      : {
          ...empty,
          academicYear: `${currentYear}/${currentYear + 1}`,
          startDate: `${currentYear}-09-01`,
          endDate: `${currentYear}-12-15`,
        }
  );
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Quick presets for terms
  function applyPreset(termNum) {
    const yr = Number(form.academicYear.split("/")[0]) || currentYear;
    if (termNum === 1) {
      setForm((f) => ({
        ...f,
        name: "Term 1",
        startDate: `${yr}-09-01`,
        endDate: `${yr}-12-15`,
      }));
    } else if (termNum === 2) {
      setForm((f) => ({
        ...f,
        name: "Term 2",
        startDate: `${yr + 1}-01-05`,
        endDate: `${yr + 1}-04-10`,
      }));
    } else if (termNum === 3) {
      setForm((f) => ({
        ...f,
        name: "Term 3",
        startDate: `${yr + 1}-05-01`,
        endDate: `${yr + 1}-07-25`,
      }));
    }
  }

  const duration = useMemo(() => calculateWeeks(form.startDate, form.endDate), [form.startDate, form.endDate]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.academicYear.trim() || !form.startDate || !form.endDate) {
      toast.error("Please fill in term name, academic year, and both start and end dates");
      return;
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error("Term end date must be after start date");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        const { data } = await api.put(`/terms/${initial._id}`, form);
        if (form.makeActive && !initial.isActive) {
          await api.post(`/terms/${initial._id}/activate`);
        }
        toast.success("Term updated successfully");
        onSaved(data.term);
      } else {
        const { data } = await api.post("/terms", form);
        if (form.makeActive && data.term?._id) {
          await api.post(`/terms/${data.term._id}/activate`);
        }
        toast.success("Term added successfully");
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
      {/* Quick Preset Buttons */}
      {!isEdit && (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Quick Term Presets
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset(1)}
              className="rounded-xl border border-border bg-surface px-2.5 py-1 text-xs font-medium text-fg hover:border-primary hover:text-primary transition-colors"
            >
              Term 1 (Sep - Dec)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(2)}
              className="rounded-xl border border-border bg-surface px-2.5 py-1 text-xs font-medium text-fg hover:border-primary hover:text-primary transition-colors"
            >
              Term 2 (Jan - Apr)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(3)}
              className="rounded-xl border border-border bg-surface px-2.5 py-1 text-xs font-medium text-fg hover:border-primary hover:text-primary transition-colors"
            >
              Term 3 (May - Jul)
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Term Name"
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Term 1, Term 2, Term 3"
          required
        />
        <Input
          label="Academic Year"
          value={form.academicYear}
          onChange={set("academicYear")}
          placeholder="e.g. 2025/2026"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Start Date"
          type="date"
          value={form.startDate}
          onChange={set("startDate")}
          required
        />
        <Input
          label="End Date"
          type="date"
          value={form.endDate}
          onChange={set("endDate")}
          required
        />
      </div>

      {duration && (
        <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted">
          <Clock className="h-4 w-4 text-primary" />
          <span>
            Duration: <strong className="text-fg">{duration.weeks} weeks</strong> ({duration.days} calendar days)
          </span>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-fg cursor-pointer select-none">
        <input
          type="checkbox"
          checked={Boolean(form.makeActive)}
          onChange={(e) => setForm((f) => ({ ...f, makeActive: e.target.checked }))}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <span>Set as the current active term for all attendance, marks, and fees</span>
      </label>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Create Term"}
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

  const activeTerm = useMemo(() => (terms || []).find((t) => t.isActive), [terms]);

  return (
    <div>
      <PageHeader
        title="Academic Terms"
        description="Configure academic terms and sessions. One active term coordinates attendance, examinations, and fee invoicing."
        action={
          <Button onClick={() => setModal({ mode: "create" })}>
            <Plus className="h-4 w-4" /> Add term
          </Button>
        }
      />

      {/* Active Term Spotlight Banner */}
      {activeTerm && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-fg shadow-sm">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-fg">{activeTerm.name}</span>
                <Badge tone="success">Currently Active</Badge>
              </div>
              <p className="text-xs text-muted">
                Academic Year {activeTerm.academicYear} · {formatDate(activeTerm.startDate)} to{" "}
                {formatDate(activeTerm.endDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            {calculateWeeks(activeTerm.startDate, activeTerm.endDate) && (
              <span className="rounded-xl border border-border bg-surface px-3 py-1.5 font-medium text-fg">
                {calculateWeeks(activeTerm.startDate, activeTerm.endDate)?.weeks} Weeks Duration
              </span>
            )}
          </div>
        </div>
      )}

      {terms === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : terms.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No terms yet"
          description="Add your first term to start recording attendance, exams and school fees."
          action={<Button onClick={() => setModal({ mode: "create" })}>Add term</Button>}
        />
      ) : (
        <Table headers={["Term Name", "Academic Year", "Duration / Dates", "Status", ""]}>
          {terms.map((t) => {
            const dur = calculateWeeks(t.startDate, t.endDate);
            return (
              <Table.Row key={t._id}>
                <Table.Cell>
                  <p className="font-semibold text-fg">{t.name}</p>
                  {dur && <p className="text-xs text-muted">{dur.weeks} weeks ({dur.days} days)</p>}
                </Table.Cell>
                <Table.Cell className="tabular-nums font-medium text-muted">
                  {t.academicYear}
                </Table.Cell>
                <Table.Cell className="text-muted text-xs">
                  {formatDate(t.startDate)} – {formatDate(t.endDate)}
                </Table.Cell>
                <Table.Cell>
                  {t.isActive ? (
                    <Badge tone="success">Active</Badge>
                  ) : (
                    <Badge tone="neutral">Inactive</Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end gap-1">
                    {!t.isActive ? (
                      <button
                        type="button"
                        onClick={() => activate(t)}
                        disabled={busyId === t._id}
                        title="Set as active term"
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
                      title={t.isActive ? "Active term cannot be deleted" : "Delete"}
                      aria-label={`Delete ${t.name}`}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-30"
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

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Edit Academic Term" : "Create New Academic Term"}
        className="max-w-xl"
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
        description={`"${toDelete?.name}" will be removed. All records linked to this term should be migrated first.`}
        confirmLabel="Delete Term"
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FileText, Trash2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Textarea } from "../components/ui/Textarea.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Table } from "../components/ui/Table.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import api, { apiError } from "../utils/api.js";
import { formatDate } from "../utils/formatter.js";

const statusTone = { New: "info", Reviewing: "warning", Accepted: "success", Rejected: "danger" };

function ReviewModal({ application, classes, onClose, onSaved }) {
  const [status, setStatus] = useState(application.status);
  const [reviewNote, setReviewNote] = useState(application.reviewNote || "");
  const [admissionNo, setAdmissionNo] = useState("");
  const [password, setPassword] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [saving, setSaving] = useState(false);

  const canCreateStudent = status === "Accepted" && !application.createdStudent;

  async function onSubmit(e) {
    e.preventDefault();
    if (canCreateStudent && admissionNo && password.length < 6) {
      toast.error("The student password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      const payload = { status, reviewNote };
      if (canCreateStudent && admissionNo && password) {
        Object.assign(payload, { admissionNo, password, schoolClass: schoolClass || undefined });
      }
      const { data } = await api.patch(`/applications/${application._id}/review`, payload);
      toast.success(data.createdStudent ? `Accepted, ${data.createdStudent.name} enrolled` : "Application updated");
      onSaved();
    } catch (err) {
      toast.error(apiError(err, "Could not update this application"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={application.childName} className="max-w-xl">
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-surface-2 p-4 text-sm">
        <div><p className="text-xs text-muted">Parent</p><p className="text-fg">{application.parentName}</p></div>
        <div><p className="text-xs text-muted">Phone</p><p className="text-fg">{application.parentPhone}</p></div>
        <div><p className="text-xs text-muted">Email</p><p className="text-fg">{application.parentEmail || "-"}</p></div>
        <div><p className="text-xs text-muted">Grade applying for</p><p className="text-fg">{application.gradeApplyingFor || "-"}</p></div>
        <div><p className="text-xs text-muted">Gender</p><p className="text-fg">{application.gender || "-"}</p></div>
        <div><p className="text-xs text-muted">Date of birth</p><p className="text-fg">{application.dob ? formatDate(application.dob) : "-"}</p></div>
        {application.message ? (
          <div className="col-span-2"><p className="text-xs text-muted">Message</p><p className="text-fg">{application.message}</p></div>
        ) : null}
      </div>

      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="New">New</option>
          <option value="Reviewing">Reviewing</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </Select>
        <Textarea label="Review note" rows={3} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />

        {canCreateStudent ? (
          <div className="rounded-2xl border border-dashed border-border p-4">
            <p className="mb-3 text-sm font-medium text-fg">
              Enrol {application.childName} now (optional, can be done later from Students)
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Admission number" value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} placeholder="ADM-0001" />
              <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <Select label="Class" value={schoolClass} onChange={(e) => setSchoolClass(e.target.value)} className="mt-3">
              <option value="">Not assigned yet</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>{c.name} {c.section}</option>
              ))}
            </Select>
          </div>
        ) : application.createdStudent ? (
          <p className="text-sm text-muted">
            Already enrolled as {application.createdStudent.name} ({application.createdStudent.admissionNo}).
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState(null);
  const [classes, setClasses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const { data } = await api.get("/applications", { params: statusFilter ? { status: statusFilter } : {} });
      setApplications(data.applications);
    } catch (err) {
      toast.error(apiError(err, "Could not load applications"));
      setApplications([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    api.get("/classes").then(({ data }) => setClasses(data.classes)).catch(() => {});
  }, []);

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.delete(`/applications/${toDelete._id}`);
      toast.success("Application deleted");
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not delete this application"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Admission enquiries submitted from the public website."
      />

      <div className="mb-4 max-w-[10rem]">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Any status</option>
          <option value="New">New</option>
          <option value="Reviewing">Reviewing</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </Select>
      </div>

      {applications === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications"
          description="Applications submitted on the admissions page will show up here."
        />
      ) : (
        <Table headers={["Child", "Parent", "Grade", "Submitted", "Status", ""]}>
          {applications.map((a) => (
            <Table.Row
              key={a._id}
              className="cursor-pointer"
              onClick={() => setSelected(a)}
            >
              <Table.Cell className="font-medium">{a.childName}</Table.Cell>
              <Table.Cell className="text-muted">{a.parentName}<div className="text-xs">{a.parentPhone}</div></Table.Cell>
              <Table.Cell className="text-muted">{a.gradeApplyingFor || "-"}</Table.Cell>
              <Table.Cell className="text-muted">{formatDate(a.createdAt)}</Table.Cell>
              <Table.Cell><Badge tone={statusTone[a.status]}>{a.status}</Badge></Table.Cell>
              <Table.Cell>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setToDelete(a); }}
                    aria-label={`Delete application for ${a.childName}`}
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

      {selected ? (
        <ReviewModal
          application={selected}
          classes={classes}
          onClose={() => setSelected(null)}
          onSaved={() => { setSelected(null); load(); }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Delete this application?"
        description={`The application for "${toDelete?.childName}" will be removed.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

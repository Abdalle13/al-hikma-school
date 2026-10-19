import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { FileText, Trash2, Search, CheckCircle2, Clock, XCircle, UserCheck } from "lucide-react";
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
  const [feeCategory, setFeeCategory] = useState(application.feeCategory || "Regular");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const canCreateStudent = status === "Accepted" && !application.createdStudent;

  async function generateAdmissionNo() {
    setGenerating(true);
    try {
      const { data } = await api.get("/students/next-admission-no");
      setAdmissionNo(data.admissionNo);
    } catch (err) {
      toast.error(apiError(err, "Could not generate a number"));
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    if (canCreateStudent && !admissionNo) generateAdmissionNo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCreateStudent]);

  async function onSubmit(e) {
    e.preventDefault();
    if (canCreateStudent && password && password.length < 6) {
      toast.error("Student login password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      const payload = { status, reviewNote };
      if (canCreateStudent && password) {
        Object.assign(payload, {
          admissionNo: admissionNo || undefined,
          password,
          schoolClass: schoolClass || undefined,
          motherName: application.motherName || undefined,
          feeCategory: feeCategory || "Regular",
          previousSchool: application.previousSchool || undefined,
        });
      }
      const { data } = await api.patch(`/applications/${application._id}/review`, payload);
      toast.success(data.createdStudent ? `Accepted! ${data.createdStudent.name} is now enrolled` : "Application updated");
      onSaved();
    } catch (err) {
      toast.error(apiError(err, "Could not update this application"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Application: ${application.childName}`} className="max-w-xl">
      <div className="mb-4 grid grid-cols-2 gap-x-3 gap-y-3 rounded-2xl bg-surface-2 p-4 text-xs">
        <div><p className="text-muted font-medium">Child Full Name</p><p className="text-fg font-semibold text-sm">{application.childName}</p></div>
        <div><p className="text-muted font-medium">Parent / Guardian</p><p className="text-fg font-semibold text-sm">{application.parentName}</p></div>
        <div><p className="text-muted font-medium">Contact Phone</p><p className="text-fg font-mono">{application.parentPhone}</p></div>
        <div><p className="text-muted font-medium">Email Address</p><p className="text-fg">{application.parentEmail || "—"}</p></div>
        <div><p className="text-muted font-medium">Gender & DOB</p><p className="text-fg">{application.gender || "—"}, {application.dob ? formatDate(application.dob) : "—"}</p></div>
        <div><p className="text-muted font-medium">Fee Category Request</p><p className="text-fg font-medium">{application.feeCategory || "Regular"}</p></div>
        {application.motherName && <div><p className="text-muted font-medium">Mother's Name</p><p className="text-fg">{application.motherName}</p></div>}
        {application.previousSchool && <div><p className="text-muted font-medium">Previous School</p><p className="text-fg">{application.previousSchool}</p></div>}
        {application.message && (
          <div className="col-span-2 pt-1 border-t border-border">
            <p className="text-muted font-medium">Parent Notes / Message</p>
            <p className="text-fg italic">{application.message}</p>
          </div>
        )}
      </div>

      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Decision Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="New">New</option>
            <option value="Reviewing">Under Review</option>
            <option value="Accepted">Accepted & Approved</option>
            <option value="Rejected">Rejected</option>
          </Select>
          <Select label="Fee Category" value={feeCategory} onChange={(e) => setFeeCategory(e.target.value)}>
            <option value="Regular">Regular (Full Tuition)</option>
            <option value="Orphan">Orphan (Agoon - Free)</option>
            <option value="Scholarship">Scholarship (Deeq Waxbarasho)</option>
            <option value="StaffChild">Staff Child (Carruurta Macallinka)</option>
          </Select>
        </div>

        <Textarea
          label="Review Note"
          rows={2}
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          placeholder="Notes on admission interview, requirements, or decision rationale"
        />

        {canCreateStudent ? (
          <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
            <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <UserCheck className="h-4 w-4" /> Enrol {application.childName} Immediately
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-fg mb-1 block">Admission Number</label>
                <div className="flex gap-2">
                  <Input
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    placeholder="e.g. ADM-0010"
                    className="flex-1 text-xs"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={generateAdmissionNo} disabled={generating}>
                    {generating ? "..." : "Auto"}
                  </Button>
                </div>
              </div>
              <Input
                label="Student Portal Password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Initial password (min 6 chars)"
              />
            </div>
            <Select label="Assign Class" value={schoolClass} onChange={(e) => setSchoolClass(e.target.value)}>
              <option value="">Not assigned yet</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.section}
                </option>
              ))}
            </Select>
          </div>
        ) : application.createdStudent ? (
          <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-xs text-success font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Already enrolled as {application.createdStudent.name} ({application.createdStudent.admissionNo}).</span>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Review"}
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
  const [search, setSearch] = useState("");
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

  const counts = useMemo(() => {
    if (!applications) return { total: 0, new: 0, reviewing: 0, accepted: 0, rejected: 0 };
    return {
      total: applications.length,
      new: applications.filter((a) => a.status === "New").length,
      reviewing: applications.filter((a) => a.status === "Reviewing").length,
      accepted: applications.filter((a) => a.status === "Accepted").length,
      rejected: applications.filter((a) => a.status === "Rejected").length,
    };
  }, [applications]);

  const filtered = useMemo(() => {
    if (!applications) return [];
    if (!search) return applications;
    const q = search.toLowerCase();
    return applications.filter(
      (a) =>
        a.childName?.toLowerCase().includes(q) ||
        a.parentName?.toLowerCase().includes(q) ||
        a.parentPhone?.toLowerCase().includes(q)
    );
  }, [applications, search]);

  return (
    <div>
      <PageHeader
        title="Student Applications"
        description="Review admission requests submitted online or in person. Approve and enroll candidates directly into classes."
      />

      {/* KPI Stats Strip */}
      {applications && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-info/10 text-info">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted">New Applications</p>
              <p className="text-lg font-bold text-fg tabular-nums">{counts.new}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-warning/10 text-warning">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted">Under Review</p>
              <p className="text-lg font-bold text-fg tabular-nums">{counts.reviewing}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-success/10 text-success">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted">Accepted</p>
              <p className="text-lg font-bold text-fg tabular-nums">{counts.accepted}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-danger/10 text-danger">
              <XCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted">Rejected</p>
              <p className="text-lg font-bold text-fg tabular-nums">{counts.rejected}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search child or parent name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs text-xs"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Reviewing">Under Review</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </Select>
      </div>

      {applications === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description={
            applications.length === 0
              ? "New admission requests submitted through the portal will appear here."
              : "Try adjusting your search or status filter."
          }
        />
      ) : (
        <Table headers={["Applicant Child", "Parent / Guardian", "Fee Request", "Submission Date", "Status", ""]}>
          {filtered.map((a) => (
            <Table.Row
              key={a._id}
              className="cursor-pointer hover:bg-surface-2/40"
              onClick={() => setSelected(a)}
            >
              <Table.Cell>
                <p className="font-semibold text-fg">{a.childName}</p>
                <p className="text-xs text-muted">
                  {a.gender || "Gender not specified"}{a.dob ? ` · ${formatDate(a.dob)}` : ""}
                </p>
              </Table.Cell>
              <Table.Cell className="text-muted text-xs">
                <p className="font-medium text-fg">{a.parentName}</p>
                <p className="tabular-nums font-mono text-[11px]">{a.parentPhone}</p>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  tone={
                    a.feeCategory === "Orphan"
                      ? "warning"
                      : a.feeCategory === "Scholarship"
                      ? "info"
                      : "neutral"
                  }
                >
                  {a.feeCategory || "Regular"}
                </Badge>
              </Table.Cell>
              <Table.Cell className="text-muted text-xs tabular-nums">
                {formatDate(a.createdAt)}
              </Table.Cell>
              <Table.Cell>
                <Badge tone={statusTone[a.status]}>{a.status}</Badge>
              </Table.Cell>
              <Table.Cell>
                <div className="flex justify-end gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(a);
                    }}
                  >
                    Review
                  </Button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setToDelete(a);
                    }}
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
          onSaved={() => {
            setSelected(null);
            load();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Delete this application?"
        description={`The application for "${toDelete?.childName}" will be permanently removed.`}
        confirmLabel="Delete Application"
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Briefcase, KeyRound, Users, Plus, ShieldOff, ShieldCheck,
  Eye, Pencil, X, ChevronDown,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Table } from "../components/ui/Table.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import api, { apiError } from "../utils/api.js";

// ─── helpers ─────────────────────────────────────────────────────────────────
const TAB_LABELS = ["Basic Info", "Professional", "Emergency"];

const EMPTY_TEACHER = {
  name: "", email: "", phone: "", password: "",
  gender: "", dob: "",
  // professional
  employeeId: "", qualification: "", specialization: "",
  nationality: "", nin: "", joinDate: "", contractType: "",
  // emergency
  emergencyName: "", emergencyPhone: "", emergencyRelation: "",
};

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-border mb-6">
      {tabs.map((t, i) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(i)}
          className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
            active === i
              ? "border-b-2 border-accent text-accent"
              : "text-muted hover:text-fg"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <FormField label={label}>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg pr-8 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">{placeholder || "— Select —"}</option>
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
      </div>
    </FormField>
  );
}

// ─── Add / Edit teacher form ─────────────────────────────────────────────────
function TeacherForm({ initial, onCancel, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY_TEACHER;
    return {
      name: initial.name || "",
      email: initial.email || "",
      phone: initial.phone || "",
      password: "",
      gender: initial.gender || "",
      dob: initial.dob ? initial.dob.slice(0, 10) : "",
      employeeId: initial.employeeId || "",
      qualification: initial.qualification || "",
      specialization: initial.specialization || "",
      nationality: initial.nationality || "",
      nin: initial.nin || "",
      joinDate: initial.joinDate ? initial.joinDate.slice(0, 10) : "",
      contractType: initial.contractType || "",
      emergencyName: initial.teacherEmergencyContact?.name || "",
      emergencyPhone: initial.teacherEmergencyContact?.phone || "",
      emergencyRelation: initial.teacherEmergencyContact?.relation || "",
    };
  });
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required"); setTab(0); return;
    }
    if (!isEdit && form.password.length < 6) {
      toast.error("Password must be at least 6 characters"); setTab(0); return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      gender: form.gender || undefined,
      dob: form.dob || undefined,
      employeeId: form.employeeId || undefined,
      qualification: form.qualification || undefined,
      specialization: form.specialization || undefined,
      nationality: form.nationality || undefined,
      nin: form.nin || undefined,
      joinDate: form.joinDate || undefined,
      contractType: form.contractType || undefined,
      teacherEmergencyContact: (form.emergencyName || form.emergencyPhone)
        ? { name: form.emergencyName, phone: form.emergencyPhone, relation: form.emergencyRelation }
        : undefined,
    };
    if (!isEdit) { payload.role = "Teacher"; payload.password = form.password; }
    else if (form.password) { payload.password = form.password; }

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/users/${initial._id}`, payload);
        toast.success(`${form.name}'s profile updated`);
      } else {
        const { data } = await api.post("/users", payload);
        toast.success(`${data.user.name} added. Share the password with them directly.`);
      }
      onSaved();
    } catch (err) {
      toast.error(apiError(err, isEdit ? "Could not update this teacher" : "Could not add this teacher"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <TabBar tabs={TAB_LABELS} active={tab} onChange={setTab} />

      {/* ── Tab 0: Basic Info ── */}
      {tab === 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Full Name *" value={form.name} onChange={set("name")}
              placeholder="Teacher's full name" required />
          </div>
          <Input label="Email *" type="email" value={form.email} onChange={set("email")}
            placeholder="teacher@school.com" required />
          <Input label="Phone" value={form.phone} onChange={set("phone")}
            placeholder="+252 61 xxxxxxx" />
          <SelectField label="Gender" value={form.gender} onChange={set("gender")}
            options={["Male", "Female"]} />
          <FormField label="Date of Birth">
            <input type="date" value={form.dob} onChange={set("dob")}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent" />
          </FormField>
          <div className="sm:col-span-2">
            <Input
              label={isEdit ? "New Password (leave blank to keep)" : "Password *"}
              value={form.password} onChange={set("password")}
              placeholder={isEdit ? "Leave blank to keep current password" : "At least 6 characters"}
              hint={isEdit ? "" : "Give this to the teacher directly. They will change it on first login."}
            />
          </div>
        </div>
      )}

      {/* ── Tab 1: Professional Details ── */}
      {tab === 1 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Employee ID" value={form.employeeId} onChange={set("employeeId")}
            placeholder="e.g. EMP-2025-001" />
          <SelectField label="Contract Type" value={form.contractType} onChange={set("contractType")}
            options={[
              { value: "Permanent", label: "Permanent" },
              { value: "Contract", label: "Contract" },
              { value: "PartTime", label: "Part-Time" },
              { value: "Volunteer", label: "Volunteer" },
            ]} />
          <Input label="Qualification" value={form.qualification} onChange={set("qualification")}
            placeholder="e.g. B.Ed Mathematics, M.Sc Physics" />
          <Input label="Specialization" value={form.specialization} onChange={set("specialization")}
            placeholder="e.g. Mathematics & Physics" />
          <Input label="Nationality" value={form.nationality} onChange={set("nationality")}
            placeholder="e.g. Somali" />
          <Input label="National ID (NIN)" value={form.nin} onChange={set("nin")}
            placeholder="National identification number" />
          <FormField label="Join Date">
            <input type="date" value={form.joinDate} onChange={set("joinDate")}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent" />
          </FormField>
        </div>
      )}

      {/* ── Tab 2: Emergency Contact ── */}
      {tab === 2 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-sm text-muted mb-3">Person to contact in case of emergency (not the teacher).</p>
          </div>
          <Input label="Contact Name" value={form.emergencyName} onChange={set("emergencyName")}
            placeholder="Full name of the contact person" />
          <Input label="Contact Phone" value={form.emergencyPhone} onChange={set("emergencyPhone")}
            placeholder="+252 61 xxxxxxx" />
          <Input label="Relationship" value={form.emergencyRelation} onChange={set("emergencyRelation")}
            placeholder="e.g. Spouse, Sibling, Parent" />
        </div>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t border-border">
        <div className="flex gap-2">
          {tab > 0 && (
            <Button type="button" variant="outline" onClick={() => setTab(t => t - 1)}>← Back</Button>
          )}
          {tab < TAB_LABELS.length - 1 && (
            <Button type="button" onClick={() => setTab(t => t + 1)}>Next →</Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Add teacher"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ─── Reset Password form ─────────────────────────────────────────────────────
function ResetPasswordForm({ teacher, onCancel, onSaved }) {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (password.length < 6) { toast.error("The new password must be at least 6 characters"); return; }
    setSaving(true);
    try {
      await api.put(`/users/${teacher._id}`, { password });
      toast.success(`Password reset for ${teacher.name}. Share it with them directly.`);
      onSaved();
    } catch (err) {
      toast.error(apiError(err, "Could not reset the password"));
    } finally { setSaving(false); }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <Input
        label="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 6 characters"
        hint="The teacher will be asked to change it on their next login."
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Reset password"}</Button>
      </div>
    </form>
  );
}

// ─── View Profile Drawer ─────────────────────────────────────────────────────
function ProfileRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</span>
      <span className="text-sm text-fg">{value}</span>
    </div>
  );
}

function ViewProfile({ teacher, onClose, onEdit }) {
  const ec = teacher.teacherEmergencyContact;
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : null;

  const contractLabels = { Permanent:"Permanent", Contract:"Contract", PartTime:"Part-Time", Volunteer:"Volunteer" };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <Avatar name={teacher.name} size="lg" />
        <div>
          <h3 className="font-semibold text-lg text-fg">{teacher.name}</h3>
          <p className="text-sm text-muted">{teacher.email}</p>
          {teacher.employeeId && <p className="text-xs text-muted font-mono">{teacher.employeeId}</p>}
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface-2"><X className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Personal */}
      <div>
        <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Personal Information</h4>
        <div className="grid grid-cols-2 gap-3">
          <ProfileRow label="Phone" value={teacher.phone} />
          <ProfileRow label="Gender" value={teacher.gender} />
          <ProfileRow label="Date of Birth" value={fmt(teacher.dob)} />
          <ProfileRow label="Nationality" value={teacher.nationality} />
          <ProfileRow label="National ID" value={teacher.nin} />
          <ProfileRow label="Status" value={
            <Badge tone={teacher.status === "Active" ? "success" : "danger"}>{teacher.status}</Badge>
          } />
        </div>
      </div>

      {/* Professional */}
      <div>
        <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Professional Details</h4>
        <div className="grid grid-cols-2 gap-3">
          <ProfileRow label="Qualification" value={teacher.qualification} />
          <ProfileRow label="Specialization" value={teacher.specialization} />
          <ProfileRow label="Contract Type" value={contractLabels[teacher.contractType] || teacher.contractType} />
          <ProfileRow label="Join Date" value={fmt(teacher.joinDate)} />
          <ProfileRow label="Teaches" value={teacher.assignmentCount > 0 ? `${teacher.assignmentCount} subject${teacher.assignmentCount === 1 ? "" : "s"}` : null} />
          <ProfileRow label="Class Teacher Of" value={
            teacher.classTeacherOf?.length
              ? teacher.classTeacherOf.map((c) => `${c.name} ${c.section || ""}`.trim()).join(", ")
              : null
          } />
        </div>
      </div>

      {/* Emergency Contact */}
      {(ec?.name || ec?.phone) && (
        <div>
          <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Emergency Contact</h4>
          <div className="grid grid-cols-2 gap-3">
            <ProfileRow label="Name" value={ec?.name} />
            <ProfileRow label="Phone" value={ec?.phone} />
            <ProfileRow label="Relationship" value={ec?.relation} />
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-3 border-t border-border">
        <p className="text-xs text-muted">
          Joined system: {fmt(teacher.createdAt)} &nbsp;·&nbsp; Last updated: {fmt(teacher.updatedAt)}
        </p>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AdminStaffPage() {
  const [staff, setStaff] = useState(null);
  const [total, setTotal] = useState(0);
  const [overallTotal, setOverallTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(false);       // add modal
  const [editTeacher, setEditTeacher] = useState(null);
  const [viewTeacher, setViewTeacher] = useState(null);
  const [resetFor, setResetFor] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/staff", { params });
      setStaff(data.staff);
      setTotal(data.total ?? data.staff?.length ?? 0);
      if (data.overallTotal !== undefined) {
        setOverallTotal(data.overallTotal);
      } else if (!search && !statusFilter) {
        setOverallTotal(data.staff?.length ?? 0);
      }
    } catch (err) {
      toast.error(apiError(err, "Could not load staff"));
      setStaff([]);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  useEffect(() => {
    api.get("/staff").then(({ data }) => {
      if (data.overallTotal !== undefined) setOverallTotal(data.overallTotal);
      else if (data.staff) setOverallTotal(data.staff.length);
    }).catch(() => {});
  }, []);

  async function toggleStatus(t) {
    setBusyId(t._id);
    try {
      await api.put(`/users/${t._id}`, { status: t.status === "Active" ? "Inactive" : "Active" });
      toast.success(t.status === "Active" ? "Teacher deactivated" : "Teacher reactivated");
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not update this teacher"));
    } finally {
      setBusyId(null);
    }
  }

  function openEdit(t) { setEditTeacher(t); setViewTeacher(null); }
  function closeEdit() { setEditTeacher(null); }
  function afterSave() { closeEdit(); setModal(false); load(); }

  return (
    <div>
      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-2.5">
            <span>Teachers</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Users className="h-3.5 w-3.5" />
              Total: {overallTotal || total} Teachers
            </span>
            {(search || statusFilter) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/30 animate-in fade-in">
                Filtered Total: {total} {total === 1 ? "Teacher" : "Teachers"}
              </span>
            )}
          </div>
        }
        description="Manage teaching staff — profiles, qualifications and assignments."
        action={
          <Button onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" /> Add teacher
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="max-w-sm flex-1 min-w-[220px]">
          <Input placeholder="Search by name, email or phone" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              !statusFilter
                ? "bg-primary text-primary-fg border-primary shadow-sm"
                : "bg-surface text-muted hover:text-fg hover:bg-surface-2 border-border"
            }`}
          >
            All Teachers ({overallTotal || total})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("Active")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              statusFilter === "Active"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-surface text-muted hover:text-fg hover:bg-surface-2 border-border"
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("Inactive")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              statusFilter === "Inactive"
                ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                : "bg-surface text-muted hover:text-fg hover:bg-surface-2 border-border"
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {(search || statusFilter) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">Active Filter Result:</span>
            {statusFilter && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20">
                Status: {statusFilter}
              </span>
            )}
            {search && (
              <span className="px-2 py-0.5 rounded-md bg-surface text-fg font-medium border border-border">
                Search: "{search}"
              </span>
            )}
            <span className="font-bold text-fg ml-1">
              → Found {total} teacher{total === 1 ? "" : "s"}
            </span>
            {overallTotal > 0 && (
              <span className="text-muted">
                (out of {overallTotal} total staff)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
            className="text-xs font-semibold text-primary hover:underline ml-auto"
          >
            Clear Filters
          </button>
        </div>
      )}

      {staff === null ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : staff.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No teachers yet"
          description="Add a teacher to start assigning classes and subjects."
          action={<Button onClick={() => setModal(true)}>Add teacher</Button>}
        />
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>
              {(search || statusFilter)
                ? `Showing ${staff?.length || 0} of ${total} filtered teachers`
                : `Showing ${staff?.length || 0} of ${total} teachers`}
            </span>
            {statusFilter && (
              <span className="font-semibold text-fg">
                Filter Total ({statusFilter}): {total}
              </span>
            )}
          </div>
          <Table headers={["Teacher", "Contact", "Qualification", "Class Teacher Of", "Teaches", "Status", ""]}>
          {staff.map((t) => (
            <Table.Row key={t._id}>
              <Table.Cell>
                <div className="flex items-center gap-3">
                  <Avatar name={t.name} size="sm" />
                  <div>
                    <div className="font-medium">{t.name}</div>
                    {t.employeeId && <div className="text-xs text-muted font-mono">{t.employeeId}</div>}
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell className="text-muted">
                {t.email}
                {t.phone && <div className="text-xs">{t.phone}</div>}
              </Table.Cell>
              <Table.Cell className="text-muted text-sm">
                {t.qualification || "-"}
                {t.specialization && <div className="text-xs">{t.specialization}</div>}
              </Table.Cell>
              <Table.Cell className="text-muted">
                {t.classTeacherOf?.length
                  ? t.classTeacherOf.map((c) => `${c.name} ${c.section || ""}`.trim()).join(", ")
                  : "-"}
              </Table.Cell>
              <Table.Cell className="tabular-nums text-muted">{t.assignmentCount}</Table.Cell>
              <Table.Cell>
                {t.status === "Active"
                  ? <Badge tone="success">Active</Badge>
                  : <Badge tone="danger">Inactive</Badge>}
              </Table.Cell>
              <Table.Cell>
                <div className="flex justify-end gap-1">
                  {/* View profile */}
                  <button type="button" onClick={() => setViewTeacher(t)} title="View profile"
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg">
                    <Eye className="h-4 w-4" />
                  </button>
                  {/* Edit profile */}
                  <button type="button" onClick={() => openEdit(t)} title="Edit profile"
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg">
                    <Pencil className="h-4 w-4" />
                  </button>
                  {/* Reset password */}
                  <button type="button" onClick={() => setResetFor(t)} title="Reset password"
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg">
                    <KeyRound className="h-4 w-4" />
                  </button>
                  {/* Toggle status */}
                  <button type="button" onClick={() => toggleStatus(t)} disabled={busyId === t._id}
                    title={t.status === "Active" ? "Deactivate" : "Reactivate"}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg">
                    {t.status === "Active" ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  </button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>
        </>
      )}

      {/* Add teacher modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Teacher">
        <TeacherForm onCancel={() => setModal(false)} onSaved={afterSave} />
      </Modal>

      {/* Edit teacher modal */}
      <Modal open={Boolean(editTeacher)} onClose={closeEdit}
        title={editTeacher ? `Edit — ${editTeacher.name}` : "Edit Teacher"}>
        {editTeacher && (
          <TeacherForm initial={editTeacher} onCancel={closeEdit} onSaved={afterSave} />
        )}
      </Modal>

      {/* View profile modal */}
      <Modal open={Boolean(viewTeacher)} onClose={() => setViewTeacher(null)} title="Teacher Profile">
        {viewTeacher && (
          <ViewProfile
            teacher={viewTeacher}
            onClose={() => setViewTeacher(null)}
            onEdit={() => openEdit(viewTeacher)}
          />
        )}
      </Modal>

      {/* Reset password modal */}
      <Modal
        open={Boolean(resetFor)}
        onClose={() => setResetFor(null)}
        title={resetFor ? `Reset password — ${resetFor.name}` : "Reset password"}
      >
        {resetFor && (
          <ResetPasswordForm
            teacher={resetFor}
            onCancel={() => setResetFor(null)}
            onSaved={() => setResetFor(null)}
          />
        )}
      </Modal>
    </div>
  );
}

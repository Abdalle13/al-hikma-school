import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Key,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
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
import { useSelector } from "react-redux";
import api, { apiError } from "../utils/api.js";

const roleTone = { Admin: "warning", Parent: "info", Teacher: "success", Student: "neutral" };
const empty = { name: "", role: "Parent", email: "", phone: "", password: "", studentId: "", relation: "Father" };

function generateRandomPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pwd = "Sch";
  for (let i = 0; i < 5; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${pwd}@${Math.floor(100 + Math.random() * 900)}`;
}

function UserForm({ initial, onCancel, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, email: initial.email || "", phone: initial.phone || "", password: "", role: initial.role }
      : { ...empty, password: generateRandomPassword() }
  );
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      api.get("/students", { params: { limit: 100 } })
        .then(({ data }) => setStudents(data.students || []))
        .catch(() => {});
    }
  }, [isEdit]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function randomizePassword() {
    const pwd = generateRandomPassword();
    setForm((f) => ({ ...f, password: pwd }));
    toast.success("New password generated");
  }

  function copyCredentials() {
    if (!form.email || !form.password) {
      toast.error("Please fill in email and password first");
      return;
    }
    const text = `School Portal Login Details:\nRole: ${form.role}\nEmail: ${form.email}\nPassword: ${form.password}\nPlease log in and update your password upon initial sign in.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Login credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || (!isEdit && !form.email.trim()) || (!isEdit && form.password.length < 6)) {
      toast.error("Name, email and a password of at least 6 characters are required");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        const payload = { name: form.name, email: form.email, phone: form.phone };
        if (form.password) payload.password = form.password;
        const { data } = await api.put(`/users/${initial._id}`, payload);
        toast.success("Account updated");
        onSaved(data.user);
      } else {
        const { data } = await api.post("/users", {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: form.role,
        });

        // If a child was selected to link to this parent
        if (form.role === "Parent" && form.studentId && data.user?._id) {
          try {
            await api.post(`/users/${form.studentId}/guardians`, {
              parentId: data.user._id,
              relation: form.relation || "Guardian",
            });
            toast.success("Parent linked to child student");
          } catch (linkErr) {
            console.error("Link guardian error:", linkErr);
          }
        }

        toast.success(`${data.user.name} account created`);
        onSaved(data.user);
      }
    } catch (err) {
      toast.error(apiError(err, "Could not save account"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-1" onSubmit={onSubmit} noValidate>
      {!isEdit ? (
        <div>
          <Select label="Account Role" value={form.role} onChange={set("role")}>
            <option value="Parent">Parent (Access to Parent Portal & Child Records)</option>
            <option value="Admin">Admin (Full System Administrative Access)</option>
            <option value="Teacher">Teacher (Staff Portal Access)</option>
          </Select>
          <p className="mt-1 text-xs text-muted">
            {form.role === "Parent"
              ? "Parents can monitor child attendance, download report cards, and view fee balances."
              : form.role === "Admin"
              ? "Admins manage all school settings, users, classes, finances, and academic records."
              : "Teachers can record attendance, manage marks, and post class announcements."}
          </p>
        </div>
      ) : null}

      <Input label="Full Name" value={form.name} onChange={set("name")} placeholder="e.g. Fatima Ali Hassan" required />
      <Input label="Email Address (Login Username)" type="email" value={form.email} onChange={set("email")} placeholder="parent@example.com" required />
      <Input label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="+252 61..." />

      {/* Password with generator & copy */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-fg">
            {isEdit ? "Reset Password (Leave blank to keep current)" : "Initial Password"}
          </label>
          {!isEdit ? (
            <button
              type="button"
              onClick={randomizePassword}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <RefreshCw className="h-3 w-3" /> Auto-generate
            </button>
          ) : null}
        </div>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
            placeholder={isEdit ? "Leave blank to keep unchanged" : "At least 6 characters"}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted hover:text-fg"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Copy credentials button */}
      {!isEdit && form.email && form.password ? (
        <button
          type="button"
          onClick={copyCredentials}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied Credentials!" : "Copy Login Details to Clipboard"}
        </button>
      ) : null}

      {/* Link Child for Parent Role */}
      {!isEdit && form.role === "Parent" && students.length > 0 ? (
        <div className="rounded-xl border border-border bg-surface-2/50 p-3.5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-fg">
            <Users className="h-3.5 w-3.5 text-primary" /> Link Child / Student (Optional)
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Select label="Select Student" value={form.studentId} onChange={set("studentId")}>
              <option value="">Do not link yet</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.admissionNo})
                </option>
              ))}
            </Select>

            <Select label="Relationship" value={form.relation} onChange={set("relation")} disabled={!form.studentId}>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
              <option value="Other">Other</option>
            </Select>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Account"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminUsersPage() {
  const me = useSelector((s) => s.auth.user);
  const [users, setUsers] = useState(null);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [total, setTotal] = useState(0);
  const [overallTotal, setOverallTotal] = useState(0);
  const [roleBreakdown, setRoleBreakdown] = useState({});
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      const params = {
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 15,
      };
      const { data } = await api.get("/users", { params });
      setUsers(data.users);
      setMeta({ page: data.page, pages: data.pages });
      setTotal(data.total ?? data.users?.length ?? 0);
      if (data.overallTotal !== undefined) {
        setOverallTotal(data.overallTotal);
      } else if (!search && !roleFilter && !statusFilter) {
        setOverallTotal(data.total ?? 0);
      }
      if (data.roleBreakdown) {
        setRoleBreakdown(data.roleBreakdown);
      }
    } catch (err) {
      toast.error(apiError(err, "Could not load user accounts"));
      setUsers([]);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    api.get("/users", { params: { limit: 1 } })
      .then(({ data }) => {
        if (data.overallTotal !== undefined) setOverallTotal(data.overallTotal);
        else if (data.total !== undefined) setOverallTotal(data.total);
        if (data.roleBreakdown) setRoleBreakdown(data.roleBreakdown);
      })
      .catch(() => {});
  }, []);

  function onSaved() {
    setModal(null);
    load();
  }

  async function toggleStatus(u) {
    setBusyId(u._id);
    try {
      await api.put(`/users/${u._id}`, { status: u.status === "Active" ? "Inactive" : "Active" });
      toast.success(u.status === "Active" ? "Account deactivated" : "Account reactivated");
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not update account status"));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    setBusyId(toDelete._id);
    try {
      await api.delete(`/users/${toDelete._id}`);
      toast.success("Account deleted");
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not delete this account"));
    } finally {
      setBusyId(null);
    }
  }

  function copyUserLogin(u) {
    const text = `School Portal Login Details:\nName: ${u.name}\nRole: ${u.role}\nEmail/ID: ${u.email || u.admissionNo}\nPhone: ${u.phone || "N/A"}`;
    navigator.clipboard.writeText(text);
    toast.success(`Copied login username for ${u.name}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-2.5">
            <span>User Accounts & Security</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Users className="h-3.5 w-3.5" />
              Total Accounts: {overallTotal || total}
            </span>
            {(search || roleFilter || statusFilter) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/30 animate-in fade-in">
                Filtered Total: {total} {total === 1 ? "Account" : "Accounts"}
              </span>
            )}
          </div>
        }
        description="Manage portal access for administrators, parents, and faculty with secure credential provisioning."
        action={
          <Button onClick={() => setModal({ mode: "create" })}>
            <UserPlus className="h-4 w-4" /> Add User Account
          </Button>
        }
      />

      {/* Quick Role Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider mr-1">
          Filter by Role:
        </span>
        <button
          type="button"
          onClick={() => {
            setRoleFilter("");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            !roleFilter
              ? "bg-primary text-primary-fg border-primary shadow-sm"
              : "bg-surface text-muted hover:text-fg hover:bg-surface-2 border-border"
          }`}
        >
          All Accounts ({overallTotal || total})
        </button>
        <button
          type="button"
          onClick={() => {
            setRoleFilter("Admin");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            roleFilter === "Admin"
              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
              : "bg-surface text-muted hover:text-fg hover:bg-surface-2 border-border"
          }`}
        >
          Admins {roleBreakdown?.Admin !== undefined ? `(${roleBreakdown.Admin})` : ""}
        </button>
        <button
          type="button"
          onClick={() => {
            setRoleFilter("Teacher");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            roleFilter === "Teacher"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-surface text-muted hover:text-fg hover:bg-surface-2 border-border"
          }`}
        >
          Teachers {roleBreakdown?.Teacher !== undefined ? `(${roleBreakdown.Teacher})` : ""}
        </button>
        <button
          type="button"
          onClick={() => {
            setRoleFilter("Parent");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            roleFilter === "Parent"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-surface text-muted hover:text-fg hover:bg-surface-2 border-border"
          }`}
        >
          Parents {roleBreakdown?.Parent !== undefined ? `(${roleBreakdown.Parent})` : ""}
        </button>
        <button
          type="button"
          onClick={() => {
            setRoleFilter("Student");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            roleFilter === "Student"
              ? "bg-purple-600 text-white border-purple-600 shadow-sm"
              : "bg-surface text-muted hover:text-fg hover:bg-surface-2 border-border"
          }`}
        >
          Students {roleBreakdown?.Student !== undefined ? `(${roleBreakdown.Student})` : ""}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full rounded-xl border border-border bg-bg pl-9 pr-3 py-2 text-xs text-fg placeholder:text-muted focus:border-primary focus:outline-hidden"
            />
          </div>

          <Select
            value={roleFilter}
            onChange={(e) => {
              setPage(1);
              setRoleFilter(e.target.value);
            }}
            className="w-36 text-xs"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Parent">Parent</option>
            <option value="Teacher">Teacher</option>
            <option value="Student">Student</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="w-32 text-xs"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>
      </div>

      {(search || roleFilter || statusFilter) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">Active Filter Result:</span>
            {roleFilter && (
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold border border-blue-500/20">
                Role: {roleFilter}
              </span>
            )}
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
              → Found {total} account{total === 1 ? "" : "s"}
            </span>
            {overallTotal > 0 && (
              <span className="text-muted">
                (out of {overallTotal} total registered)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setRoleFilter("");
              setStatusFilter("");
              setPage(1);
            }}
            className="text-xs font-semibold text-primary hover:underline ml-auto"
          >
            Clear Filters
          </button>
        </div>
      )}

      {users === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No accounts found"
          description="Try broadening your search or filter parameters, or create a new user account."
        />
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>
              {(search || roleFilter || statusFilter)
                ? `Showing ${users?.length || 0} of ${total} filtered user accounts`
                : `Showing ${users?.length || 0} of ${total} user accounts`}
            </span>
            {roleFilter && (
              <span className="font-semibold text-fg">
                Filter Total ({roleFilter}): {total}
              </span>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
          <Table headers={["User Account", "Role", "Contact Info", "Account Status", "Actions"]}>
            {users.map((u) => (
              <Table.Row key={u._id}>
                <Table.Cell>
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <p className="font-semibold text-sm text-fg">{u.name}</p>
                      <p className="text-xs text-muted font-mono">{u.email || u.admissionNo}</p>
                    </div>
                  </div>
                </Table.Cell>

                <Table.Cell>
                  <Badge tone={roleTone[u.role] || "neutral"} className="text-xs font-semibold">
                    {u.role}
                  </Badge>
                </Table.Cell>

                <Table.Cell className="text-xs text-muted">
                  {u.phone ? <p>{u.phone}</p> : null}
                  <p className="truncate max-w-[180px]">{u.email || "-"}</p>
                </Table.Cell>

                <Table.Cell>
                  {u.status === "Active" ? (
                    <Badge tone="success" className="text-xs">
                      Active
                    </Badge>
                  ) : (
                    <Badge tone="danger" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </Table.Cell>

                <Table.Cell>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => copyUserLogin(u)}
                      title="Copy login details"
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "edit", user: u })}
                      aria-label={`Edit ${u.name}`}
                      title="Edit Account"
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(u)}
                      disabled={busyId === u._id || u._id === me?._id}
                      title={u._id === me?._id ? "You cannot deactivate your own account" : "Toggle active status"}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-30"
                    >
                      {u.status === "Active" ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(u)}
                      disabled={u._id === me?._id}
                      title={u._id === me?._id ? "You cannot delete your own account" : "Delete account"}
                      aria-label={`Delete ${u.name}`}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table>

          <div className="p-3 border-t border-border">
            <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
          </div>
        </div>
        </>
      )}

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Edit User Account" : "Create New User Account"}
      >
        {modal ? <UserForm initial={modal.user} onCancel={() => setModal(null)} onSaved={onSaved} /> : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busyId === toDelete?._id}
        title="Delete this user account?"
        description={`"${toDelete?.name}" (${toDelete?.email || toDelete?.admissionNo}) will be permanently removed.`}
        confirmLabel="Delete Account"
      />
    </div>
  );
}

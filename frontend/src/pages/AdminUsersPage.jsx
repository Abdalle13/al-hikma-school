import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, ShieldCheck, ShieldOff, Trash2, Users } from "lucide-react";
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

const roleTone = { Admin: "info", Teacher: "success", Parent: "neutral" };
const empty = { name: "", role: "Parent", email: "", phone: "", password: "" };

function UserForm({ initial, onCancel, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, email: initial.email || "", phone: initial.phone || "", password: "" }
      : empty
  );
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

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
        const { data } = await api.post("/users", { ...form, role: form.role });
        toast.success(`${data.user.name} added`);
        onSaved(data.user);
      }
    } catch (err) {
      toast.error(apiError(err, "Could not save this account"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      {!isEdit ? (
        <Select label="Role" value={form.role} onChange={set("role")}>
          <option value="Parent">Parent</option>
          <option value="Admin">Admin</option>
        </Select>
      ) : null}
      <Input label="Full name" value={form.name} onChange={set("name")} placeholder="Enter the full name" />
      <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="Enter the email address" />
      <Input label="Phone" value={form.phone} onChange={set("phone")} placeholder="Enter the phone number" />
      <Input
        label={isEdit ? "Reset password (optional)" : "Password"}
        value={form.password}
        onChange={set("password")}
        placeholder={isEdit ? "Leave blank to keep the current one" : "Enter a password, at least 6 characters"}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Add account"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminUsersPage() {
  const me = useSelector((s) => s.auth.user);
  const [users, setUsers] = useState(null);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      const { data } = await api.get("/users", {
        params: { search: search || undefined, role: roleFilter || undefined, page, limit: 15 },
      });
      setUsers(data.users);
      setMeta({ page: data.page, pages: data.pages });
    } catch (err) {
      toast.error(apiError(err, "Could not load accounts"));
      setUsers([]);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, page]);

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
      toast.error(apiError(err, "Could not update this account"));
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

  return (
    <div>
      <PageHeader
        title="Users"
        description="Admin and parent accounts. Teachers live on the Staff page, students on the Students page."
        action={
          <Button onClick={() => setModal({ mode: "create" })}>
            <Plus className="h-4 w-4" /> Add account
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by name, email or phone"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          className="max-w-xs"
        />
        <Select value={roleFilter} onChange={(e) => { setPage(1); setRoleFilter(e.target.value); }} className="max-w-[10rem]">
          <option value="">All roles</option>
          <option value="Admin">Admin</option>
          <option value="Teacher">Teacher</option>
          <option value="Parent">Parent</option>
          <option value="Student">Student</option>
        </Select>
      </div>

      {users === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No accounts found" description="Try a different search or filter." />
      ) : (
        <>
          <Table headers={["Name", "Role", "Contact", "Status", ""]}>
            {users.map((u) => (
              <Table.Row key={u._id}>
                <Table.Cell>
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <span className="font-medium">{u.name}</span>
                  </div>
                </Table.Cell>
                <Table.Cell><Badge tone={roleTone[u.role] || "neutral"}>{u.role}</Badge></Table.Cell>
                <Table.Cell className="text-muted">{u.email || u.admissionNo}</Table.Cell>
                <Table.Cell>
                  {u.status === "Active" ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Inactive</Badge>}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setModal({ mode: "edit", user: u })}
                      aria-label={`Edit ${u.name}`}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(u)}
                      disabled={busyId === u._id || u._id === me?._id}
                      title={u._id === me?._id ? "You cannot change your own status" : "Toggle status"}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-30"
                    >
                      {u.status === "Active" ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(u)}
                      disabled={u._id === me?._id}
                      title={u._id === me?._id ? "You cannot delete your own account" : "Delete"}
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
          <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
        </>
      )}

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Edit account" : "Add account"}
      >
        {modal ? <UserForm initial={modal.user} onCancel={() => setModal(null)} onSaved={onSaved} /> : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busyId === toDelete?._id}
        title="Delete this account?"
        description={`"${toDelete?.name}" will be permanently removed.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

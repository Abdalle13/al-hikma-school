import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Briefcase, Plus, ShieldOff, ShieldCheck } from "lucide-react";
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

const empty = { name: "", email: "", phone: "", password: "" };

function TeacherForm({ onCancel, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      toast.error("Name, email and a password of at least 6 characters are required");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post("/users", { ...form, role: "Teacher" });
      toast.success(`${data.user.name} added. Share the password with them directly.`);
      onSaved();
    } catch (err) {
      toast.error(apiError(err, "Could not add this teacher"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <Input label="Full name" value={form.name} onChange={set("name")} />
      <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="teacher@school.com" />
      <Input label="Phone" value={form.phone} onChange={set("phone")} placeholder="+252 ..." />
      <Input
        label="Password"
        value={form.password}
        onChange={set("password")}
        placeholder="At least 6 characters, a 6 digit number works"
        hint="Give this to the teacher directly. They will be asked to change it on first login."
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Add teacher"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      const { data } = await api.get("/staff", { params: search ? { search } : {} });
      setStaff(data.staff);
    } catch (err) {
      toast.error(apiError(err, "Could not load staff"));
      setStaff([]);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Teachers, what they teach and which class they lead."
        action={
          <Button onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" /> Add teacher
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input placeholder="Search by name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {staff === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : staff.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No teachers yet"
          description="Add a teacher to start assigning classes and subjects."
          action={<Button onClick={() => setModal(true)}>Add teacher</Button>}
        />
      ) : (
        <Table headers={["Teacher", "Contact", "Class teacher of", "Teaches", "Status", ""]}>
          {staff.map((t) => (
            <Table.Row key={t._id}>
              <Table.Cell>
                <div className="flex items-center gap-3">
                  <Avatar name={t.name} size="sm" />
                  <span className="font-medium">{t.name}</span>
                </div>
              </Table.Cell>
              <Table.Cell className="text-muted">
                {t.email}
                {t.phone ? <div className="text-xs">{t.phone}</div> : null}
              </Table.Cell>
              <Table.Cell className="text-muted">
                {t.classTeacherOf?.length
                  ? t.classTeacherOf.map((c) => `${c.name} ${c.section || ""}`.trim()).join(", ")
                  : "-"}
              </Table.Cell>
              <Table.Cell className="tabular-nums text-muted">{t.assignmentCount}</Table.Cell>
              <Table.Cell>
                {t.status === "Active" ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Inactive</Badge>}
              </Table.Cell>
              <Table.Cell>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => toggleStatus(t)}
                    disabled={busyId === t._id}
                    title={t.status === "Active" ? "Deactivate" : "Reactivate"}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                  >
                    {t.status === "Active" ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  </button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add teacher">
        <TeacherForm onCancel={() => setModal(false)} onSaved={() => { setModal(false); load(); }} />
      </Modal>
    </div>
  );
}

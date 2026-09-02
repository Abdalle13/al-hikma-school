import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "./Button.jsx";
import { Input } from "./Input.jsx";
import { Select } from "./Select.jsx";
import { Textarea } from "./Textarea.jsx";
import { Badge } from "./Badge.jsx";
import { Spinner } from "./Spinner.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { Modal } from "./Modal.jsx";
import { ConfirmDialog } from "./ConfirmDialog.jsx";
import api, { apiError } from "../../utils/api.js";
import { formatDate } from "../../utils/formatter.js";

const ROLES = ["Admin", "Teacher", "Parent", "Student"];

function ComposeModal({ initial, canPostAll, classOptions, onClose, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState(
    initial
      ? {
          title: initial.title, body: initial.body,
          audience: initial.audience, schoolClass: initial.schoolClass?._id || "",
          role: initial.role || "Parent", isPublic: initial.isPublic || false,
        }
      : {
          title: "", body: "",
          audience: canPostAll ? "All" : "Class",
          schoolClass: classOptions[0]?._id || "",
          role: "Parent", isPublic: false,
        }
  );
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/announcements/${initial._id}`, {
          title: form.title, body: form.body, isPublic: form.isPublic,
        });
        toast.success("Announcement updated");
      } else {
        const payload = { title: form.title, body: form.body, audience: form.audience };
        if (form.audience === "Class") payload.schoolClass = form.schoolClass;
        if (form.audience === "Role") payload.role = form.role;
        if (canPostAll) payload.isPublic = form.isPublic;
        const { data } = await api.post("/announcements", payload);
        toast.success(
          data.notificationsSent
            ? `Posted. ${data.notificationsSent} notification(s) sent.`
            : "Announcement posted"
        );
      }
      onSaved();
    } catch (err) {
      toast.error(apiError(err, "Could not save the announcement"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? "Edit announcement" : "New announcement"}>
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <Input label="Title" value={form.title} onChange={set("title")} placeholder="Enter a title" />
        <Textarea label="Message" rows={4} value={form.body} onChange={set("body")} placeholder="Enter your message" />

        {!isEdit ? (
          <>
            {canPostAll ? (
              <Select label="Audience" value={form.audience} onChange={set("audience")}>
                <option value="All">Everyone</option>
                <option value="Class">A class</option>
                <option value="Role">A role</option>
              </Select>
            ) : (
              <p className="text-sm text-muted">This goes to one of your classes.</p>
            )}

            {form.audience === "Class" ? (
              <Select label="Class" value={form.schoolClass} onChange={set("schoolClass")}>
                {classOptions.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
              </Select>
            ) : null}

            {form.audience === "Role" && canPostAll ? (
              <Select label="Role" value={form.role} onChange={set("role")}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            ) : null}
          </>
        ) : null}

        {canPostAll ? (
          <label className="flex items-center gap-2 text-sm text-fg">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Also show this on the public website
          </label>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : isEdit ? "Save changes" : "Post"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function AnnouncementsView({ canPostAll = false, classOptions = [] }) {
  const me = useSelector((s) => s.auth.user);
  const [items, setItems] = useState(null);
  const [audience, setAudience] = useState("");
  const [compose, setCompose] = useState(false);
  const [edit, setEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const { data } = await api.get("/announcements", { params: audience ? { audience } : {} });
      setItems(data.announcements);
    } catch (err) {
      toast.error(apiError(err, "Could not load announcements"));
      setItems([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience]);

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.delete(`/announcements/${toDelete._id}`);
      toast.success("Announcement deleted");
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not delete this announcement"));
    } finally {
      setBusy(false);
    }
  }

  const canEdit = (a) => me?.role === "Admin" || a.createdBy?._id === me?._id || a.createdBy === me?._id;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {canPostAll ? (
          <Select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-40">
            <option value="">Any audience</option>
            <option value="All">Everyone</option>
            <option value="Class">A class</option>
            <option value="Role">A role</option>
          </Select>
        ) : <span />}
        {canPostAll || classOptions.length ? (
          <Button onClick={() => setCompose(true)}><Plus className="h-4 w-4" /> New announcement</Button>
        ) : null}
      </div>

      {items === null ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements" description="Post one to reach families or staff." />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a._id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-fg">{a.title}</h3>
                    <Badge tone="info">
                      {a.audience === "All" ? "Everyone" : a.audience === "Class" ? (a.schoolClass ? `${a.schoolClass.name} ${a.schoolClass.section || ""}`.trim() : "Class") : a.role}
                    </Badge>
                    {a.isPublic ? <Badge tone="success">Public</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {formatDate(a.createdAt)}{a.createdBy?.name ? ` · ${a.createdBy.name}` : ""}
                  </p>
                </div>
                {canEdit(a) ? (
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setEdit(a)} aria-label={`Edit ${a.title}`} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setToDelete(a)} aria-label={`Delete ${a.title}`} className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-fg">{a.body}</p>
            </div>
          ))}
        </div>
      )}

      {compose ? (
        <ComposeModal
          canPostAll={canPostAll}
          classOptions={classOptions}
          onClose={() => setCompose(false)}
          onSaved={() => { setCompose(false); load(); }}
        />
      ) : null}
      {edit ? (
        <ComposeModal
          initial={edit}
          canPostAll={canPostAll}
          classOptions={classOptions}
          onClose={() => setEdit(null)}
          onSaved={() => { setEdit(null); load(); }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Delete this announcement?"
        description={`"${toDelete?.title}" will be removed.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

export default AnnouncementsView;

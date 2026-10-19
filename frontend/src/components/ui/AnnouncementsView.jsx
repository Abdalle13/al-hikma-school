import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Filter,
  Megaphone,
  Pencil,
  Pin,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "./Button.jsx";
import { Input } from "./Input.jsx";
import { Select } from "./Select.jsx";
import { Textarea } from "./Textarea.jsx";
import { Badge } from "./Badge.jsx";
import { Spinner } from "./Spinner.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { Modal } from "./Modal.jsx";
import { ConfirmDialog } from "./ConfirmDialog.jsx";
import { Avatar } from "./Avatar.jsx";
import api, { apiError } from "../../utils/api.js";
import { formatDate } from "../../utils/formatter.js";

const ROLES = ["Admin", "Teacher", "Parent", "Student"];
const PRIORITIES = ["Normal", "Important", "Urgent"];
const CATEGORIES = ["General", "Exams", "Fees", "Holiday", "Events", "Urgent"];

const TEMPLATES = [
  {
    title: "School Fee Payment Reminder",
    category: "Fees",
    priority: "Important",
    body: "Dear Parents and Guardians,\n\nThis is a gentle reminder that tuition fees for the current term are due. Please ensure prompt settlement through the school accounts office or online banking.\n\nThank you for your continued partnership.",
  },
  {
    title: "Upcoming Mid-Term Examination Schedule",
    category: "Exams",
    priority: "Important",
    body: "Dear Students and Parents,\n\nThe mid-term examination timetable has been finalized and released. Exams will begin next week. Students are encouraged to revise diligently and arrive punctually with all required stationery.\n\nBest wishes to all students!",
  },
  {
    title: "Official Public Holiday Notice",
    category: "Holiday",
    priority: "Normal",
    body: "Dear School Community,\n\nPlease be informed that the school will remain closed this coming Thursday in observance of the public holiday. Regular classes will resume on the following school day as scheduled.\n\nHave a safe and restful break.",
  },
  {
    title: "Parent-Teacher Academic Conference",
    category: "Events",
    priority: "Normal",
    body: "Dear Parents and Guardians,\n\nYou are cordially invited to attend our Term Academic Progress Conference. This is an opportunity to discuss your child's academic development, attendance, and welfare directly with subject teachers.\n\nWe look forward to welcoming you.",
  },
  {
    title: "Urgent Weather / Safety Advisory",
    category: "Urgent",
    priority: "Urgent",
    body: "Attention Parents, Students, and Staff:\n\nDue to adverse weather forecasts and in the interest of student safety, school operations for today will dismiss early at 12:30 PM. School transport will operate accordingly.\n\nPlease take appropriate precautions.",
  },
];

function ComposeModal({ initial, canPostAll, classOptions, onClose, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const [form, setForm] = useState(
    initial
      ? {
          title: initial.title,
          body: initial.body,
          priority: initial.priority || "Normal",
          category: initial.category || "General",
          isPinned: initial.isPinned || false,
          audience: initial.audience || "All",
          schoolClass: initial.schoolClass?._id || "",
          role: initial.role || "Parent",
          isPublic: initial.isPublic || false,
        }
      : {
          title: "",
          body: "",
          priority: "Normal",
          category: "General",
          isPinned: false,
          audience: canPostAll ? "All" : "Class",
          schoolClass: classOptions[0]?._id || "",
          role: "Parent",
          isPublic: false,
        }
  );
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function applyTemplate(tpl) {
    setForm((f) => ({
      ...f,
      title: tpl.title,
      body: tpl.body,
      category: tpl.category,
      priority: tpl.priority,
    }));
    toast.success(`Loaded template: "${tpl.title}"`);
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and message body are required");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/announcements/${initial._id}`, {
          title: form.title,
          body: form.body,
          priority: form.priority,
          category: form.category,
          isPinned: form.isPinned,
          isPublic: form.isPublic,
        });
        toast.success("Announcement updated");
      } else {
        const payload = {
          title: form.title,
          body: form.body,
          priority: form.priority,
          category: form.category,
          isPinned: form.isPinned,
          audience: form.audience,
        };
        if (form.audience === "Class") payload.schoolClass = form.schoolClass;
        if (form.audience === "Role") payload.role = form.role;
        if (canPostAll) payload.isPublic = form.isPublic;
        const { data } = await api.post("/announcements", payload);
        toast.success(
          data.notificationsSent
            ? `Posted successfully! ${data.notificationsSent} notification(s) dispatched.`
            : "Announcement published"
        );
      }
      onSaved();
    } catch (err) {
      toast.error(apiError(err, "Could not save announcement"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? "Edit announcement" : "Create New Announcement"}>
      <form className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-1" onSubmit={submit} noValidate>
        {/* Quick Template Presets */}
        {!isEdit ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Quick Template Presets (Click to autofill):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="rounded-lg border border-primary/30 bg-surface px-2.5 py-1 text-xs font-medium text-fg shadow-xs transition-colors hover:border-primary hover:bg-primary/10"
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <Input
          label="Title"
          value={form.title}
          onChange={set("title")}
          placeholder="e.g. Mid-term Examination Schedule"
          required
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Priority Level" value={form.priority} onChange={set("priority")}>
            <option value="Normal">Normal (Standard Bulletin)</option>
            <option value="Important">Important (Action Needed)</option>
            <option value="Urgent">Urgent (Immediate Attention)</option>
          </Select>

          <Select label="Category" value={form.category} onChange={set("category")}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <Textarea
          label="Message Body"
          rows={5}
          value={form.body}
          onChange={set("body")}
          placeholder="Write your announcement details here..."
          required
        />

        {!isEdit ? (
          <>
            {canPostAll ? (
              <Select label="Target Audience" value={form.audience} onChange={set("audience")}>
                <option value="All">Everyone (All Families & Staff)</option>
                <option value="Class">Specific Class Section</option>
                <option value="Role">Specific Role Group</option>
              </Select>
            ) : (
              <p className="text-xs text-muted">This announcement will be posted to your assigned class.</p>
            )}

            {form.audience === "Class" ? (
              <Select label="Select Class" value={form.schoolClass} onChange={set("schoolClass")}>
                {classOptions.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.section}
                  </option>
                ))}
              </Select>
            ) : null}

            {form.audience === "Role" && canPostAll ? (
              <Select label="Select Role" value={form.role} onChange={set("role")}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}s Only
                  </option>
                ))}
              </Select>
            ) : null}
          </>
        ) : null}

        <div className="flex flex-wrap gap-4 pt-1 border-t border-border">
          <label className="flex items-center gap-2 text-xs font-medium text-fg cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm((f) => ({ ...f, isPinned: e.target.checked }))}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <Pin className="h-3.5 w-3.5 text-amber-500" />
            Pin this announcement to top of board
          </label>

          {canPostAll ? (
            <label className="flex items-center gap-2 text-xs font-medium text-fg cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Publish on public school website
            </label>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Publishing..." : isEdit ? "Save Changes" : "Publish Announcement"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AnnouncementsView({ canPostAll = false, classOptions = [] }) {
  const me = useSelector((s) => s.auth.user);
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState("");
  const [audience, setAudience] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [compose, setCompose] = useState(false);
  const [edit, setEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const params = {};
      if (audience) params.audience = audience;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get("/announcements", { params });
      setItems(data.announcements);
    } catch (err) {
      toast.error(apiError(err, "Could not load announcements"));
      setItems([]);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience, priorityFilter, categoryFilter, search]);

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

  async function togglePin(a) {
    try {
      await api.put(`/announcements/${a._id}`, { isPinned: !a.isPinned });
      toast.success(a.isPinned ? "Unpinned from top" : "Pinned to top");
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not update pin status"));
    }
  }

  const canEdit = (a) => me?.role === "Admin" || a.createdBy?._id === me?._id || a.createdBy === me?._id;

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg pl-9 pr-3 py-2 text-xs text-fg placeholder:text-muted focus:border-primary focus:outline-hidden"
            />
          </div>

          {canPostAll ? (
            <Select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-36 text-xs">
              <option value="">All Audiences</option>
              <option value="All">Everyone</option>
              <option value="Class">Class Only</option>
              <option value="Role">Role Specific</option>
            </Select>
          ) : null}

          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-32 text-xs">
            <option value="">All Priorities</option>
            <option value="Normal">Normal</option>
            <option value="Important">Important</option>
            <option value="Urgent">Urgent</option>
          </Select>

          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-32 text-xs">
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>

        {canPostAll || classOptions.length ? (
          <Button onClick={() => setCompose(true)} className="text-xs">
            <Plus className="h-4 w-4" /> New Announcement
          </Button>
        ) : null}
      </div>

      {/* Announcements List */}
      {items === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements match"
          description="Try clearing your filters or create a new announcement."
        />
      ) : (
        <div className="space-y-3.5">
          {items.map((a) => (
            <div
              key={a._id}
              className={`relative rounded-2xl border bg-surface p-5 transition-all shadow-sm ${
                a.isPinned
                  ? "border-amber-500/40 bg-amber-500/[0.02] shadow-amber-500/5 ring-1 ring-amber-500/20"
                  : a.priority === "Urgent"
                  ? "border-danger/40 bg-danger/[0.02]"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {/* Header: Title and Badges */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {a.isPinned ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        <Pin className="h-3 w-3 fill-amber-500" /> Pinned
                      </span>
                    ) : null}

                    <h3 className="font-heading text-base font-bold text-fg">{a.title}</h3>

                    {/* Priority Badge */}
                    <Badge
                      tone={
                        a.priority === "Urgent"
                          ? "danger"
                          : a.priority === "Important"
                          ? "warning"
                          : "neutral"
                      }
                      className="text-[11px]"
                    >
                      {a.priority === "Urgent" ? (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Urgent
                        </span>
                      ) : (
                        a.priority || "Normal"
                      )}
                    </Badge>

                    {/* Category */}
                    {a.category ? (
                      <Badge tone="info" className="text-[11px]">
                        {a.category}
                      </Badge>
                    ) : null}

                    {/* Audience */}
                    <Badge tone="neutral" className="text-[11px]">
                      {a.audience === "All"
                        ? "Everyone"
                        : a.audience === "Class"
                        ? a.schoolClass
                          ? `${a.schoolClass.name} ${a.schoolClass.section || ""}`.trim()
                          : "Class"
                        : `${a.role}s`}
                    </Badge>

                    {a.isPublic ? <Badge tone="success" className="text-[11px]">Public Website</Badge> : null}
                  </div>

                  <p className="flex items-center gap-2 text-xs text-muted">
                    <Avatar name={a.createdBy?.name || "Admin"} size="xs" />
                    <span>{a.createdBy?.name || "School Administrator"}</span>
                    <span>·</span>
                    <span>{formatDate(a.createdAt)}</span>
                  </p>
                </div>

                {/* Actions */}
                {canEdit(a) ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => togglePin(a)}
                      title={a.isPinned ? "Unpin notice" : "Pin notice to top"}
                      className={`rounded-lg p-2 transition-colors ${
                        a.isPinned ? "text-amber-600 bg-amber-500/10" : "text-muted hover:bg-surface-2 hover:text-fg"
                      }`}
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEdit(a)}
                      aria-label={`Edit ${a.title}`}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(a)}
                      aria-label={`Delete ${a.title}`}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Message Body */}
              <div className="mt-3.5 border-t border-border/60 pt-3">
                <p className="whitespace-pre-line text-sm leading-relaxed text-fg/90">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {compose ? (
        <ComposeModal
          canPostAll={canPostAll}
          classOptions={classOptions}
          onClose={() => setCompose(false)}
          onSaved={() => {
            setCompose(false);
            load();
          }}
        />
      ) : null}

      {edit ? (
        <ComposeModal
          initial={edit}
          canPostAll={canPostAll}
          classOptions={classOptions}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            load();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Delete announcement?"
        description={`"${toDelete?.title}" will be permanently removed.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

export default AnnouncementsView;

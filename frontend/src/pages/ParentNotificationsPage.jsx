import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BellOff } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { cn } from "../utils/formatter.js";
import api, { apiError } from "../utils/api.js";
import { formatDate } from "../utils/formatter.js";

const relTone = { attendance: "warning", fee: "info", announcement: "neutral", account: "neutral" };

export default function ParentNotificationsPage() {
  const [items, setItems] = useState(null);
  const [unread, setUnread] = useState(0);

  async function load() {
    try {
      const { data } = await api.get("/notifications", { params: { limit: 50 } });
      setItems(data.notifications);
      setUnread(data.unread);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markAll() {
    try {
      await api.patch("/notifications/read-all");
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not update"));
    }
  }

  async function markOne(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((p) => p.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <PageHeader
        title="Messages"
        description={unread ? `${unread} unread` : "All caught up"}
        action={
          unread ? (
            <Button size="sm" variant="outline" onClick={markAll}>
              Mark all read
            </Button>
          ) : null
        }
      />

      {items === null ? (
        <div className="grid place-items-center py-12"><Spinner /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={BellOff} title="No messages" description="Absence alerts, payment confirmations and school announcements arrive here." />
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n._id}
              onClick={() => !n.readAt && markOne(n._id)}
              className={cn(
                "rounded-2xl border p-4",
                n.readAt ? "border-border bg-surface" : "cursor-pointer border-primary/30 bg-primary/5"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <Badge tone={relTone[n.relatedTo] || "neutral"}>{n.relatedTo || "message"}</Badge>
                <span className="text-xs text-muted">{formatDate(n.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-fg">{n.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

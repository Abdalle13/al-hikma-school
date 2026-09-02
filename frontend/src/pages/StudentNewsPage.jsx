import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import api from "../utils/api.js";
import { formatDate } from "../utils/formatter.js";

export default function StudentNewsPage() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get("/announcements").then(({ data }) => setItems(data.announcements)).catch(() => setItems([]));
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-fg">Announcements</h1>
      <p className="mb-5 text-sm text-muted">News and notices from your school and class.</p>

      {items === null ? (
        <div className="grid place-items-center py-12"><Spinner /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nothing yet" description="School announcements will show here." />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a._id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-fg">{a.title}</h3>
                {a.audience === "Class" && a.schoolClass ? (
                  <Badge tone="info">{a.schoolClass.name} {a.schoolClass.section}</Badge>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-muted">{formatDate(a.createdAt)}</p>
              <p className="mt-2 whitespace-pre-line text-sm text-fg">{a.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

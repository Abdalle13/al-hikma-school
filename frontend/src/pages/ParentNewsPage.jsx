import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import api from "../utils/api.js";
import { formatDate } from "../utils/formatter.js";

export default function ParentNewsPage() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api.get("/announcements").then(({ data }) => setItems(data.announcements)).catch(() => setItems([]));
  }, []);

  return (
    <div>
      <PageHeader title="Announcements" description="Messages from the school for your family." />

      {items === null ? (
        <div className="grid place-items-center py-12"><Spinner /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nothing yet" description="School announcements will show here." />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a._id}>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading text-sm font-bold text-fg">{a.title}</h3>
                {a.audience === "Class" && a.schoolClass ? (
                  <Badge tone="info">{a.schoolClass.name} {a.schoolClass.section}</Badge>
                ) : null}
                <span className="ml-auto text-xs text-muted">{formatDate(a.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{a.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

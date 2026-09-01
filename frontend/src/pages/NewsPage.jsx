import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Newspaper } from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { Section } from "../components/ui/Section.jsx";
import { SectionHeading } from "../components/ui/SectionHeading.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { FadeIn } from "../components/ui/FadeIn.jsx";
import api from "../utils/api.js";
import { formatDate } from "../utils/formatter.js";

export default function NewsPage() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let alive = true;
    api
      .get("/announcements/public")
      .then(({ data }) => alive && setItems(data.announcements))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Section>
      <SectionHeading
        eyebrow="News and events"
        title="From the school"
        lead="Announcements the school has shared publicly."
      />

      <div className="mt-10">
        {items === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="No news yet"
            description="When the school publishes an announcement it will appear here."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((n, i) => (
              <FadeIn key={n._id} delay={Math.min(i * 0.04, 0.24)}>
                <Card className="flex h-full flex-col transition-colors hover:border-primary/40">
                  <p className="text-xs font-medium text-muted">{formatDate(n.createdAt)}</p>
                  <h2 className="mt-2 text-base font-bold text-fg">{n.title}</h2>
                  <p className="mt-1 line-clamp-4 text-sm text-muted">{n.body}</p>
                  <Link
                    to={`/news/${n._id}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2"
                  >
                    Read more <ArrowRight className="h-4 w-4 transition-all" />
                  </Link>
                </Card>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

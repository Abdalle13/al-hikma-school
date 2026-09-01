import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Section } from "../components/ui/Section.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Button } from "../components/ui/Button.jsx";
import api from "../utils/api.js";
import { formatDate } from "../utils/formatter.js";

export default function NewsArticlePage() {
  const { id } = useParams();
  const [state, setState] = useState({ status: "loading", article: null });

  useEffect(() => {
    let alive = true;
    setState({ status: "loading", article: null });
    api
      .get(`/announcements/public/${id}`)
      .then(({ data }) => alive && setState({ status: "ok", article: data.announcement }))
      .catch(() => alive && setState({ status: "notfound", article: null }));
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <Section innerClassName="max-w-[760px]">
      <Link to="/news" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2">
        <ArrowLeft className="h-4 w-4 transition-all" /> All news
      </Link>

      {state.status === "loading" ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : state.status === "notfound" ? (
        <div className="mt-10">
          <EmptyState
            title="Article not found"
            description="It may have been removed or is no longer public."
            action={<Button as={Link} to="/news">Back to news</Button>}
          />
        </div>
      ) : (
        <article className="mt-6">
          <p className="text-sm font-medium text-muted">{formatDate(state.article.createdAt)}</p>
          <h1 className="mt-2 text-2xl font-bold text-fg sm:text-3xl">{state.article.title}</h1>
          <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-fg sm:text-base">
            {state.article.body}
          </div>
        </article>
      )}
    </Section>
  );
}

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Card } from "./Card.jsx";
import { Badge } from "./Badge.jsx";
import { Spinner } from "./Spinner.jsx";
import { EmptyState } from "./EmptyState.jsx";
import { ReportCardDetail } from "./ReportCardDetail.jsx";
import api from "../../utils/api.js";

export function StudentGradesView({ studentId }) {
  const [cards, setCards] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    let alive = true;
    setCards(null);
    api
      .get(`/report-cards/student/${studentId}`)
      .then(({ data }) => {
        if (!alive) return;
        setCards(data.reportCards);
        if (data.reportCards[0]) setOpenId(data.reportCards[0]._id);
      })
      .catch(() => alive && setCards([]));
    return () => {
      alive = false;
    };
  }, [studentId]);

  if (cards === null) {
    return <div className="grid place-items-center py-12"><Spinner /></div>;
  }
  if (cards.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No report card yet"
        description="A report card appears here once the school publishes it for the term."
      />
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((c) => (
        <Card key={c._id} className="p-0">
          <button
            type="button"
            onClick={() => setOpenId(openId === c._id ? null : c._id)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <span>
              <span className="font-semibold text-fg">{c.term?.name}</span>
              <span className="ml-2 text-sm text-muted">{c.term?.academicYear}</span>
            </span>
            <Badge tone="neutral">Avg {c.average}% · {c.overallGrade}</Badge>
          </button>
          {openId === c._id ? (
            <div className="border-t border-border p-5">
              <ReportCardDetail card={c} />
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}

export default StudentGradesView;

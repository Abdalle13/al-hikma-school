import { useState } from "react";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import { Button } from "./Button.jsx";
import { Badge } from "./Badge.jsx";
import { downloadFile, apiError } from "../../utils/api.js";

const gradeTone = { A: "success", B: "success", C: "info", D: "warning", F: "danger" };
const divisionTone = { First: "success", Second: "info", Third: "warning" };

export function ReportCardDetail({ card }) {
  const [downloading, setDownloading] = useState(false);

  async function pdf() {
    setDownloading(true);
    try {
      await downloadFile(`/report-cards/${card._id}/pdf`, `report-card-${card.student?.admissionNo || card._id}.pdf`);
    } catch (err) {
      toast.error(apiError(err, "Could not download the PDF"));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">Average {card.average}%</Badge>
          <Badge tone={gradeTone[card.overallGrade] || "neutral"}>Grade {card.overallGrade}</Badge>
          <Badge tone={divisionTone[card.division] || "neutral"}>{card.division} division</Badge>
          <Badge tone="neutral">Position {card.position} of {card.totalStudents}</Badge>
          {card.published ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge>}
        </div>
        <Button size="sm" variant="outline" onClick={pdf} disabled={downloading}>
          <Download className="h-4 w-4" /> {downloading ? "Preparing..." : "PDF"}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="bg-surface-2 text-left text-muted">
              <th className="px-4 py-2.5 font-medium">Subject</th>
              <th className="px-4 py-2.5 font-medium">Score</th>
              <th className="px-4 py-2.5 font-medium">%</th>
              <th className="px-4 py-2.5 font-medium">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {card.subjects.map((s) => (
              <tr key={s.subjectCode || s.subjectName} className="bg-surface">
                <td className="px-4 py-2.5 text-fg">{s.subjectName}</td>
                <td className="px-4 py-2.5 text-muted tabular-nums">{s.score} / {s.max}</td>
                <td className="px-4 py-2.5 text-muted tabular-nums">{s.percentage}%</td>
                <td className="px-4 py-2.5"><Badge tone={gradeTone[s.grade] || "neutral"}>{s.grade}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {card.remark ? (
        <div className="rounded-2xl border border-border bg-surface-2 p-4 text-sm">
          <p className="text-xs font-medium text-muted">Teacher remark</p>
          <p className="mt-1 text-fg">{card.remark}</p>
        </div>
      ) : null}
    </div>
  );
}

export default ReportCardDetail;

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { GraduationCap, RefreshCw, Printer, Search, Award, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Textarea } from "../components/ui/Textarea.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { ReportCardDetail } from "../components/ui/ReportCardDetail.jsx";
import api, { apiError } from "../utils/api.js";

const gradeTone = { A: "success", B: "success", C: "info", D: "warning", F: "danger" };

function DetailModal({ card, onClose, onChanged }) {
  const [remark, setRemark] = useState(card.remark || "");
  const [busy, setBusy] = useState(false);
  const [published, setPublished] = useState(card.published);

  async function saveRemark() {
    setBusy(true);
    try {
      await api.put(`/report-cards/${card._id}`, { remark });
      toast.success("Teacher remark saved");
      onChanged();
    } catch (err) {
      toast.error(apiError(err, "Could not save the remark"));
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish() {
    setBusy(true);
    try {
      await api.patch(`/report-cards/${card._id}/${published ? "unpublish" : "publish"}`);
      setPublished(!published);
      toast.success(published ? "Unpublished from parents" : "Published to student and parents");
      onChanged();
    } catch (err) {
      toast.error(apiError(err, "Could not change the publish state"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Report Card · ${card.student?.name}`} className="max-w-2xl">
      <ReportCardDetail card={{ ...card, published }} />
      <div className="mt-5 space-y-3 border-t border-border pt-4">
        <Textarea
          label="Principal / Head Teacher Remark"
          rows={2}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="e.g. Excellent academic progress this term. Well done!"
        />
        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print Report Card
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={togglePublish} disabled={busy}>
              {published ? "Unpublish from Portal" : "Publish to Parents"}
            </Button>
            <Button onClick={saveRemark} disabled={busy}>
              Save Remark
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminReportCardsPage() {
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [term, setTerm] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [cards, setCards] = useState(null);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    api.get("/terms").then(({ data }) => {
      setTerms(data.terms);
      setTerm(data.terms.find((t) => t.isActive)?._id || data.terms[0]?._id || "");
    });
    api.get("/classes").then(({ data }) => {
      setClasses(data.classes);
      setSchoolClass(data.classes[0]?._id || "");
    });
  }, []);

  async function load() {
    if (!term || !schoolClass) return;
    setCards(null);
    try {
      const { data } = await api.get("/report-cards", { params: { term, schoolClass } });
      setCards(data.reportCards);
    } catch (err) {
      toast.error(apiError(err, "Could not load report cards"));
      setCards([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, schoolClass]);

  async function generate() {
    setBusy(true);
    try {
      const { data } = await api.post("/report-cards/generate", { term, schoolClass });
      toast.success(data.message);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not generate report cards"));
    } finally {
      setBusy(false);
    }
  }

  async function bulkPublish(published) {
    setBusy(true);
    try {
      const { data } = await api.patch("/report-cards/publish", { term, schoolClass, published });
      toast.success(`${data.updated} report card(s) ${published ? "published" : "unpublished"}`);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not update publication state"));
    } finally {
      setBusy(false);
    }
  }

  // Class Statistics
  const stats = useMemo(() => {
    if (!cards || !cards.length) return null;
    const total = cards.length;
    const avg = Math.round((cards.reduce((sum, c) => sum + (c.average || 0), 0) / total) * 10) / 10;
    const top = cards.slice().sort((a, b) => (b.average || 0) - (a.average || 0))[0];
    const passCount = cards.filter((c) => c.overallGrade !== "F").length;
    const passRate = Math.round((passCount / total) * 100);
    const publishedCount = cards.filter((c) => c.published).length;
    return { total, avg, top, passRate, publishedCount };
  }, [cards]);

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    return cards.filter((c) => {
      if (search && !c.student?.name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (gradeFilter && c.overallGrade !== gradeFilter) return false;
      return true;
    });
  }, [cards, search, gradeFilter]);

  return (
    <div>
      <PageHeader
        title="Report Cards"
        description="Compute final term grades, rankings, positions, and teacher remarks. Publish official academic report cards for parents."
      />

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4">
        <Select label="Term" value={term} onChange={(e) => setTerm(e.target.value)} className="min-w-[11rem]">
          {terms.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} ({t.academicYear})
            </option>
          ))}
        </Select>
        <Select label="Class" value={schoolClass} onChange={(e) => setSchoolClass(e.target.value)} className="min-w-[11rem]">
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} {c.section}
            </option>
          ))}
        </Select>
        <Button onClick={generate} disabled={busy || !term || !schoolClass}>
          <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Generate / Re-calculate
        </Button>
      </div>

      {/* Class Academic Summary Cards */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface p-3.5">
            <p className="text-[11px] text-muted flex items-center gap-1.5 font-medium">
              <Users className="h-3.5 w-3.5 text-primary" /> Class Size
            </p>
            <p className="text-lg font-bold text-fg tabular-nums mt-0.5">{stats.total} Students</p>
            <p className="text-[11px] text-muted">{stats.publishedCount} Published</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-3.5">
            <p className="text-[11px] text-muted flex items-center gap-1.5 font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-info" /> Class Average
            </p>
            <p className="text-lg font-bold text-info tabular-nums mt-0.5">{stats.avg}%</p>
            <p className="text-[11px] text-muted">Pass Rate: {stats.passRate}%</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-3.5">
            <p className="text-[11px] text-muted flex items-center gap-1.5 font-medium">
              <Award className="h-3.5 w-3.5 text-success" /> Top Student (1st)
            </p>
            <p className="text-sm font-bold text-fg truncate mt-0.5">{stats.top?.student?.name || "—"}</p>
            <p className="text-[11px] text-success font-semibold tabular-nums">{stats.top?.average}% (Grade {stats.top?.overallGrade})</p>
          </div>
          <div className="flex flex-col justify-center gap-1.5 rounded-2xl border border-border bg-surface p-3.5">
            <Button size="sm" variant="outline" onClick={() => bulkPublish(true)} disabled={busy}>
              Publish All to Parents
            </Button>
            <Button size="sm" variant="ghost" onClick={() => bulkPublish(false)} disabled={busy}>
              Unpublish All
            </Button>
          </div>
        </div>
      )}

      {/* Search and Grade Filter */}
      {cards && cards.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 text-xs"
          />
          <Select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-32"
          >
            <option value="">All Grades</option>
            <option value="A">Grade A</option>
            <option value="B">Grade B</option>
            <option value="C">Grade C</option>
            <option value="D">Grade D</option>
            <option value="F">Grade F</option>
          </Select>
        </div>
      )}

      {cards === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : filteredCards.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={cards.length === 0 ? "No report cards generated yet" : "No matching student report cards"}
          description={
            cards.length === 0
              ? "Ensure exam marks have been entered for this class and term, then click 'Generate / Re-calculate'."
              : "Try adjusting your search or grade filter."
          }
        />
      ) : (
        <Table headers={["Rank", "Student Name", "Average Score", "Final Grade", "Division", "Status", ""]}>
          {filteredCards.map((c) => (
            <Table.Row key={c._id}>
              <Table.Cell className="tabular-nums font-bold text-fg">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-surface-2 text-xs">
                  #{c.position}
                </span>
              </Table.Cell>
              <Table.Cell className="font-semibold text-fg">{c.student?.name}</Table.Cell>
              <Table.Cell className="tabular-nums font-medium text-fg">
                {c.average}%
              </Table.Cell>
              <Table.Cell>
                <Badge tone={gradeTone[c.overallGrade] || "neutral"}>
                  Grade {c.overallGrade}
                </Badge>
              </Table.Cell>
              <Table.Cell className="text-muted text-xs">{c.division || "—"}</Table.Cell>
              <Table.Cell>
                {c.published ? (
                  <Badge tone="success">Published</Badge>
                ) : (
                  <Badge tone="warning">Draft</Badge>
                )}
              </Table.Cell>
              <Table.Cell>
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="outline" onClick={() => setDetail(c)}>
                    View Card
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>
      )}

      {detail ? (
        <DetailModal card={detail} onClose={() => setDetail(null)} onChanged={load} />
      ) : null}
    </div>
  );
}

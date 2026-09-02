import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GraduationCap, RefreshCw } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Select } from "../components/ui/Select.jsx";
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
      toast.success("Remark saved");
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
      toast.success(published ? "Unpublished" : "Published");
      onChanged();
    } catch (err) {
      toast.error(apiError(err, "Could not change the publish state"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={card.student?.name} className="max-w-2xl">
      <ReportCardDetail card={{ ...card, published }} />
      <div className="mt-5">
        <Textarea label="Teacher remark" rows={2} value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Enter a remark for this student (optional)" />
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" onClick={togglePublish} disabled={busy}>
            {published ? "Unpublish" : "Publish"}
          </Button>
          <Button onClick={saveRemark} disabled={busy}>Save remark</Button>
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
      toast.error(apiError(err, "Could not update"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Report cards"
        description="Generate report cards from the entered marks, add remarks, then publish them for parents."
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Select label="Term" value={term} onChange={(e) => setTerm(e.target.value)} className="min-w-[10rem]">
          {terms.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.academicYear})</option>)}
        </Select>
        <Select label="Class" value={schoolClass} onChange={(e) => setSchoolClass(e.target.value)} className="min-w-[10rem]">
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </Select>
        <Button onClick={generate} disabled={busy || !term || !schoolClass}>
          <RefreshCw className="h-4 w-4" /> Generate
        </Button>
      </div>

      {cards === null ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : cards.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No report cards for this selection"
          description="Enter exam marks for this class and term, then press Generate."
        />
      ) : (
        <>
          <div className="mb-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => bulkPublish(true)} disabled={busy}>Publish all</Button>
            <Button size="sm" variant="outline" onClick={() => bulkPublish(false)} disabled={busy}>Unpublish all</Button>
          </div>
          <Table headers={["Position", "Student", "Average", "Grade", "Division", "Status", ""]}>
            {cards.map((c) => (
              <Table.Row key={c._id}>
                <Table.Cell className="tabular-nums font-medium">{c.position}</Table.Cell>
                <Table.Cell>{c.student?.name}</Table.Cell>
                <Table.Cell className="tabular-nums text-muted">{c.average}%</Table.Cell>
                <Table.Cell><Badge tone={gradeTone[c.overallGrade] || "neutral"}>{c.overallGrade}</Badge></Table.Cell>
                <Table.Cell className="text-muted">{c.division}</Table.Cell>
                <Table.Cell>
                  {c.published ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge>}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => setDetail(c)}>View</Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table>
        </>
      )}

      {detail ? (
        <DetailModal card={detail} onClose={() => setDetail(null)} onChanged={load} />
      ) : null}
    </div>
  );
}

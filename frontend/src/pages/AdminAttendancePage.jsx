import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarX, Eye, Trash2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Tabs } from "../components/ui/Tabs.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { AttendanceMarker } from "../components/ui/AttendanceMarker.jsx";
import api, { apiError } from "../utils/api.js";
import { formatDate } from "../utils/formatter.js";

const tone = { Present: "success", Absent: "danger", Late: "warning", Excused: "info" };

function tally(records) {
  const c = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
  records.forEach((r) => (c[r.status] += 1));
  return c;
}

function Records({ classes }) {
  const [classId, setClassId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState(null);
  const [view, setView] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setRows(null);
    try {
      const { data } = await api.get("/attendance", {
        params: {
          schoolClass: classId || undefined,
          dateFrom: from || undefined,
          dateTo: to || undefined,
        },
      });
      setRows(data.attendance);
    } catch (err) {
      toast.error(apiError(err, "Could not load records"));
      setRows([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, from, to]);

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.delete(`/attendance/${toDelete._id}`);
      toast.success("Record deleted");
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not delete this record"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="min-w-[10rem]">
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name} {c.section}</option>
          ))}
        </Select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} label="From" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} label="To" />
      </div>

      {rows === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={CalendarX} title="No records" description="Nothing matches these filters yet." />
      ) : (
        <Table headers={["Date", "Class", "Marked by", "Summary", ""]}>
          {rows.map((r) => {
            const c = tally(r.records);
            return (
              <Table.Row key={r._id}>
                <Table.Cell className="font-medium">{formatDate(r.date)}</Table.Cell>
                <Table.Cell className="text-muted">{r.schoolClass?.name} {r.schoolClass?.section}</Table.Cell>
                <Table.Cell className="text-muted">{r.markedBy?.name || "-"}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2 text-xs">
                    <span className="text-success">{c.Present}P</span>
                    <span className="text-danger">{c.Absent}A</span>
                    <span className="text-warning">{c.Late}L</span>
                    <span className="text-primary">{c.Excused}E</span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setView(r)}
                      aria-label="View details"
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(r)}
                      aria-label="Delete record"
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table>
      )}

      <Modal
        open={Boolean(view)}
        onClose={() => setView(null)}
        title={view ? `${view.schoolClass?.name} ${view.schoolClass?.section || ""} · ${formatDate(view.date)}` : ""}
      >
        {view ? (
          <ul className="divide-y divide-border rounded-2xl border border-border">
            {view.records.map((rec) => (
              <li key={rec.student?._id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-fg">{rec.student?.name}</span>
                <Badge tone={tone[rec.status]}>{rec.status}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Delete this attendance record?"
        description={toDelete ? `${toDelete.schoolClass?.name} on ${formatDate(toDelete.date)} will be removed.` : ""}
        confirmLabel="Delete"
      />
    </div>
  );
}

export default function AdminAttendancePage() {
  const [tab, setTab] = useState("records");
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    api.get("/classes").then(({ data }) => setClasses(data.classes)).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Attendance" description="Browse the register and take attendance for any class." />

      <Tabs
        className="mb-6"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "records", label: "Records" },
          { value: "take", label: "Take register" },
        ]}
      />

      {tab === "records" ? (
        <Records classes={classes} />
      ) : classes.length === 0 ? (
        <EmptyState title="No classes yet" description="Add a class first." />
      ) : (
        <AttendanceMarker classes={classes} />
      )}
    </div>
  );
}

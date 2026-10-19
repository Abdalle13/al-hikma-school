import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Inbox, MessageSquare, Megaphone, Smartphone } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Tabs } from "../components/ui/Tabs.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Pagination } from "../components/ui/Pagination.jsx";
import { AnnouncementsView } from "../components/ui/AnnouncementsView.jsx";
import api, { apiError } from "../utils/api.js";
import { formatDate } from "../utils/formatter.js";

const channelLabel = { whatsapp: "WhatsApp", sms: "SMS", email: "Email" };

function MessageLog() {
  const [data, setData] = useState(null);
  const [relatedTo, setRelatedTo] = useState("");
  const [channel, setChannel] = useState("");
  const [page, setPage] = useState(1);

  async function load() {
    setData(null);
    try {
      const res = await api.get("/notifications", {
        params: { relatedTo: relatedTo || undefined, channel: channel || undefined, page, limit: 20 },
      });
      setData(res.data);
    } catch (err) {
      toast.error(apiError(err, "Could not load message log"));
      setData({ notifications: [], pages: 1 });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatedTo, channel, page]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-fg">Family Dispatch History</span>
            <span className="text-xs text-muted">· Simulated WhatsApp and SMS notification records</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Select
              value={relatedTo}
              onChange={(e) => {
                setPage(1);
                setRelatedTo(e.target.value);
              }}
              className="w-40 text-xs"
            >
              <option value="">Any notice type</option>
              <option value="attendance">Attendance Alert</option>
              <option value="fee">Fee Reminder</option>
              <option value="announcement">Announcement</option>
              <option value="account">Account Details</option>
            </Select>

            <Select
              value={channel}
              onChange={(e) => {
                setPage(1);
                setChannel(e.target.value);
              }}
              className="w-36 text-xs"
            >
              <option value="">All Channels</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </Select>
          </div>
        </div>
      </div>

      {data === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : data.notifications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No notification records yet"
          description="Attendance absence alerts, fee invoices, and announcements sent to families appear here."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
          <Table headers={["Timestamp", "Recipient Parent", "Channel", "Type", "Dispatched Message Content"]}>
            {data.notifications.map((n) => (
              <Table.Row key={n._id}>
                <Table.Cell className="whitespace-nowrap text-xs text-muted">{formatDate(n.createdAt)}</Table.Cell>
                <Table.Cell className="font-medium text-xs text-fg">{n.to?.name || "Parent"}</Table.Cell>
                <Table.Cell>
                  <Badge tone={n.channel === "whatsapp" ? "success" : "info"} className="text-[10px]">
                    {channelLabel[n.channel] || n.channel}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="capitalize text-xs text-muted">{n.relatedTo || "Notice"}</Table.Cell>
                <Table.Cell className="max-w-lg text-xs text-fg font-mono leading-relaxed">{n.content}</Table.Cell>
              </Table.Row>
            ))}
          </Table>
          <div className="p-3 border-t border-border">
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAnnouncementsPage() {
  const [tab, setTab] = useState("announcements");
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    api
      .get("/classes")
      .then(({ data }) => setClasses(data.classes || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Notice Board & Announcements"
        description="Broadcast official bulletins, urgent alerts, and notifications to students, parents, and faculty."
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "announcements", label: "Notice Board & Bulletins" },
          { value: "log", label: "Family Message Log (WhatsApp / SMS)" },
        ]}
      />

      {tab === "announcements" ? (
        <AnnouncementsView canPostAll classOptions={classes} />
      ) : (
        <MessageLog />
      )}
    </div>
  );
}

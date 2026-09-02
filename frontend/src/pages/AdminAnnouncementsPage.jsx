import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Inbox } from "lucide-react";
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
      toast.error(apiError(err, "Could not load the message log"));
      setData({ notifications: [], pages: 1 });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatedTo, channel, page]);

  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        Everything the school has sent to families through the simulated SMS and WhatsApp channel.
        Nothing is really delivered to a phone.
      </p>
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={relatedTo} onChange={(e) => { setPage(1); setRelatedTo(e.target.value); }} className="w-44">
          <option value="">Any type</option>
          <option value="attendance">Attendance</option>
          <option value="fee">Fees</option>
          <option value="announcement">Announcements</option>
          <option value="account">Account</option>
        </Select>
        <Select value={channel} onChange={(e) => { setPage(1); setChannel(e.target.value); }} className="w-36">
          <option value="">Any channel</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
        </Select>
      </div>

      {data === null ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : data.notifications.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing sent yet" description="Absence alerts, payment confirmations and announcements show here." />
      ) : (
        <>
          <Table headers={["Sent", "To", "Channel", "Type", "Message"]}>
            {data.notifications.map((n) => (
              <Table.Row key={n._id}>
                <Table.Cell className="whitespace-nowrap text-muted">{formatDate(n.createdAt)}</Table.Cell>
                <Table.Cell className="text-muted">{n.to?.name || "-"}</Table.Cell>
                <Table.Cell><Badge tone="neutral">{channelLabel[n.channel] || n.channel}</Badge></Table.Cell>
                <Table.Cell className="text-muted">{n.relatedTo || "-"}</Table.Cell>
                <Table.Cell className="max-w-md text-fg">{n.content}</Table.Cell>
              </Table.Row>
            ))}
          </Table>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function AdminAnnouncementsPage() {
  const [tab, setTab] = useState("announcements");
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    api.get("/classes").then(({ data }) => setClasses(data.classes)).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Announcements" description="Post to families or staff, and see the message log." />
      <Tabs
        className="mb-6"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "announcements", label: "Announcements" },
          { value: "log", label: "Message log" },
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

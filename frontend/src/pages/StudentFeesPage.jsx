import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Wallet } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { InvoiceDetail } from "../components/ui/InvoiceDetail.jsx";
import api from "../utils/api.js";
import { formatCurrency } from "../utils/formatter.js";

const statusTone = { Unpaid: "danger", Partial: "warning", Paid: "success" };

export default function StudentFeesPage() {
  const me = useSelector((s) => s.auth.user);
  const currency = useSelector((s) => s.settings.data.currency) || "USD";
  const [invoices, setInvoices] = useState(null);
  const [totals, setTotals] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!me?._id) return;
    let alive = true;
    api
      .get("/invoices", { params: { student: me._id } })
      .then(({ data }) => {
        if (!alive) return;
        setInvoices(data.invoices);
        setTotals(data.totals);
        const due = data.invoices.find((i) => i.status !== "Paid");
        if (due) setOpenId(due._id);
      })
      .catch(() => alive && setInvoices([]));
    return () => {
      alive = false;
    };
  }, [me?._id]);

  return (
    <div>
      <PageHeader title="Fees" description="What is billed and paid for this term, invoice by invoice." />

      {invoices === null ? (
        <div className="grid place-items-center py-12"><Spinner /></div>
      ) : invoices.length === 0 ? (
        <EmptyState icon={Wallet} title="No invoices yet" description="Fee invoices will appear here once the school issues them." />
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total billed" value={formatCurrency(totals.billed, currency)} icon={Wallet} />
            <StatCard label="Paid so far" value={formatCurrency(totals.paid, currency)} icon={Wallet} />
            <StatCard
              label="Balance owed"
              value={formatCurrency(totals.outstanding, currency)}
              icon={Wallet}
              hint={totals.outstanding === 0 ? "Nothing outstanding" : "Ask a parent to pay this"}
            />
          </div>

          <div className="space-y-3">
            {invoices.map((inv) => (
              <Card key={inv._id} className="p-0">
                <button
                  type="button"
                  onClick={() => setOpenId(openId === inv._id ? null : inv._id)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <span>
                    <p className="font-semibold text-fg">{inv.term?.name}</p>
                    <p className="text-sm text-muted">
                      Balance <span className="tabular-nums">{formatCurrency(inv.balance, currency)}</span> of {formatCurrency(inv.total, currency)}
                    </p>
                  </span>
                  <Badge tone={statusTone[inv.status]}>{inv.status}</Badge>
                </button>
                {openId === inv._id ? (
                  <div className="border-t border-border p-5">
                    <InvoiceDetail invoice={inv} />
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import { Wallet } from "lucide-react";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { InvoiceDetail } from "../components/ui/InvoiceDetail.jsx";
import { PayModal } from "../components/ui/PayModal.jsx";
import api from "../utils/api.js";
import { formatCurrency } from "../utils/formatter.js";

const statusTone = { Unpaid: "danger", Partial: "warning", Paid: "success" };

export default function ParentFeesPage() {
  const { selectedChild } = useOutletContext();
  const currency = useSelector((s) => s.settings.data.currency) || "USD";
  const [invoices, setInvoices] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [payFor, setPayFor] = useState(null);

  async function load() {
    if (!selectedChild) return;
    setInvoices(null);
    try {
      const { data } = await api.get("/invoices", { params: { student: selectedChild._id } });
      setInvoices(data.invoices);
    } catch {
      setInvoices([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChild?._id]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-fg">Fees</h1>
      <p className="mb-5 text-sm text-muted">{selectedChild ? selectedChild.name : "Select a child"}</p>

      {invoices === null ? (
        <div className="grid place-items-center py-12"><Spinner /></div>
      ) : invoices.length === 0 ? (
        <EmptyState icon={Wallet} title="No invoices yet" description="Fee invoices for this child will appear here each term." />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv._id} className="p-0">
              <div className="flex items-center justify-between px-5 py-4">
                <button type="button" onClick={() => setOpenId(openId === inv._id ? null : inv._id)} className="text-left">
                  <p className="font-semibold text-fg">{inv.term?.name}</p>
                  <p className="text-sm text-muted">
                    Balance <span className="tabular-nums">{formatCurrency(inv.balance, currency)}</span> of {formatCurrency(inv.total, currency)}
                  </p>
                </button>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone[inv.status]}>{inv.status}</Badge>
                  {inv.status !== "Paid" ? (
                    <Button size="sm" onClick={() => setPayFor(inv)}>Pay</Button>
                  ) : null}
                </div>
              </div>
              {openId === inv._id ? (
                <div className="border-t border-border p-5">
                  <InvoiceDetail invoice={inv} />
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      {payFor ? (
        <PayModal
          invoice={payFor}
          onClose={() => setPayFor(null)}
          onPaid={() => { setPayFor(null); load(); }}
        />
      ) : null}
    </div>
  );
}

import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import { Badge } from "./Badge.jsx";
import { Button } from "./Button.jsx";
import { downloadFile, apiError } from "../../utils/api.js";
import { formatCurrency, formatDate } from "../../utils/formatter.js";

const statusTone = { Unpaid: "danger", Partial: "warning", Paid: "success" };
const methodLabel = { evc: "EVC Plus", zaad: "Zaad", cash: "Cash" };

export function InvoiceDetail({ invoice }) {
  const currency = useSelector((s) => s.settings.data.currency) || "USD";
  const [downloading, setDownloading] = useState(null);
  const money = (n) => formatCurrency(n, currency);

  async function receipt(idx) {
    setDownloading(idx);
    try {
      await downloadFile(
        `/invoices/${invoice._id}/receipt?payment=${idx}`,
        `receipt-${invoice.student?.admissionNo || invoice._id}-${idx + 1}.pdf`
      );
    } catch (err) {
      toast.error(apiError(err, "Could not download the receipt"));
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted">
          {invoice.term?.name} · {invoice.schoolClass?.name} {invoice.schoolClass?.section}
          {invoice.dueDate ? <> · due {formatDate(invoice.dueDate)}</> : null}
        </div>
        <Badge tone={statusTone[invoice.status]}>{invoice.status}</Badge>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {invoice.lineItems.map((li, i) => (
              <tr key={i} className="bg-surface">
                <td className="px-4 py-2.5 text-fg">{li.label}</td>
                <td className="px-4 py-2.5 text-right text-muted tabular-nums">{money(li.amount)}</td>
              </tr>
            ))}
            <tr className="bg-surface-2 font-semibold">
              <td className="px-4 py-2.5 text-fg">Total</td>
              <td className="px-4 py-2.5 text-right text-fg tabular-nums">{money(invoice.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Paid</p>
          <p className="mt-1 text-lg font-bold text-fg tabular-nums">{money(invoice.amountPaid)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Balance</p>
          <p className="mt-1 text-lg font-bold text-fg tabular-nums">{money(invoice.balance)}</p>
        </div>
      </div>

      {invoice.installmentPlan?.enabled ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-fg">Installment plan</p>
          <ul className="divide-y divide-border rounded-2xl border border-border">
            {invoice.installmentPlan.installments.map((inst, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-fg">
                  {money(inst.amount)} <span className="text-muted">by {formatDate(inst.dueDate)}</span>
                </span>
                {inst.paid ? <Badge tone="success">Paid</Badge> : <Badge tone="warning">Due</Badge>}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-sm font-semibold text-fg">Payments</p>
        {invoice.payments.length === 0 ? (
          <p className="text-sm text-muted">No payments yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border">
            {invoice.payments.map((p, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span>
                  <span className="font-medium text-fg tabular-nums">{money(p.amount)}</span>
                  <span className="text-muted"> · {methodLabel[p.method] || p.method} · {formatDate(p.date)}</span>
                  {p.reference ? <span className="block text-xs text-muted">{p.reference}</span> : null}
                </span>
                <Button size="sm" variant="outline" onClick={() => receipt(i)} disabled={downloading === i}>
                  <Download className="h-4 w-4" /> {downloading === i ? "..." : "Receipt"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default InvoiceDetail;

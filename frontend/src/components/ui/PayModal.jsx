import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Smartphone } from "lucide-react";
import { Modal } from "./Modal.jsx";
import { Input } from "./Input.jsx";
import { Select } from "./Select.jsx";
import { Button } from "./Button.jsx";
import api, { apiError } from "../../utils/api.js";
import { formatCurrency } from "../../utils/formatter.js";

// the simulated EVC Plus / Zaad payment. a valid Somali number plus the demo
// PIN 1234 approves, anything else fails. no real money moves.
export function PayModal({ invoice, onClose, onPaid }) {
  const currency = useSelector((s) => s.settings.data.currency) || "USD";
  const [amount, setAmount] = useState(String(invoice.balance));
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [method, setMethod] = useState("evc");
  const [paying, setPaying] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const a = Number(amount);
    if (!(a > 0) || a > invoice.balance + 0.001) {
      toast.error(`Enter an amount between 0 and ${formatCurrency(invoice.balance, currency)}`);
      return;
    }
    if (!phone.trim() || !pin.trim()) {
      toast.error("Enter the phone number and PIN");
      return;
    }
    setPaying(true);
    try {
      const { data } = await api.post(`/invoices/${invoice._id}/pay`, { amount: a, phone, pin, method });
      toast.success(`Payment approved · ${data.reference}`);
      onPaid(data.invoice);
    } catch (err) {
      toast.error(apiError(err, "Payment was declined"));
    } finally {
      setPaying(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Pay fees">
      <div className="mb-4 rounded-2xl bg-surface-2 p-4 text-sm">
        <div className="flex justify-between"><span className="text-muted">Balance</span><span className="font-semibold tabular-nums">{formatCurrency(invoice.balance, currency)}</span></div>
        {invoice.installmentPlan?.enabled ? (
          <p className="mt-2 text-xs text-muted">
            Next installment: {formatCurrency(
              invoice.installmentPlan.installments.find((i) => !i.paid)?.amount || 0,
              currency
            )}
          </p>
        ) : null}
      </div>

      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Method" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="evc">EVC Plus</option>
            <option value="zaad">Zaad</option>
          </Select>
          <Input label="Amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <Input label="Mobile number" placeholder="+252 61 ..." value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="PIN" type="password" placeholder="Demo PIN is 1234" value={pin} onChange={(e) => setPin(e.target.value)} />

        <p className="flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-xs text-muted">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
          This is a simulated gateway for the demo. A valid Somali mobile number and the PIN 1234 will approve. No real money moves.
        </p>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={paying}>Cancel</Button>
          <Button type="submit" disabled={paying}>{paying ? "Processing..." : "Pay now"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default PayModal;

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Plus, Trash2, Wallet, X } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Tabs } from "../components/ui/Tabs.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { InvoiceDetail } from "../components/ui/InvoiceDetail.jsx";
import api, { apiError } from "../utils/api.js";
import { formatCurrency } from "../utils/formatter.js";

const statusTone = { Unpaid: "danger", Partial: "warning", Paid: "success" };

function useTermsClasses() {
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  useEffect(() => {
    api.get("/terms").then(({ data }) => setTerms(data.terms)).catch(() => {});
    api.get("/classes").then(({ data }) => setClasses(data.classes)).catch(() => {});
  }, []);
  return { terms, classes };
}

function FeeStructuresPanel() {
  const { terms, classes } = useTermsClasses();
  const [term, setTerm] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [structure, setStructure] = useState(null); // null=not loaded, {} or doc
  const [lines, setLines] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (terms.length && !term) setTerm(terms.find((t) => t.isActive)?._id || terms[0]._id);
    if (classes.length && !schoolClass) setSchoolClass(classes[0]._id);
  }, [terms, classes]); // eslint-disable-line

  useEffect(() => {
    if (!term || !schoolClass) return;
    setStructure(null);
    api
      .get("/fee-structures", { params: { term, schoolClass } })
      .then(({ data }) => {
        const doc = data.feeStructures[0] || null;
        setStructure(doc || {});
        setLines(doc ? doc.lineItems.map((l) => ({ ...l })) : [{ label: "Tuition", amount: "" }]);
      })
      .catch((err) => { toast.error(apiError(err, "Could not load the structure")); setStructure({}); });
  }, [term, schoolClass]);

  const total = useMemo(() => lines.reduce((s, l) => s + (Number(l.amount) || 0), 0), [lines]);

  async function save() {
    const clean = lines
      .filter((l) => l.label.trim() && Number(l.amount) >= 0)
      .map((l) => ({ label: l.label.trim(), amount: Number(l.amount) }));
    if (!clean.length) { toast.error("Add at least one line item"); return; }
    setSaving(true);
    try {
      if (structure?._id) {
        await api.put(`/fee-structures/${structure._id}`, { lineItems: clean });
      } else {
        const { data } = await api.post("/fee-structures", { term, schoolClass, lineItems: clean });
        setStructure(data.feeStructure);
      }
      toast.success("Fee structure saved");
    } catch (err) {
      toast.error(apiError(err, "Could not save the structure"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={term} onChange={(e) => setTerm(e.target.value)} className="min-w-[10rem]">
          {terms.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.academicYear})</option>)}
        </Select>
        <Select value={schoolClass} onChange={(e) => setSchoolClass(e.target.value)} className="min-w-[10rem]">
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </Select>
      </div>

      {structure === null ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : (
        <div className="max-w-lg space-y-3">
          {lines.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={l.label}
                onChange={(e) => setLines((p) => p.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                placeholder="e.g. Tuition"
                className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                min="0"
                value={l.amount}
                onChange={(e) => setLines((p) => p.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))}
                placeholder="0"
                className="w-28 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="button" onClick={() => setLines((p) => p.filter((_, j) => j !== i))} className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setLines((p) => [...p, { label: "", amount: "" }])}>
            <Plus className="h-4 w-4" /> Add line
          </Button>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold text-fg">Total: <span className="tabular-nums">{total}</span></span>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save structure"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceAdminModal({ invoice: initial, onClose, onChanged }) {
  const [invoice, setInvoice] = useState(initial);
  const [count, setCount] = useState(2);
  const [cashAmount, setCashAmount] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const { data } = await api.get(`/invoices/${invoice._id}`);
    setInvoice(data.invoice);
    onChanged();
  }

  async function setPlan() {
    const per = Math.round((invoice.total / count) * 100) / 100;
    const amounts = Array.from({ length: count }, (_, i) => (i === count - 1 ? invoice.total - per * (count - 1) : per));
    const now = new Date();
    const installments = amounts.map((amount, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i + 1, now.getDate());
      return { amount: Math.round(amount * 100) / 100, dueDate: d.toISOString().slice(0, 10) };
    });
    setBusy(true);
    try {
      await api.post(`/invoices/${invoice._id}/installment-plan`, { installments });
      toast.success("Installment plan set");
      refresh();
    } catch (err) {
      toast.error(apiError(err, "Could not set the plan"));
    } finally {
      setBusy(false);
    }
  }

  async function clearPlan() {
    setBusy(true);
    try {
      await api.delete(`/invoices/${invoice._id}/installment-plan`);
      toast.success("Plan cleared");
      refresh();
    } catch (err) {
      toast.error(apiError(err, "Could not clear the plan"));
    } finally {
      setBusy(false);
    }
  }

  async function recordCash(e) {
    e.preventDefault();
    const a = Number(cashAmount);
    if (!(a > 0)) { toast.error("Enter an amount"); return; }
    setBusy(true);
    try {
      await api.post(`/invoices/${invoice._id}/record-cash`, { amount: a });
      toast.success("Cash payment recorded");
      setCashAmount("");
      refresh();
    } catch (err) {
      toast.error(apiError(err, "Could not record the payment"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={invoice.student?.name} className="max-w-2xl">
      <InvoiceDetail invoice={invoice} />

      {invoice.status !== "Paid" ? (
        <div className="mt-6 space-y-4 border-t border-border pt-5">
          <div className="flex flex-wrap items-end gap-2">
            <Select label="Split into" value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-28">
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </Select>
            <Button variant="outline" onClick={setPlan} disabled={busy}>Set installment plan</Button>
            {invoice.installmentPlan?.enabled ? (
              <Button variant="ghost" onClick={clearPlan} disabled={busy}>Clear plan</Button>
            ) : null}
          </div>

          <form className="flex items-end gap-2" onSubmit={recordCash}>
            <Input label="Record cash payment" type="number" min="0" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} className="w-40" />
            <Button type="submit" disabled={busy}>Record</Button>
          </form>
        </div>
      ) : null}
    </Modal>
  );
}

function InvoicesPanel() {
  const currency = useSelector((s) => s.settings.data.currency) || "USD";
  const { terms, classes } = useTermsClasses();
  const [term, setTerm] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (terms.length && !term) setTerm(terms.find((t) => t.isActive)?._id || terms[0]._id);
  }, [terms]); // eslint-disable-line

  async function load() {
    setData(null);
    try {
      const res = await api.get("/invoices", {
        params: { term: term || undefined, schoolClass: schoolClass || undefined, status: status || undefined },
      });
      setData(res.data);
    } catch (err) {
      toast.error(apiError(err, "Could not load invoices"));
      setData({ invoices: [], totals: {} });
    }
  }

  useEffect(() => {
    if (term) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, schoolClass, status]);

  async function generate() {
    if (!term || !schoolClass) { toast.error("Pick a term and a class first"); return; }
    setBusy(true);
    try {
      const { data: r } = await api.post("/invoices/generate", { term, schoolClass });
      toast.success(r.message);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not generate invoices"));
    } finally {
      setBusy(false);
    }
  }

  const money = (n) => formatCurrency(n || 0, currency);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Select value={term} onChange={(e) => setTerm(e.target.value)} className="min-w-[9rem]">
          {terms.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </Select>
        <Select value={schoolClass} onChange={(e) => setSchoolClass(e.target.value)} className="min-w-[9rem]">
          <option value="">All classes</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} {c.section}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
          <option value="">Any status</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
        </Select>
        <Button variant="outline" onClick={generate} disabled={busy || !schoolClass}>Generate invoices</Button>
      </div>

      {data === null ? (
        <div className="grid place-items-center py-16"><Spinner /></div>
      ) : data.invoices.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No invoices"
          description="Set a fee structure for this class and term, then generate invoices."
        />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-4 text-sm">
            <span className="text-muted">Billed <span className="font-semibold text-fg tabular-nums">{money(data.totals.billed)}</span></span>
            <span className="text-muted">Paid <span className="font-semibold text-success tabular-nums">{money(data.totals.paid)}</span></span>
            <span className="text-muted">Outstanding <span className="font-semibold text-danger tabular-nums">{money(data.totals.outstanding)}</span></span>
          </div>
          <Table headers={["Student", "Total", "Paid", "Balance", "Status", ""]}>
            {data.invoices.map((inv) => (
              <Table.Row key={inv._id}>
                <Table.Cell className="font-medium">{inv.student?.name}</Table.Cell>
                <Table.Cell className="tabular-nums text-muted">{money(inv.total)}</Table.Cell>
                <Table.Cell className="tabular-nums text-muted">{money(inv.amountPaid)}</Table.Cell>
                <Table.Cell className="tabular-nums text-muted">{money(inv.balance)}</Table.Cell>
                <Table.Cell><Badge tone={statusTone[inv.status]}>{inv.status}</Badge></Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => setDetail(inv)}>Open</Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table>
        </>
      )}

      {detail ? (
        <InvoiceAdminModal invoice={detail} onClose={() => setDetail(null)} onChanged={load} />
      ) : null}
    </div>
  );
}

export default function AdminFeesPage() {
  const [tab, setTab] = useState("invoices");
  return (
    <div>
      <PageHeader title="Fees" description="Fee structures per class and term, invoices, installments and payments." />
      <Tabs
        className="mb-6"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "invoices", label: "Invoices" },
          { value: "structures", label: "Fee structures" },
        ]}
      />
      {tab === "invoices" ? <InvoicesPanel /> : <FeeStructuresPanel />}
    </div>
  );
}

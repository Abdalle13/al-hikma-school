import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Plus, Trash2, Wallet, X, Search, Sparkles, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
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
const FEE_ITEM_PRESETS = [
  "Monthly Tuition Fee",
  "Annual Registration Fee",
  "Books & Materials",
  "Exam & Assessment Fee",
  "School Uniform",
  "Bus Transportation",
];

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
  const [structure, setStructure] = useState(null);
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
        setLines(doc ? doc.lineItems.map((l) => ({ ...l })) : [{ label: "Monthly Tuition", amount: "50" }]);
      })
      .catch((err) => {
        toast.error(apiError(err, "Could not load the fee structure"));
        setStructure({});
      });
  }, [term, schoolClass]);

  const total = useMemo(() => lines.reduce((s, l) => s + (Number(l.amount) || 0), 0), [lines]);

  function addPreset(label) {
    if (lines.some((l) => l.label.toLowerCase() === label.toLowerCase())) {
      toast("This line item is already added");
      return;
    }
    setLines((p) => [...p, { label, amount: "" }]);
  }

  async function save() {
    const clean = lines
      .filter((l) => l.label.trim() && Number(l.amount) >= 0)
      .map((l) => ({ label: l.label.trim(), amount: Number(l.amount) }));
    if (!clean.length) {
      toast.error("Please add at least one line item with an amount");
      return;
    }
    setSaving(true);
    try {
      if (structure?._id) {
        await api.put(`/fee-structures/${structure._id}`, { lineItems: clean });
      } else {
        const { data } = await api.post("/fee-structures", { term, schoolClass, lineItems: clean });
        setStructure(data.feeStructure);
      }
      toast.success("Fee structure saved successfully");
    } catch (err) {
      toast.error(apiError(err, "Could not save the structure"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3 rounded-2xl border border-border bg-surface p-4">
        <Select label="Term" value={term} onChange={(e) => setTerm(e.target.value)} className="min-w-[12rem]">
          {terms.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} ({t.academicYear})
            </option>
          ))}
        </Select>
        <Select label="Class" value={schoolClass} onChange={(e) => setSchoolClass(e.target.value)} className="min-w-[12rem]">
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} {c.section}
            </option>
          ))}
        </Select>
      </div>

      {structure === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="max-w-xl space-y-4 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-fg">Line Items & Amounts</h3>
            <span className="text-xs text-muted">Currency: USD ($)</span>
          </div>

          {/* Quick Presets */}
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Quick Fee Presets
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FEE_ITEM_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => addPreset(p)}
                  className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-muted hover:border-primary hover:text-primary transition-colors"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {lines.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={l.label}
                  onChange={(e) =>
                    setLines((p) => p.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                  }
                  placeholder="e.g. Monthly Tuition"
                  className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">$</span>
                  <input
                    type="number"
                    min="0"
                    value={l.amount}
                    onChange={(e) =>
                      setLines((p) => p.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))
                    }
                    placeholder="0"
                    className="w-28 rounded-xl border border-border bg-surface pl-6 pr-3 py-2 text-sm font-semibold text-fg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setLines((p) => p.filter((_, j) => j !== i))}
                  className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLines((p) => [...p, { label: "", amount: "" }])}
          >
            <Plus className="h-4 w-4" /> Add Custom Line Item
          </Button>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted">Term Fee Total</p>
              <p className="text-xl font-bold text-fg tabular-nums">${total}</p>
            </div>
            <Button onClick={save} disabled={saving} size="lg">
              {saving ? "Saving..." : "Save Fee Structure"}
            </Button>
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
    const amounts = Array.from({ length: count }, (_, i) =>
      i === count - 1 ? invoice.total - per * (count - 1) : per
    );
    const now = new Date();
    const installments = amounts.map((amount, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i + 1, now.getDate());
      return { amount: Math.round(amount * 100) / 100, dueDate: d.toISOString().slice(0, 10) };
    });
    setBusy(true);
    try {
      await api.post(`/invoices/${invoice._id}/installment-plan`, { installments });
      toast.success("Installment plan enabled");
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
      toast.success("Installment plan cleared");
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
    if (!(a > 0)) {
      toast.error("Please enter a valid amount");
      return;
    }
    setBusy(true);
    try {
      await api.post(`/invoices/${invoice._id}/record-cash`, { amount: a });
      toast.success("Cash payment recorded successfully");
      setCashAmount("");
      refresh();
    } catch (err) {
      toast.error(apiError(err, "Could not record the payment"));
    } finally {
      setBusy(false);
    }
  }

  function payInFull() {
    setCashAmount(String(invoice.balance || invoice.total));
  }

  return (
    <Modal open onClose={onClose} title={`Invoice · ${invoice.student?.name}`} className="max-w-2xl">
      <InvoiceDetail invoice={invoice} />

      {invoice.status !== "Paid" ? (
        <div className="mt-6 space-y-4 border-t border-border pt-5">
          <div className="rounded-2xl bg-surface-2 p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-fg">Record Cash / Direct Payment</span>
              {invoice.balance > 0 && (
                <button
                  type="button"
                  onClick={payInFull}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Fill full balance (${invoice.balance})
                </button>
              )}
            </div>
            <form className="flex items-end gap-2" onSubmit={recordCash}>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">$</span>
                <Input
                  type="number"
                  min="0"
                  max={invoice.balance}
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="Amount"
                  className="pl-6 text-sm"
                />
              </div>
              <Button type="submit" disabled={busy}>
                Record Payment
              </Button>
            </form>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <Select
              label="Split invoice into"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-32"
            >
              <option value={2}>2 Installments</option>
              <option value={3}>3 Installments</option>
              <option value={4}>4 Installments</option>
            </Select>
            <Button variant="outline" onClick={setPlan} disabled={busy}>
              Create Installment Schedule
            </Button>
            {invoice.installmentPlan?.enabled ? (
              <Button variant="ghost" onClick={clearPlan} disabled={busy}>
                Clear Plan
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 p-3 text-xs text-success font-semibold">
          <CheckCircle2 className="h-4 w-4" /> This invoice is fully paid.
        </div>
      )}
    </Modal>
  );
}

function InvoicesPanel() {
  const currency = useSelector((s) => s.settings.data.currency) || "USD";
  const { terms, classes } = useTermsClasses();
  const [term, setTerm] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
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
        params: {
          term: term || undefined,
          schoolClass: schoolClass || undefined,
          status: status || undefined,
        },
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
    if (!term || !schoolClass) {
      toast.error("Please pick a term and a class first");
      return;
    }
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

  const filteredInvoices = useMemo(() => {
    if (!data?.invoices) return [];
    if (!search) return data.invoices;
    const q = search.toLowerCase();
    return data.invoices.filter(
      (inv) =>
        inv.student?.name?.toLowerCase().includes(q) ||
        inv.student?.admissionNo?.toLowerCase().includes(q)
    );
  }, [data?.invoices, search]);

  const collectionRate = useMemo(() => {
    if (!data?.totals?.billed) return 0;
    return Math.round(((data.totals.paid || 0) / data.totals.billed) * 100);
  }, [data?.totals]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4">
        <Select label="Term" value={term} onChange={(e) => setTerm(e.target.value)} className="min-w-[10rem]">
          {terms.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </Select>
        <Select label="Class" value={schoolClass} onChange={(e) => setSchoolClass(e.target.value)} className="min-w-[10rem]">
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} {c.section}
            </option>
          ))}
        </Select>
        <Select label="Payment Status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
          <option value="">Any status</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
        </Select>
        <Button variant="outline" onClick={generate} disabled={busy || !schoolClass}>
          Generate Invoices for Class
        </Button>
      </div>

      {data && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface p-3.5">
            <p className="text-[11px] text-muted font-medium">Total Billed</p>
            <p className="text-lg font-bold text-fg tabular-nums mt-0.5">{money(data.totals.billed)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-3.5">
            <p className="text-[11px] text-muted font-medium">Total Collected</p>
            <p className="text-lg font-bold text-success tabular-nums mt-0.5">{money(data.totals.paid)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-3.5">
            <p className="text-[11px] text-muted font-medium">Outstanding Balance</p>
            <p className="text-lg font-bold text-danger tabular-nums mt-0.5">{money(data.totals.outstanding)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-3.5">
            <p className="text-[11px] text-muted font-medium">Collection Efficiency</p>
            <p className="text-lg font-bold text-primary tabular-nums mt-0.5">{collectionRate}%</p>
          </div>
        </div>
      )}

      {data && data.invoices.length > 0 && (
        <div className="mb-4 max-w-xs">
          <Input
            placeholder="Search student or admission no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />
        </div>
      )}

      {data === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={data.invoices.length === 0 ? "No invoices found" : "No matching invoices"}
          description={
            data.invoices.length === 0
              ? "Ensure fee structure is configured for this class and term, then click 'Generate Invoices'."
              : "Try adjusting your search query or payment status filter."
          }
        />
      ) : (
        <Table headers={["Student", "Fee Category", "Total Bill", "Paid", "Balance Due", "Status", ""]}>
          {filteredInvoices.map((inv) => (
            <Table.Row key={inv._id}>
              <Table.Cell>
                <p className="font-semibold text-fg">{inv.student?.name}</p>
                <p className="text-xs text-muted tabular-nums">{inv.student?.admissionNo}</p>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  tone={
                    inv.student?.feeCategory === "Orphan"
                      ? "warning"
                      : inv.student?.feeCategory === "Scholarship"
                      ? "info"
                      : "neutral"
                  }
                >
                  {inv.student?.feeCategory || "Regular"}
                </Badge>
              </Table.Cell>
              <Table.Cell className="tabular-nums font-medium text-fg">{money(inv.total)}</Table.Cell>
              <Table.Cell className="tabular-nums text-success font-medium">{money(inv.amountPaid)}</Table.Cell>
              <Table.Cell className="tabular-nums text-danger font-medium">{money(inv.balance)}</Table.Cell>
              <Table.Cell>
                <Badge tone={statusTone[inv.status]}>{inv.status}</Badge>
              </Table.Cell>
              <Table.Cell>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => setDetail(inv)}>
                    Manage / Pay
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>
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
      <PageHeader
        title="School Fees & Finance"
        description="Term tuition structures, student invoices, installment schedules, and receipt management."
      />
      <Tabs
        className="mb-6"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "invoices", label: "Student Invoices" },
          { value: "structures", label: "Term Fee Structures" },
        ]}
      />
      {tab === "invoices" ? <InvoicesPanel /> : <FeeStructuresPanel />}
    </div>
  );
}

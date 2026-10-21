import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  X,
  HeartHandshake,
  Activity,
  BookOpen,
  UserCheck,
  Users,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { Table } from "../components/ui/Table.jsx";
import { Pagination } from "../components/ui/Pagination.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import api, { apiError } from "../utils/api.js";
import { formatDate } from "../utils/formatter.js";

const statusTone = { Enrolled: "success", Graduated: "info", Withdrawn: "warning" };

const empty = {
  name: "",
  motherName: "",
  admissionNo: "",
  password: "",
  dob: "",
  gender: "",
  phone: "",
  placeOfBirth: "",
  address: "",
  schoolClass: "",
  bloodGroup: "",
  medicalConditions: "",
  previousSchool: "",
  lastGradeCompleted: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "",
  feeCategory: "Regular",
  discountPercent: 0,
  discountReason: "",
  sponsorName: "",
};

function toDateInput(d) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

function GuardianPicker({ studentId, onLinked }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [relation, setRelation] = useState("Guardian");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      api
        .get("/users", { params: { role: "Parent", search: term, limit: 6 } })
        .then(({ data }) => setResults(data.users))
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(t);
  }, [term]);

  async function link() {
    if (!selected) return;
    setBusy(true);
    try {
      await api.post(`/students/${studentId}/guardians`, { parentId: selected._id, relation });
      toast.success(`${selected.name} linked as ${relation.toLowerCase()}`);
      setSelected(null);
      setTerm("");
      setResults([]);
      onLinked();
    } catch (err) {
      toast.error(apiError(err, "Could not link that parent"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-border p-3">
      {selected ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-fg">
            {selected.name} ({selected.email || selected.phone})
          </span>
          <button type="button" onClick={() => setSelected(null)} className="text-muted hover:text-fg">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Input
            placeholder="Search a parent by name, phone or email"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          {results.length > 0 ? (
            <ul className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface p-1 shadow-md">
              {results.map((p) => (
                <li key={p._id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(p);
                      setResults([]);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2"
                  >
                    {p.name} <span className="text-muted">{p.phone || p.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2">
        <Select value={relation} onChange={(e) => setRelation(e.target.value)} className="flex-1">
          <option value="Father">Father (Aabbe)</option>
          <option value="Mother">Mother (Hooyo)</option>
          <option value="Guardian">Guardian (Mas'uul)</option>
          <option value="Other">Other</option>
        </Select>
        <Button type="button" size="sm" disabled={!selected || busy} onClick={link}>
          <UserPlus className="h-4 w-4" /> Link
        </Button>
      </div>
    </div>
  );
}

function StudentForm({ initial, classes, onCancel, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name || "",
          motherName: initial.motherName || "",
          admissionNo: initial.admissionNo || "",
          password: "",
          dob: toDateInput(initial.dob),
          gender: initial.gender || "",
          phone: initial.phone || "",
          placeOfBirth: initial.placeOfBirth || "",
          address: initial.address || "",
          schoolClass: initial.schoolClass?._id || "",
          enrollmentStatus: initial.enrollmentStatus || "Enrolled",
          feeCategory: initial.feeCategory || "Regular",
          discountPercent: initial.discountPercent || 0,
          discountReason: initial.discountReason || "",
          sponsorName: initial.sponsorName || "",
          bloodGroup: initial.bloodGroup || "",
          medicalConditions: initial.medicalConditions || "",
          previousSchool: initial.previousSchool || "",
          lastGradeCompleted: initial.lastGradeCompleted || "",
          emergencyName: initial.emergencyContact?.name || "",
          emergencyPhone: initial.emergencyContact?.phone || "",
          emergencyRelation: initial.emergencyContact?.relation || "",
        }
      : empty
  );
  const [saving, setSaving] = useState(false);
  const [guardians, setGuardians] = useState(initial?.guardians || []);
  const [generating, setGenerating] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function generateAdmissionNo() {
    setGenerating(true);
    try {
      const { data } = await api.get("/students/next-admission-no");
      setForm((f) => ({ ...f, admissionNo: data.admissionNo }));
    } catch (err) {
      toast.error(apiError(err, "Could not generate a number"));
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    if (!isEdit && !form.admissionNo) generateAdmissionNo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || (!isEdit && form.password.length < 6)) {
      toast.error("Name and a password of at least 6 characters are required");
      return;
    }
    setSaving(true);
    try {
      const emergencyContact =
        form.emergencyName || form.emergencyPhone
          ? { name: form.emergencyName, phone: form.emergencyPhone, relation: form.emergencyRelation }
          : undefined;

      const payload = {
        name: form.name.trim(),
        motherName: form.motherName ? form.motherName.trim() : null,
        admissionNo: form.admissionNo ? form.admissionNo.trim() : undefined,
        phone: form.phone || null,
        dob: form.dob || null,
        gender: form.gender || null,
        placeOfBirth: form.placeOfBirth || null,
        address: form.address || null,
        schoolClass: form.schoolClass || null,
        feeCategory: form.feeCategory,
        discountPercent: form.feeCategory === "Orphan" ? 100 : Number(form.discountPercent) || 0,
        discountReason:
          form.feeCategory === "Orphan"
            ? "Agoonimo (100% Free Tuition)"
            : form.discountReason || null,
        sponsorName: form.sponsorName || null,
        bloodGroup: form.bloodGroup || "",
        medicalConditions: form.medicalConditions || null,
        previousSchool: form.previousSchool || null,
        lastGradeCompleted: form.lastGradeCompleted || null,
        emergencyContact,
      };

      if (isEdit) {
        payload.enrollmentStatus = form.enrollmentStatus;
        if (form.password) payload.password = form.password;
        const { data } = await api.put(`/students/${initial._id}`, payload);
        toast.success("Student updated");
        onSaved(data.student);
      } else {
        payload.password = form.password;
        const { data } = await api.post("/students", payload);
        toast.success(`${data.student.name} enrolled successfully`);
        onSaved(data.student);
      }
    } catch (err) {
      toast.error(apiError(err, "Could not save this student"));
    } finally {
      setSaving(false);
    }
  }

  async function removeGuardian(parentId) {
    try {
      await api.delete(`/students/${initial._id}/guardians/${parentId}`);
      setGuardians((g) => g.filter((x) => x.user._id !== parentId));
      toast.success("Guardian unlinked");
    } catch (err) {
      toast.error(apiError(err, "Could not unlink that guardian"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border pb-1 overflow-x-auto gap-2">
        <button
          type="button"
          onClick={() => setTab("basic")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            tab === "basic" ? "bg-primary text-primary-fg" : "text-muted hover:text-fg hover:bg-surface-2"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" /> 1. Xogta Guud
        </button>
        <button
          type="button"
          onClick={() => setTab("fee")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            tab === "fee" ? "bg-primary text-primary-fg" : "text-muted hover:text-fg hover:bg-surface-2"
          }`}
        >
          <HeartHandshake className="h-3.5 w-3.5" /> 2. Lacagta / Agoonta
          {form.feeCategory === "Orphan" && (
            <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-purple-500 text-white rounded-full">
              Agoon
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("medical")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            tab === "medical" ? "bg-primary text-primary-fg" : "text-muted hover:text-fg hover:bg-surface-2"
          }`}
        >
          <Activity className="h-3.5 w-3.5" /> 3. Caafimaadka & Gurmadka
        </button>
        <button
          type="button"
          onClick={() => setTab("background")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            tab === "background" ? "bg-primary text-primary-fg" : "text-muted hover:text-fg hover:bg-surface-2"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" /> 4. Dugsiga Hore & Waalidka
        </button>
      </div>

      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        {tab === "basic" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full student name (Magaca ardayga)"
                value={form.name}
                onChange={set("name")}
                placeholder="Tusaale: Maxamed Cali Axmed"
                required
              />
              <Input
                label="Mother's full name (Magaca hooyada)"
                value={form.motherName}
                onChange={set("motherName")}
                placeholder="Tusaale: Faadumo Xasan Nuur"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-end gap-2">
                  <Input
                    label="Admission number"
                    value={form.admissionNo}
                    onChange={set("admissionNo")}
                    placeholder="Auto generated"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="md" onClick={generateAdmissionNo} disabled={generating}>
                    {generating ? "..." : "New"}
                  </Button>
                </div>
              </div>
              <Select label="Class (Fasalka)" value={form.schoolClass} onChange={set("schoolClass")}>
                <option value="">Not assigned</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.section}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Date of birth" type="date" value={form.dob} onChange={set("dob")} />
              <Select label="Gender (Jinsiga)" value={form.gender} onChange={set("gender")}>
                <option value="">Not set</option>
                <option value="Male">Lab (Male)</option>
                <option value="Female">Dhedig (Female)</option>
              </Select>
              <Input
                label="Place of birth (Goobta dhalashada)"
                value={form.placeOfBirth}
                onChange={set("placeOfBirth")}
                placeholder="Tusaale: Muqdisho"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Address / Neighborhood (Xaafadda)"
                value={form.address}
                onChange={set("address")}
                placeholder="Tusaale: Hodan, Taleex"
              />
              <Input
                label="Student phone (if any)"
                value={form.phone}
                onChange={set("phone")}
                placeholder="Enter student phone"
              />
            </div>

            {isEdit && (
              <Select label="Enrolment status" value={form.enrollmentStatus} onChange={set("enrollmentStatus")}>
                <option value="Enrolled">Enrolled</option>
                <option value="Graduated">Graduated</option>
                <option value="Withdrawn">Withdrawn</option>
              </Select>
            )}

            <Input
              label={isEdit ? "Reset password (optional)" : "Login Password"}
              value={form.password}
              onChange={set("password")}
              placeholder={isEdit ? "Leave blank to keep the current one" : "Enter a password, at least 6 characters"}
            />
          </div>
        )}

        {tab === "fee" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border p-4 bg-surface-2/40">
              <label className="text-sm font-semibold text-fg block mb-2">
                Fee Category / Qaybta Lacag-bixinta
              </label>
              <Select value={form.feeCategory} onChange={set("feeCategory")} className="w-full">
                <option value="Regular">Caadi (Regular - 100% Tuition Bixiye)</option>
                <option value="Orphan">Agoon (Orphan - 100% Free Tuition / Bilaash)</option>
                <option value="Scholarship">Deeq Waxbarasho (Scholarship)</option>
                <option value="StaffChild">Ilmo Shaqaale (Staff Child Discount)</option>
                <option value="Discount">Qiimo Dhimis Gaar ah (Custom Discount)</option>
              </Select>
            </div>

            {form.feeCategory === "Orphan" && (
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <HeartHandshake className="h-6 w-6 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-purple-900 dark:text-purple-200 text-sm">
                      Deeqda Agoonta (100% Full Tuition Waiver)
                    </h4>
                    <p className="text-xs text-purple-800/80 dark:text-purple-300/80 mt-1">
                      Ardaygan waxaa loo diiwaangeliyay Agoon. Nidaamka xisaabaadka dugsigu wuxuu si toos ah uga dhaafayaa
                      dhammaan lacagta waxbarashada ($0 Total Billed).
                    </p>
                  </div>
                </div>
                <Input
                  label="Kafaalo-qaade / Sponsor Name (Optional)"
                  value={form.sponsorName}
                  onChange={set("sponsorName")}
                  placeholder="Tusaale: Hay'adda Hormuud / Shakhsi kafaalo qaaday"
                />
              </div>
            )}

            {form.feeCategory !== "Regular" && form.feeCategory !== "Orphan" && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Qiimo dhimis % (Discount Percent)"
                    type="number"
                    min="1"
                    max="100"
                    value={form.discountPercent}
                    onChange={set("discountPercent")}
                    placeholder="Tusaale: 50"
                  />
                  <Input
                    label="Sababta deeqda / Reason"
                    value={form.discountReason}
                    onChange={set("discountReason")}
                    placeholder="Tusaale: Kaalinta 1-aad / Duruuf gaar ah"
                  />
                </div>
                <Input
                  label="Sponsor / Bixiye (Optional)"
                  value={form.sponsorName}
                  onChange={set("sponsorName")}
                  placeholder="Qofka ama hay'adda dhimista bixinaysa"
                />
              </div>
            )}
          </div>
        )}

        {tab === "medical" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Nooca Dhiigga (Blood Group)" value={form.bloodGroup} onChange={set("bloodGroup")}>
                <option value="">Not tested / Lama oga</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </Select>
              <Input
                label="Qofka gurmadka (Emergency Contact Name)"
                value={form.emergencyName}
                onChange={set("emergencyName")}
                placeholder="Magaca qofka gurmadka"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Telefoonka Gurmadka (Emergency Phone)"
                value={form.emergencyPhone}
                onChange={set("emergencyPhone")}
                placeholder="+252 61 ..."
              />
              <Input
                label="Xiriirka (Relationship)"
                value={form.emergencyRelation}
                onChange={set("emergencyRelation")}
                placeholder="Tusaale: Adeer, Eedo, Abti, Deris"
              />
            </div>

            <Input
              label="Xaalado Caafimaad / Xasaasiyad (Allergies or Medical Notes)"
              value={form.medicalConditions}
              onChange={set("medicalConditions")}
              placeholder="Tusaale: Neefta (Asthma), Xasaasiyad daawo gaar ah, iwm."
            />
          </div>
        )}

        {tab === "background" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Dugsigiisii hore (Previous School attended)"
                value={form.previousSchool}
                onChange={set("previousSchool")}
                placeholder="Tusaale: Dugsiga Hoose/Dhexe ee Banaadir"
              />
              <Input
                label="Fasalkii ugu dambeeyay (Last Grade Completed)"
                value={form.lastGradeCompleted}
                onChange={set("lastGradeCompleted")}
                placeholder="Tusaale: Grade 6"
              />
            </div>

            {isEdit && (
              <div className="pt-2">
                <p className="mb-2 text-sm font-semibold text-fg">Linked Guardians / Waalidiinta ku xiran</p>
                {guardians.length ? (
                  <ul className="mb-3 divide-y divide-border rounded-2xl border border-border">
                    {guardians.map((g) => (
                      <li key={g.user._id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                        <span>
                          <span className="font-medium text-fg">{g.user.name}</span>
                          <span className="text-muted"> · {g.relation}</span>
                          {g.user.phone && <span className="text-muted text-xs ml-2">({g.user.phone})</span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeGuardian(g.user._id)}
                          className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                          aria-label="Unlink guardian"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-3 text-sm text-muted">No parent linked yet.</p>
                )}
                <GuardianPicker
                  studentId={initial._id}
                  onLinked={async () => {
                    const { data } = await api.get(`/students/${initial._id}`);
                    setGuardians(data.student.guardians || []);
                  }}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
          <div className="text-xs text-muted">
            {tab !== "basic" && (
              <button
                type="button"
                onClick={() => setTab("basic")}
                className="text-primary hover:underline font-medium"
              >
                ← Back to Basic info
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save changes" : "Enrol student"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState(null);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [total, setTotal] = useState(0);
  const [overallTotal, setOverallTotal] = useState(0);
  const [feeBreakdown, setFeeBreakdown] = useState({});
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [feeCategoryFilter, setFeeCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const { data } = await api.get("/students", {
        params: {
          search: search || undefined,
          schoolClass: classFilter || undefined,
          enrollmentStatus: statusFilter || undefined,
          feeCategory: feeCategoryFilter || undefined,
          page,
          limit: 15,
        },
      });
      setStudents(data.students);
      setMeta({ page: data.page, pages: data.pages });
      setTotal(data.total ?? data.students?.length ?? 0);
      if (data.overallTotal !== undefined) {
        setOverallTotal(data.overallTotal);
      } else if (!search && !classFilter && !statusFilter && !feeCategoryFilter) {
        setOverallTotal(data.total ?? 0);
      }
      if (data.feeBreakdown) {
        setFeeBreakdown(data.feeBreakdown);
      }
    } catch (err) {
      toast.error(apiError(err, "Could not load students"));
      setStudents([]);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, classFilter, statusFilter, feeCategoryFilter, page]);

  useEffect(() => {
    api.get("/classes").then(({ data }) => setClasses(data.classes)).catch(() => {});
    api.get("/students", { params: { limit: 1 } })
      .then(({ data }) => {
        if (data.overallTotal !== undefined) setOverallTotal(data.overallTotal);
        else if (data.total !== undefined) setOverallTotal(data.total);
        if (data.feeBreakdown) setFeeBreakdown(data.feeBreakdown);
      })
      .catch(() => {});
  }, []);

  function onSaved() {
    setModal(null);
    load();
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await api.delete(`/students/${toDelete._id}`);
      toast.success("Student removed");
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not remove this student"));
    } finally {
      setBusy(false);
    }
  }

  async function openEdit(row) {
    const { data } = await api.get(`/students/${row._id}`);
    setModal({ mode: "edit", student: data.student });
  }

  return (
    <div>
      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-2.5">
            <span>Students</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Users className="h-3.5 w-3.5" />
              Total: {overallTotal || total} Students
            </span>
            {(feeCategoryFilter || classFilter || statusFilter || search) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/30 animate-in fade-in">
                Filtered Total: {total} {total === 1 ? "Student" : "Students"}
              </span>
            )}
          </div>
        }
        description="Enrolment, class assignment, fee/orphan status and parent links."
        action={
          <Button onClick={() => setModal({ mode: "create" })}>
            <Plus className="h-4 w-4" /> Enrol student
          </Button>
        }
      />

      {/* Quick Fee Category Filter Pills with Live Totals */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider mr-1">
          Fee Category:
        </span>
        <button
          type="button"
          onClick={() => {
            setFeeCategoryFilter("");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            !feeCategoryFilter
              ? "bg-primary text-primary-fg border-primary shadow-sm"
              : "bg-surface text-muted hover:text-fg hover:bg-surface-2 border-border"
          }`}
        >
          All Students ({overallTotal || total})
        </button>
        <button
          type="button"
          onClick={() => {
            setFeeCategoryFilter("Regular");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            feeCategoryFilter === "Regular"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
              : "bg-surface text-muted hover:text-fg hover:bg-surface-2 border-border"
          }`}
        >
          Caadi (Regular) {feeBreakdown?.Regular !== undefined ? `(${feeBreakdown.Regular})` : ""}
        </button>
        <button
          type="button"
          onClick={() => {
            setFeeCategoryFilter("Orphan");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            feeCategoryFilter === "Orphan"
              ? "bg-purple-600 text-white border-purple-600 shadow-sm"
              : "bg-surface text-muted hover:text-fg hover:bg-surface-2 border-border"
          }`}
        >
          Agoon (100% Free) {feeBreakdown?.Orphan !== undefined ? `(${feeBreakdown.Orphan})` : ""}
        </button>
        <button
          type="button"
          onClick={() => {
            setFeeCategoryFilter("Scholarship");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            feeCategoryFilter === "Scholarship"
              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
              : "bg-surface text-muted hover:text-fg hover:bg-surface-2 border-border"
          }`}
        >
          Deeq (Scholarship) {feeBreakdown?.Scholarship !== undefined ? `(${feeBreakdown.Scholarship})` : ""}
        </button>
        <button
          type="button"
          onClick={() => {
            setFeeCategoryFilter("StaffChild");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            feeCategoryFilter === "StaffChild"
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-surface text-muted hover:text-fg hover:bg-surface-2 border-border"
          }`}
        >
          Ilmo Shaqaale {feeBreakdown?.StaffChild !== undefined ? `(${feeBreakdown.StaffChild})` : ""}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search by name, mother or admission #"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="max-w-xs"
        />
        <Select
          value={classFilter}
          onChange={(e) => {
            setPage(1);
            setClassFilter(e.target.value);
          }}
          className="max-w-[10rem]"
        >
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} {c.section}
            </option>
          ))}
        </Select>
        <Select
          value={feeCategoryFilter}
          onChange={(e) => {
            setPage(1);
            setFeeCategoryFilter(e.target.value);
          }}
          className="max-w-[11rem]"
        >
          <option value="">All Fee Status</option>
          <option value="Regular">Caadi (Regular)</option>
          <option value="Orphan">Agoon (100% Free)</option>
          <option value="Scholarship">Deeq (Scholarship)</option>
          <option value="StaffChild">Ilmo Shaqaale</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="max-w-[10rem]"
        >
          <option value="">Any status</option>
          <option value="Enrolled">Enrolled</option>
          <option value="Graduated">Graduated</option>
          <option value="Withdrawn">Withdrawn</option>
        </Select>
      </div>

      {/* Active Filter Summary Banner */}
      {(feeCategoryFilter || classFilter || statusFilter || search) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-primary">Active Filter Result:</span>
            {feeCategoryFilter && (
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
                Fee: {feeCategoryFilter === "Regular" ? "Caadi (Regular)" : feeCategoryFilter === "Orphan" ? "Agoon (100% Free)" : feeCategoryFilter}
              </span>
            )}
            {classFilter && (
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold border border-blue-500/20">
                Class: {classes.find((c) => c._id === classFilter)?.name || "Selected Class"}
              </span>
            )}
            {statusFilter && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/20">
                Status: {statusFilter}
              </span>
            )}
            {search && (
              <span className="px-2 py-0.5 rounded-md bg-surface text-fg font-medium border border-border">
                Search: "{search}"
              </span>
            )}
            <span className="font-bold text-fg ml-1">
              → Found {total} student{total === 1 ? "" : "s"}
            </span>
            {overallTotal > 0 && (
              <span className="text-muted">
                (out of {overallTotal} total enrolled)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setClassFilter("");
              setStatusFilter("");
              setFeeCategoryFilter("");
              setPage(1);
            }}
            className="text-xs font-semibold text-primary hover:underline ml-auto"
          >
            Clear Filters
          </button>
        </div>
      )}

      {students === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          description="Try a different search, or enrol your first student."
          action={<Button onClick={() => setModal({ mode: "create" })}>Enrol student</Button>}
        />
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>
              {(feeCategoryFilter || classFilter || statusFilter || search)
                ? `Showing ${students?.length || 0} of ${total} filtered students`
                : `Showing ${students?.length || 0} of ${total} students`}
            </span>
            {feeCategoryFilter && (
              <span className="font-semibold text-fg">
                Filter Total (${feeCategoryFilter === "Regular" ? "Caadi / Regular" : feeCategoryFilter}): ${total}
              </span>
            )}
          </div>
          <Table headers={["Student & Mother", "Admission no.", "Class", "Fee Status", "Gender", "Status", ""]}>
            {students.map((s) => (
              <Table.Row key={s._id}>
                <Table.Cell>
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} size="sm" />
                    <div>
                      <p className="font-medium text-fg">{s.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                        {s.motherName ? (
                          <span>
                            Hooyo: <strong className="text-fg/80">{s.motherName}</strong>
                          </span>
                        ) : null}
                        {s.dob ? <span>Born {formatDate(s.dob)}</span> : null}
                      </div>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell className="tabular-nums font-mono text-xs">{s.admissionNo}</Table.Cell>
                <Table.Cell className="text-muted">
                  {s.schoolClass ? `${s.schoolClass.name} ${s.schoolClass.section || ""}` : "Not assigned"}
                </Table.Cell>
                <Table.Cell>
                  {s.feeCategory === "Orphan" ? (
                    <Badge tone="purple" className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                      Agoon (Free)
                    </Badge>
                  ) : s.feeCategory === "Scholarship" ? (
                    <Badge tone="warning" className="border border-amber-500/30">
                      Deeq ({s.discountPercent || 100}%)
                    </Badge>
                  ) : s.feeCategory === "StaffChild" ? (
                    <Badge tone="info" className="border border-blue-500/30">
                      Ilmo Shaqaale
                    </Badge>
                  ) : s.feeCategory === "Discount" ? (
                    <Badge tone="info">Dhimis ({s.discountPercent}%)</Badge>
                  ) : (
                    <Badge tone="neutral">Caadi</Badge>
                  )}
                </Table.Cell>
                <Table.Cell className="text-muted">{s.gender || "-"}</Table.Cell>
                <Table.Cell>
                  <Badge tone={statusTone[s.enrollmentStatus] || "neutral"}>{s.enrollmentStatus}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      aria-label={`Edit ${s.name}`}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(s)}
                      aria-label={`Delete ${s.name}`}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table>
          <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
        </>
      )}

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? `Edit: ${modal.student?.name}` : "Diiwaangeli Arday Cusub (Enrol Student)"}
        className="max-w-2xl"
      >
        {modal ? (
          <StudentForm initial={modal.student} classes={classes} onCancel={() => setModal(null)} onSaved={onSaved} />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={busy}
        title="Remove this student?"
        description={`"${toDelete?.name}" and their account will be deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

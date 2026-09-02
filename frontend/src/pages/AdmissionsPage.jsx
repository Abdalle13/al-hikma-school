import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, ClipboardList, FileText, MessageSquare } from "lucide-react";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Textarea } from "../components/ui/Textarea.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Section } from "../components/ui/Section.jsx";
import { SectionHeading } from "../components/ui/SectionHeading.jsx";
import { FadeIn } from "../components/ui/FadeIn.jsx";
import api, { apiError } from "../utils/api.js";

const steps = [
  { icon: FileText, title: "Submit the form", body: "Tell us about your child and how to reach you." },
  { icon: ClipboardList, title: "We review it", body: "An admin checks the application and the available places." },
  { icon: MessageSquare, title: "We contact you", body: "You hear back about an interview and the next steps." },
  { icon: CheckCircle2, title: "Enrolment", body: "On acceptance we set up the student and parent accounts." },
];

const requirements = [
  "The child's birth certificate or passport",
  "The most recent school report, if the child has attended school before",
  "Two passport photos",
  "A parent or guardian ID",
];

const feeOverview = [
  ["Tuition", "Per term"],
  ["Transport", "Optional, per term"],
  ["Books and materials", "Per term"],
  ["Registration", "One time, on enrolment"],
];

const faqs = [
  { q: "Is there a public sign up for the portal?", a: "No. The school creates every account after a child is enrolled and gives you the login details." },
  { q: "Can fees be paid in installments?", a: "Yes. A term's fee can be split into 2 to 4 payments, paid by mobile money or cash at the office." },
  { q: "When can my child start?", a: "Enrolment happens at the start of a term. We keep a short waiting list when a class is full." },
];

const empty = {
  childName: "",
  dob: "",
  gender: "",
  gradeApplyingFor: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  message: "",
};

function ApplicationForm() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const next = {};
    if (!form.childName.trim()) next.childName = "Required";
    if (!form.parentName.trim()) next.parentName = "Required";
    if (!form.parentPhone.trim()) next.parentPhone = "Required";
    if (form.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parentEmail)) {
      next.parentEmail = "Enter a valid email";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.dob) delete payload.dob;
      if (!payload.gender) delete payload.gender;
      await api.post("/applications", payload);
      setDone(true);
    } catch (err) {
      toast.error(apiError(err, "Could not send the application"));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card className="p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h3 className="mt-4 font-heading text-lg font-bold text-fg">Application received</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Thank you. The school will review it and contact you using the details you gave.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setForm(empty);
            setDone(false);
          }}
        >
          Submit another
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit} noValidate>
        <Input label="Child's full name" placeholder="Enter your child's full name" value={form.childName} onChange={set("childName")} error={errors.childName} />
        <Input label="Date of birth" type="date" value={form.dob} onChange={set("dob")} />
        <Select label="Gender" value={form.gender} onChange={set("gender")}>
          <option value="">Prefer not to say</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </Select>
        <Input label="Grade applying for" placeholder="Enter the grade, for example Grade 4" value={form.gradeApplyingFor} onChange={set("gradeApplyingFor")} />

        <Input label="Parent or guardian name" placeholder="Enter the parent or guardian name" value={form.parentName} onChange={set("parentName")} error={errors.parentName} />
        <Input label="Phone" placeholder="Enter your phone number" value={form.parentPhone} onChange={set("parentPhone")} error={errors.parentPhone} />
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email address"
          value={form.parentEmail}
          onChange={set("parentEmail")}
          error={errors.parentEmail}
          className="sm:col-span-2"
        />
        <Textarea
          label="Anything else we should know?"
          rows={4}
          value={form.message}
          onChange={set("message")}
          className="sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "Sending..." : "Submit application"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function AdmissionsPage() {
  return (
    <div>
      <Section>
        <FadeIn>
          <SectionHeading
            eyebrow="Admissions"
            title="Applying is simple"
            lead="Fill in the form below and the school will take it from there. There is no fee to apply."
          />
        </FadeIn>
      </Section>

      <Section tone="surface">
        <FadeIn>
          <SectionHeading eyebrow="The process" title="Four steps" />
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <FadeIn key={s.title} delay={i * 0.05}>
                <Card hover className="h-full bg-bg">
                  <div className="flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 font-heading text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <Icon className="h-4 w-4 text-muted" />
                  </div>
                  <h3 className="mt-4 font-heading text-sm font-bold text-fg">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <FadeIn>
            <SectionHeading eyebrow="Before you apply" title="What to bring" />
            <ul className="mt-6 space-y-3">
              {requirements.map((r) => (
                <li key={r} className="flex gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-fg shadow-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </FadeIn>
          <FadeIn delay={0.05}>
            <SectionHeading eyebrow="Fees" title="What a term covers" />
            <div className="mt-6 overflow-hidden rounded-2xl border border-border shadow-card">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border bg-surface">
                  {feeOverview.map((row) => (
                    <tr key={row[0]}>
                      <td className="px-4 py-3.5 font-semibold text-fg">{row[0]}</td>
                      <td className="px-4 py-3.5 text-right text-muted">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted">
              Exact amounts are shared on enrolment and can be paid in installments.
            </p>
          </FadeIn>
        </div>
      </Section>

      <Section tone="surface" id="apply">
        <FadeIn>
          <SectionHeading eyebrow="Application form" title="Tell us about your child" />
        </FadeIn>
        <div className="mt-10 max-w-3xl">
          <ApplicationForm />
        </div>
      </Section>

      <Section>
        <FadeIn>
          <SectionHeading eyebrow="Questions" title="Common questions" />
        </FadeIn>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {faqs.map((f, i) => (
            <FadeIn key={f.q} delay={i * 0.05}>
              <Card hover className="h-full">
                <h3 className="font-heading text-sm font-bold text-fg">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Section>
    </div>
  );
}

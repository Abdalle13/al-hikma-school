import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, ChevronDown, ClipboardList, FileText, MessageSquare } from "lucide-react";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Textarea } from "../components/ui/Textarea.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Section } from "../components/ui/Section.jsx";
import { SectionHeading } from "../components/ui/SectionHeading.jsx";
import { PageHero } from "../components/ui/PageHero.jsx";
import { FadeIn } from "../components/ui/FadeIn.jsx";
import { cn } from "../utils/formatter.js";
import api, { apiError } from "../utils/api.js";

const steps = [
  { icon: FileText, title: "Submit the form", body: "Tell us about your child and how to reach you." },
  { icon: ClipboardList, title: "We review it", body: "An admin checks the application and the available places." },
  { icon: MessageSquare, title: "We contact you", body: "You hear back about an interview and the next steps." },
  { icon: CheckCircle2, title: "Enrolment", body: "On acceptance we set up the student and parent accounts." },
];

const requirements = [
  "The child's birth certificate",
  "The most recent school report, if the child has been to school before",
  "Two recent photos of the child",
  "A parent or guardian ID card",
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
  { q: "Is there a fee to apply?", a: "No. Applying is free. Fees only apply once a child is enrolled." },
  { q: "Which class will my child be placed in?", a: "New students sit a short placement test. The result decides the class, so you do not choose a grade on the form." },
  { q: "Do you teach Quran and academics together?", a: "Yes. Every student follows the full academic timetable, with Quran and Islamic studies built into the same week." },
  { q: "How will the school contact me?", a: "Using the phone number on your application, so please enter one you check often. Add an email if you have one." },
];

const empty = {
  childName: "",
  dob: "",
  gender: "",
  parentName: "",
  relationship: "",
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
      if (!payload.relationship) delete payload.relationship;
      await api.post("/applications", payload);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(apiError(err, "Could not send the application"));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card className="p-8 text-center sm:p-10">
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
            setErrors({});
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
        <Input label="Child's full name" placeholder="Enter your child's full name" value={form.childName} onChange={set("childName")} error={errors.childName} className="sm:col-span-2" />
        <Input label="Date of birth" type="date" value={form.dob} onChange={set("dob")} />
        <Select label="Gender" value={form.gender} onChange={set("gender")}>
          <option value="">Prefer not to say</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </Select>

        <Input label="Parent or guardian name" placeholder="Enter the parent or guardian name" value={form.parentName} onChange={set("parentName")} error={errors.parentName} />
        <Select label="You are the child's" value={form.relationship} onChange={set("relationship")}>
          <option value="">Select one</option>
          <option value="Father">Father</option>
          <option value="Mother">Mother</option>
          <option value="Guardian">Guardian</option>
          <option value="Other">Other</option>
        </Select>
        <Input label="Phone" placeholder="Enter your phone number" value={form.parentPhone} onChange={set("parentPhone")} error={errors.parentPhone} className="sm:col-span-2" />
        <Input
          label="Email (optional)"
          type="email"
          placeholder="Enter your email address"
          value={form.parentEmail}
          onChange={set("parentEmail")}
          error={errors.parentEmail}
          className="sm:col-span-2"
        />
        <Textarea
          label="Anything else we should know? (optional)"
          rows={4}
          value={form.message}
          onChange={set("message")}
          className="sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <Button type="submit" size="lg" disabled={submitting} className="w-full">
            {submitting ? "Sending..." : "Submit application"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-heading text-sm font-bold text-fg">{q}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{a}</p> : null}
    </div>
  );
}

export default function AdmissionsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Admissions"
        title="Applying is simple"
        lead="Fill in the form and the school takes it from there. Applying is free."
      />

      {/* application form, front and centre */}
      <Section id="apply">
        <FadeIn>
          <div className="mx-auto max-w-2xl">
            <SectionHeading
              eyebrow="Application form"
              title="Tell us about your child"
              align="center"
              className="mx-auto"
            />
            <div className="mt-10">
              <ApplicationForm />
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* how it works */}
      <Section tone="surface">
        <FadeIn>
          <SectionHeading eyebrow="The process" title="What happens next" />
        </FadeIn>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* what to bring + fees */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <FadeIn>
            <SectionHeading eyebrow="Before you apply" title="What to bring" />
            <ul className="mt-6 space-y-3">
              {requirements.map((r) => (
                <li
                  key={r}
                  className="flex gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-fg shadow-sm"
                >
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

      {/* faq accordion */}
      <Section tone="surface">
        <FadeIn>
          <SectionHeading eyebrow="Questions" title="Common questions" align="center" className="mx-auto" />
        </FadeIn>
        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3">
          {faqs.map((f, i) => (
            <FadeIn key={f.q} delay={i * 0.04}>
              <FaqItem q={f.q} a={f.a} />
            </FadeIn>
          ))}
        </div>
      </Section>
    </div>
  );
}

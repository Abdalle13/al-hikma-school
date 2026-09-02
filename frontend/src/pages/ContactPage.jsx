import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Input } from "../components/ui/Input.jsx";
import { Textarea } from "../components/ui/Textarea.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Section } from "../components/ui/Section.jsx";
import { PageHero } from "../components/ui/PageHero.jsx";
import { FadeIn } from "../components/ui/FadeIn.jsx";
import api, { apiError } from "../utils/api.js";

const empty = { name: "", email: "", subject: "", message: "" };

function ContactForm() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.email.trim()) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email";
    if (!form.message.trim()) next.message = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      setDone(true);
    } catch (err) {
      toast.error(apiError(err, "Could not send your message"));
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
        <h3 className="mt-4 font-heading text-lg font-bold text-fg">Message sent</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Thanks for getting in touch. The school will reply to the email you gave.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => { setForm(empty); setDone(false); }}>
          Send another
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <form className="grid gap-4" onSubmit={onSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Your name" placeholder="Enter your name" value={form.name} onChange={set("name")} error={errors.name} />
          <Input label="Email" type="email" placeholder="Enter your email address" value={form.email} onChange={set("email")} error={errors.email} />
        </div>
        <Input label="Subject" placeholder="Enter a subject" value={form.subject} onChange={set("subject")} />
        <Textarea label="Message" rows={5} placeholder="Enter your message" value={form.message} onChange={set("message")} error={errors.message} />
        <div>
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "Sending..." : "Send message"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function ContactPage() {
  const { address, phone, email } = useSelector((s) => s.settings.data);
  const mapQuery = encodeURIComponent(address || "Mogadishu, Somalia");

  const details = [
    { icon: MapPin, label: "Address", value: address || "Mogadishu, Somalia" },
    { icon: Phone, label: "Phone", value: phone || "+252 00 000 0000", href: phone ? `tel:${phone}` : undefined },
    { icon: Mail, label: "Email", value: email || "info@school.example", href: email ? `mailto:${email}` : undefined },
    { icon: Clock, label: "Office hours", value: "Saturday to Thursday, 7:30 am to 3:00 pm" },
  ];

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        lead="Questions about admissions, fees or anything else, send a message or call the office."
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <FadeIn>
            <div className="grid gap-4 sm:grid-cols-2">
              {details.map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.label} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">{d.label}</p>
                    {d.href ? (
                      <a href={d.href} className="mt-1 block text-sm font-medium text-fg hover:text-primary">
                        {d.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-medium text-fg">{d.value}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-border shadow-card">
              <iframe
                title="School location"
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <ContactForm />
          </FadeIn>
        </div>
      </Section>
    </div>
  );
}

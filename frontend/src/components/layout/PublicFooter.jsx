import { Link } from "react-router-dom";
import { ArrowRight, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSelector } from "react-redux";
import { Brand } from "../ui/Brand.jsx";
import { Button } from "../ui/Button.jsx";

const col = (title, links) => (
  <div key={title}>
    <p className="font-heading text-sm font-bold text-fg">{title}</p>
    <ul className="mt-4 space-y-2.5 text-sm text-muted">
      {links.map((l) => (
        <li key={l.label}>
          <Link to={l.to} className="transition-colors hover:text-primary">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export function PublicFooter() {
  const { schoolName, address, phone, email, socials } = useSelector((s) => s.settings.data);
  const year = new Date().getFullYear();

  const socialLinks = [
    socials?.facebook && { href: socials.facebook, label: "Facebook", Icon: Facebook },
    socials?.instagram && { href: socials.instagram, label: "Instagram", Icon: Instagram },
    socials?.whatsapp && { href: socials.whatsapp, label: "WhatsApp", Icon: MessageCircle },
  ].filter(Boolean);

  return (
    <footer className="bg-surface">
      {/* call to action band */}
      <div className="mx-auto max-w-[1200px] px-4 pb-14 pt-4 sm:pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-12 shadow-card sm:px-14 sm:py-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-lg">
              <h3 className="font-heading text-2xl font-bold text-on-primary sm:text-3xl">
                Bring your child to {schoolName}
              </h3>
              <p className="mt-3 text-sm text-on-primary/80 sm:text-base">
                Start an application online. An admin reviews it and gets back to you with the next steps.
              </p>
            </div>
            <Button
              as={Link}
              to="/admissions"
              size="lg"
              variant="secondary"
              className="shrink-0 bg-white text-primary hover:bg-white/90"
            >
              Start an application <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Brand />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            A private school for Somali families. Primary, secondary, Quran and Islamic studies under one
            roof.
          </p>
          {socialLinks.length ? (
            <div className="mt-5 flex gap-2">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {col("Explore", [
          { to: "/about", label: "About" },
          { to: "/academics", label: "Academics" },
          { to: "/admissions", label: "Admissions" },
          { to: "/news", label: "News and events" },
        ])}

        {col("Portal", [
          { to: "/login", label: "Parent login" },
          { to: "/login", label: "Staff login" },
          { to: "/login", label: "Student login" },
          { to: "/contact", label: "Get help" },
        ])}

        <div>
          <p className="font-heading text-sm font-bold text-fg">Contact</p>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {address ? (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{address}</span>
              </li>
            ) : null}
            {phone ? (
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={`tel:${phone}`} className="transition-colors hover:text-primary">
                  {phone}
                </a>
              </li>
            ) : null}
            {email ? (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={`mailto:${email}`} className="break-all transition-colors hover:text-primary">
                  {email}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-1.5 px-4 py-6 text-xs text-muted sm:flex-row">
          <p>
            &copy; {year} {schoolName}. All rights reserved.
          </p>
          <p>
            Built by{" "}
            <a
              href="https://github.com/Abdalle13"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-fg transition-colors hover:text-primary"
            >
              Abdalle Hussein
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;

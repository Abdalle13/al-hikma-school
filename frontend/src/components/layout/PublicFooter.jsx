import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSelector } from "react-redux";
import { Brand } from "../ui/Brand.jsx";

export function PublicFooter() {
  const { schoolName, address, phone, email, socials } = useSelector((s) => s.settings.data);
  const year = new Date().getFullYear();

  const socialLinks = [
    socials?.facebook && { href: socials.facebook, label: "Facebook", Icon: Facebook },
    socials?.instagram && { href: socials.instagram, label: "Instagram", Icon: Instagram },
    socials?.whatsapp && { href: socials.whatsapp, label: "WhatsApp", Icon: MessageCircle },
  ].filter(Boolean);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.4fr]">
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

        <div>
          <p className="font-heading text-sm font-bold text-fg">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            {[
              { to: "/about", label: "About" },
              { to: "/academics", label: "Academics" },
              { to: "/admissions", label: "Admissions" },
              { to: "/news", label: "News and events" },
              { to: "/login", label: "Portal login" },
            ].map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

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
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-1.5 px-4 py-6 text-center text-xs text-muted">
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

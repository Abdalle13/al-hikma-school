import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSelector } from "react-redux";
import { Brand } from "../ui/Brand.jsx";

export function PublicFooter() {
  const { schoolName, address, phone, email, socials } = useSelector((s) => s.settings.data);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Brand />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            A private school for Somali families. Primary, secondary, Quran and Islamic studies.
          </p>
          <div className="mt-4 flex gap-2">
            {socials?.facebook ? (
              <a href={socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-xl border border-border p-2 text-muted transition-colors hover:text-fg">
                <Facebook className="h-4 w-4" />
              </a>
            ) : null}
            {socials?.instagram ? (
              <a href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-xl border border-border p-2 text-muted transition-colors hover:text-fg">
                <Instagram className="h-4 w-4" />
              </a>
            ) : null}
            {socials?.whatsapp ? (
              <a href={socials.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="rounded-xl border border-border p-2 text-muted transition-colors hover:text-fg">
                <MessageCircle className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-fg">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link to="/about" className="transition-colors hover:text-fg">About</Link></li>
            <li><Link to="/academics" className="transition-colors hover:text-fg">Academics</Link></li>
            <li><Link to="/admissions" className="transition-colors hover:text-fg">Admissions</Link></li>
            <li><Link to="/news" className="transition-colors hover:text-fg">News and events</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-fg">Portal</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link to="/login" className="transition-colors hover:text-fg">Parent login</Link></li>
            <li><Link to="/login" className="transition-colors hover:text-fg">Staff login</Link></li>
            <li><Link to="/login" className="transition-colors hover:text-fg">Student login</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-fg">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {address ? (
              <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{address}</li>
            ) : null}
            {phone ? (
              <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" /><a href={`tel:${phone}`} className="hover:text-fg">{phone}</a></li>
            ) : null}
            {email ? (
              <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" /><a href={`mailto:${email}`} className="hover:text-fg">{email}</a></li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-[1200px] px-4 py-4 text-xs text-muted">
          {year} {schoolName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default PublicFooter;

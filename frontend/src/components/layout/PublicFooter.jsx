import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-heading font-bold text-fg">
            <GraduationCap className="h-5 w-5 text-primary" />
            School Name
          </div>
          <p className="mt-2 text-sm text-muted">
            A private school for Somali families. Primary, secondary, Quran and Islamic studies.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-fg">Explore</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li><Link to="/about" className="hover:text-fg">About</Link></li>
            <li><Link to="/academics" className="hover:text-fg">Academics</Link></li>
            <li><Link to="/admissions" className="hover:text-fg">Admissions</Link></li>
            <li><Link to="/news" className="hover:text-fg">News and events</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-fg">Portal</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li><Link to="/login" className="hover:text-fg">Parent login</Link></li>
            <li><Link to="/login" className="hover:text-fg">Staff login</Link></li>
            <li><Link to="/register" className="hover:text-fg">Create a parent account</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-fg">Contact</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>Mogadishu, Somalia</li>
            <li>+252 00 000 0000</li>
            <li>info@school.example</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-[1200px] px-4 py-4 text-xs text-muted">
          {year} School Name. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default PublicFooter;

import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { ThemeToggle } from "../ui/ThemeToggle.jsx";
import { cn } from "../../utils/formatter.js";

const nav = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/academics", label: "Academics" },
  { to: "/admissions", label: "Admissions" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold text-fg">
          <GraduationCap className="h-6 w-6 text-primary" />
          School Name
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted hover:text-fg"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button as={Link} to="/login" size="sm">
            Login
          </Button>
        </div>

        <button
          type="button"
          className="rounded-2xl border border-border p-2 text-fg md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-bg px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-2xl px-3 py-2 text-sm font-medium",
                    isActive ? "bg-surface-2 text-primary" : "text-muted"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-2">
            <ThemeToggle />
            <Button as={Link} to="/login" size="sm" className="flex-1" onClick={() => setOpen(false)}>
              Login
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default PublicHeader;

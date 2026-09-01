import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { Brand } from "../ui/Brand.jsx";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = ({ isActive }) =>
    cn(
      "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
      isActive ? "text-primary" : "text-muted hover:text-fg"
    );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors",
        scrolled ? "border-border bg-bg/80 backdrop-blur" : "border-transparent bg-bg"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
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
          className="rounded-xl border border-border p-2 text-fg transition-colors hover:bg-surface-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
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
                    "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-surface-2 text-primary" : "text-muted hover:text-fg"
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

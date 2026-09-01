import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import { portalNav } from "./portalNav.js";
import { ThemeToggle } from "../ui/ThemeToggle.jsx";
import { Avatar } from "../ui/Avatar.jsx";
import { cn } from "../../lib/cn.js";

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {portalNav.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface-2 hover:text-fg"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function PortalLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      {/* fixed sidebar on desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5 font-heading font-bold text-fg">
          <GraduationCap className="h-5 w-5 text-primary" />
          School Portal
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavItems />
        </div>
      </aside>

      {/* mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-surface p-3">
            <div className="mb-2 flex items-center justify-between px-2 py-2">
              <span className="font-heading font-bold text-fg">School Portal</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5 text-muted" />
              </button>
            </div>
            <NavItems onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-bg/90 px-4 backdrop-blur">
          <button
            type="button"
            className="rounded-2xl border border-border p-2 text-fg lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="text-sm text-muted hover:text-fg">
              View website
            </Link>
            <Avatar name="School Admin" size="sm" />
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PortalLayout;

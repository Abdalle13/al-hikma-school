import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSelector } from "react-redux";
import { PortalSidebar } from "./PortalSidebar.jsx";
import { ThemeToggle } from "../ui/ThemeToggle.jsx";
import { Avatar } from "../ui/Avatar.jsx";

// role can be passed in by the route, otherwise it comes from the auth state
// once login is wired. defaults to admin for the phase 1 shell.
export function PortalLayout({ role = "admin", basePath = "/admin" }) {
  const [open, setOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const activeRole = user?.role?.toLowerCase() || role;

  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface lg:block">
        <PortalSidebar role={activeRole} basePath={basePath} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-surface">
            <div className="flex justify-end p-2">
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5 text-muted" />
              </button>
            </div>
            <PortalSidebar
              role={activeRole}
              basePath={basePath}
              onNavigate={() => setOpen(false)}
            />
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
            <Avatar name={user?.name || "School User"} size="sm" />
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

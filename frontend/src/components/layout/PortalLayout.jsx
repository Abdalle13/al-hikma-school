import { Suspense, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Wallet,
  X,
} from "lucide-react";
import { PortalSidebar } from "./PortalSidebar.jsx";
import { ThemeToggle } from "../ui/ThemeToggle.jsx";
import { Avatar } from "../ui/Avatar.jsx";
import { Spinner } from "../ui/Spinner.jsx";
import { PageTransition } from "../ui/PageTransition.jsx";
import { logout } from "../../redux/slices/authSlice.js";
import api from "../../utils/api.js";
import { cn } from "../../utils/formatter.js";
import { roleHome } from "../../utils/roles.js";

function LogoutButton({ className }) {
  const dispatch = useDispatch();
  return (
    <button
      type="button"
      onClick={() => dispatch(logout())}
      aria-label="Log out"
      title="Log out"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-danger/40 hover:text-danger",
        className
      )}
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}

// admin, teacher and student: left sidebar + top bar
function SidebarShell({ user }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface lg:block">
        <PortalSidebar role={user.role.toLowerCase()} basePath={roleHome(user.role)} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-border bg-surface shadow-card-hover">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg"
            >
              <X className="h-5 w-5" />
            </button>
            <PortalSidebar
              role={user.role.toLowerCase()}
              basePath={roleHome(user.role)}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-bg/85 px-4 backdrop-blur-lg sm:px-6">
          <button
            type="button"
            className="rounded-xl border border-border p-2 text-fg lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface py-1 pl-1 pr-2.5">
              <Avatar name={user.name} size="sm" />
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-semibold text-fg">{user.name.split(" ")[0]}</p>
                <p className="text-[11px] capitalize text-muted">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-4 sm:p-6">
          <Suspense fallback={<div className="grid place-items-center py-24"><Spinner /></div>}>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// parent: mobile first, card based, a child switcher and a bottom tab bar.
// attendance, report cards and fees become live tabs once F4/F5/F6 wire them,
// for now they sit next to the dashboard tab marked "soon" like the sidebar.
const parentTabs = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/parent" },
  { label: "Attendance", icon: ClipboardCheck, to: "/parent/attendance" },
  { label: "Grades", icon: GraduationCap, to: "/parent/grades" },
  { label: "Fees", icon: Wallet, to: "/parent/fees" },
  { label: "News", icon: Megaphone, to: "/parent/news" },
];

function ParentShell({ user }) {
  const [children, setChildren] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [unread, setUnread] = useState(0);
  const { pathname } = useLocation();

  useEffect(() => {
    let alive = true;
    api
      .get(`/users/${user._id}/children`)
      .then(({ data }) => {
        if (!alive) return;
        setChildren(data.children);
        if (data.children[0]) setSelectedId(data.children[0]._id);
      })
      .catch(() => alive && setChildren([]));
    return () => {
      alive = false;
    };
  }, [user._id]);

  useEffect(() => {
    // refresh the unread badge on every navigation within the portal
    api.get("/notifications", { params: { limit: 1 } }).then(({ data }) => setUnread(data.unread)).catch(() => {});
  }, [pathname]);

  const selectedChild = children?.find((c) => c._id === selectedId) || null;

  return (
    <div className="min-h-screen bg-bg pb-20">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-heading font-bold text-fg">
            <GraduationCap className="h-5 w-5 text-primary" />
            Parent Portal
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NavLink
              to="/parent/notifications"
              aria-label="Messages"
              className="relative rounded-xl border border-border p-2 text-muted transition-colors hover:text-fg"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </NavLink>
            <Avatar name={user.name} size="sm" />
            <LogoutButton />
          </div>
        </div>

        {children && children.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3">
            {children.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => setSelectedId(c._id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                  c._id === selectedId
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface text-muted hover:text-fg"
                )}
              >
                <Avatar name={c.name} size="sm" />
                {c.name}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-xl p-4 sm:p-6">
        {children === null ? null : children.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted">
            No children are linked to your account yet. Contact the school office to get this set up.
          </div>
        ) : (
          <Suspense fallback={<div className="grid place-items-center py-24"><Spinner /></div>}>
            <PageTransition>
              <Outlet context={{ children, selectedChild }} />
            </PageTransition>
          </Suspense>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-stretch justify-between px-2">
          {parentTabs.map((tab) => {
            const Icon = tab.icon;
            if (!tab.to) {
              return (
                <span
                  key={tab.label}
                  title="Available in a later phase"
                  className="flex flex-1 flex-col items-center gap-1 py-2.5 text-muted opacity-50"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[11px] font-medium">{tab.label}</span>
                </span>
              );
            }
            return (
              <NavLink
                key={tab.label}
                to={tab.to}
                end={tab.to === "/parent"}
                className={({ isActive }) =>
                  cn(
                    "flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors",
                    isActive ? "text-primary" : "text-muted hover:text-fg"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// picks the right shell for the signed in user's role. RoleRoute guarantees
// a user is present by the time this renders.
export function PortalLayout() {
  const user = useSelector((state) => state.auth.user);
  if (!user) return null;

  return user.role === "Parent" ? <ParentShell user={user} /> : <SidebarShell user={user} />;
}

export default PortalLayout;

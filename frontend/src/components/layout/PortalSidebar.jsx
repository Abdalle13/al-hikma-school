import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  Briefcase,
  CalendarRange,
  ClipboardCheck,
  GraduationCap,
  Wallet,
  CalendarClock,
  Megaphone,
  FileText,
  BarChart3,
} from "lucide-react";
import { cn } from "../../utils/formatter.js";

// which modules each role will see once the portal screens are built.
// in phase 1 only the dashboard link is live, the rest are shown as upcoming.
const modulesByRole = {
  admin: [
    { label: "Students", icon: Users },
    { label: "Classes", icon: School },
    { label: "Subjects", icon: BookOpen },
    { label: "Staff", icon: Briefcase },
    { label: "Terms", icon: CalendarRange },
    { label: "Attendance", icon: ClipboardCheck },
    { label: "Exams and report cards", icon: GraduationCap },
    { label: "Fees", icon: Wallet },
    { label: "Timetable", icon: CalendarClock },
    { label: "Announcements", icon: Megaphone },
    { label: "Applications", icon: FileText },
    { label: "Reports", icon: BarChart3 },
  ],
  teacher: [
    { label: "Attendance", icon: ClipboardCheck },
    { label: "Exams and marks", icon: GraduationCap },
    { label: "Timetable", icon: CalendarClock },
    { label: "Announcements", icon: Megaphone },
  ],
  parent: [
    { label: "Attendance", icon: ClipboardCheck },
    { label: "Report cards", icon: GraduationCap },
    { label: "Fees", icon: Wallet },
    { label: "Announcements", icon: Megaphone },
  ],
  student: [
    { label: "Timetable", icon: CalendarClock },
    { label: "Grades", icon: GraduationCap },
    { label: "Attendance", icon: ClipboardCheck },
  ],
};

export function PortalSidebar({ role = "admin", basePath = "/admin", onNavigate }) {
  const modules = modulesByRole[role] || modulesByRole.admin;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5 font-heading font-bold text-fg">
        <GraduationCap className="h-5 w-5 text-primary" />
        School Portal
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <NavLink
          to={basePath}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface-2 hover:text-fg"
            )
          }
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          Dashboard
        </NavLink>

        <p className="px-3 pb-1 pt-4 text-xs font-medium text-muted">Modules</p>
        <ul className="flex flex-col gap-0.5">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <li
                key={m.label}
                className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm text-muted"
                title="Available in a later phase"
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  {m.label}
                </span>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium">soon</span>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default PortalSidebar;

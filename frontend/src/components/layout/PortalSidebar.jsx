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
  Award,
  Wallet,
  CalendarClock,
  Megaphone,
  FileText,
  BarChart3,
} from "lucide-react";
import { cn } from "../../utils/formatter.js";
import { Brand } from "../ui/Brand.jsx";

// which modules each role sees. a "to" means the screen is built and live,
// no "to" means it is still coming in a later phase (shown as "soon").
const modulesByRole = {
  admin: [
    { label: "Users", icon: Users, to: "/admin/users" },
    { label: "Students", icon: GraduationCap, to: "/admin/students" },
    { label: "Classes", icon: School, to: "/admin/classes" },
    { label: "Subjects", icon: BookOpen, to: "/admin/subjects" },
    { label: "Staff", icon: Briefcase, to: "/admin/staff" },
    { label: "Terms", icon: CalendarRange, to: "/admin/terms" },
    { label: "Applications", icon: FileText, to: "/admin/applications" },
    { label: "Attendance", icon: ClipboardCheck, to: "/admin/attendance" },
    { label: "Exams", icon: GraduationCap, to: "/admin/exams" },
    { label: "Report cards", icon: Award, to: "/admin/report-cards" },
    { label: "Fees", icon: Wallet, to: "/admin/fees" },
    { label: "Timetable", icon: CalendarClock, to: "/admin/timetable" },
    { label: "Announcements", icon: Megaphone, to: "/admin/announcements" },
    { label: "Reports", icon: BarChart3, to: "/admin/reports" },
  ],
  teacher: [
    { label: "Attendance", icon: ClipboardCheck, to: "/teacher/attendance" },
    { label: "Exams and marks", icon: GraduationCap, to: "/teacher/exams" },
    { label: "Timetable", icon: CalendarClock, to: "/teacher/timetable" },
    { label: "Announcements", icon: Megaphone, to: "/teacher/announcements" },
  ],
  parent: [
    { label: "Attendance", icon: ClipboardCheck },
    { label: "Report cards", icon: GraduationCap },
    { label: "Fees", icon: Wallet },
    { label: "Announcements", icon: Megaphone },
  ],
  student: [
    { label: "Timetable", icon: CalendarClock, to: "/student/timetable" },
    { label: "Grades", icon: GraduationCap, to: "/student/grades" },
    { label: "Attendance", icon: ClipboardCheck, to: "/student/attendance" },
    { label: "News", icon: Megaphone, to: "/student/news" },
  ],
};

const itemClass = ({ isActive }) =>
  cn(
    "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-white/10 text-white"
      : "text-sidebar-fg hover:bg-white/5 hover:text-white"
  );

function ActiveBar({ isActive }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-active transition-opacity",
        isActive ? "opacity-100" : "opacity-0"
      )}
    />
  );
}

export function PortalSidebar({ role = "admin", basePath = "/admin", onNavigate }) {
  const modules = modulesByRole[role] || modulesByRole.admin;

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Brand to={basePath} onDark />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavLink to={basePath} end onClick={onNavigate} className={itemClass}>
          {({ isActive }) => (
            <>
              <ActiveBar isActive={isActive} />
              <LayoutDashboard className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-active")} />
              Dashboard
            </>
          )}
        </NavLink>

        <p className="px-3 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
          Modules
        </p>
        <ul className="flex flex-col gap-0.5">
          {modules.map((m) => {
            const Icon = m.icon;
            if (!m.to) {
              return (
                <li
                  key={m.label}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-white/35"
                  title="Available in a later phase"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    {m.label}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium">soon</span>
                </li>
              );
            }
            return (
              <NavLink key={m.label} to={m.to} onClick={onNavigate} className={itemClass}>
                {({ isActive }) => (
                  <>
                    <ActiveBar isActive={isActive} />
                    <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-active")} />
                    {m.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default PortalSidebar;

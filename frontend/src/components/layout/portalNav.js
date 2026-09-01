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

// portal sidebar links. nothing is wired to data in phase 1, these are the
// destinations the later phases will fill in.
export const portalNav = [
  { to: "/portal", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/portal/students", label: "Students", icon: Users },
  { to: "/portal/classes", label: "Classes", icon: School },
  { to: "/portal/subjects", label: "Subjects", icon: BookOpen },
  { to: "/portal/staff", label: "Staff", icon: Briefcase },
  { to: "/portal/terms", label: "Terms", icon: CalendarRange },
  { to: "/portal/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/portal/exams", label: "Exams and report cards", icon: GraduationCap },
  { to: "/portal/fees", label: "Fees", icon: Wallet },
  { to: "/portal/timetable", label: "Timetable", icon: CalendarClock },
  { to: "/portal/announcements", label: "Announcements", icon: Megaphone },
  { to: "/portal/applications", label: "Applications", icon: FileText },
  { to: "/portal/reports", label: "Reports", icon: BarChart3 },
];

export default portalNav;

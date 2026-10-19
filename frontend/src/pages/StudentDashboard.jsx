import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  GraduationCap,
  Megaphone,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import api from "../utils/api.js";
import { greeting } from "../utils/greeting.js";
import { formatCurrency, formatDate } from "../utils/formatter.js";

const quick = [
  { to: "/student/timetable", label: "My Timetable", icon: CalendarClock, desc: "Weekly class schedule", tone: "bg-blue-500/10 text-blue-600" },
  { to: "/student/grades", label: "Term Grades", icon: GraduationCap, desc: "Scores & report cards", tone: "bg-purple-500/10 text-purple-600" },
  { to: "/student/attendance", label: "Attendance Record", icon: ClipboardCheck, desc: "Punctuality & logs", tone: "bg-emerald-500/10 text-emerald-600" },
  { to: "/student/fees", label: "Tuition & Fees", icon: Wallet, desc: "Balance & invoices", tone: "bg-amber-500/10 text-amber-600" },
  { to: "/student/news", label: "School News", icon: Megaphone, desc: "Announcements & events", tone: "bg-pink-500/10 text-pink-600" },
];

const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

export default function StudentDashboard() {
  const me = useSelector((s) => s.auth.user);
  const currency = useSelector((s) => s.settings.data.currency) || "USD";
  const [data, setData] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (!me?._id) return;
    let alive = true;

    Promise.all([
      api.get(`/attendance/summary/${me._id}`).then((r) => r.data).catch(() => null),
      api.get(`/report-cards/student/${me._id}`).then((r) => r.data).catch(() => null),
      api.get("/timetable/me").then((r) => r.data).catch(() => null),
      api.get("/invoices", { params: { student: me._id } }).then((r) => r.data).catch(() => null),
      api.get("/announcements", { params: { limit: 3 } }).then((r) => r.data?.announcements || []).catch(() => []),
    ]).then(([att, rc, tt, inv, news]) => {
      if (!alive) return;
      const entries = tt?.timetable?.entries || [];
      const schedToday = entries.filter((e) => e.day === today);

      setData({
        rate: att?.attendanceRate,
        days: att?.totalDays ?? 0,
        present: att?.presentCount ?? 0,
        absent: att?.absentCount ?? 0,
        latest: rc?.reportCards?.[0] || null,
        classesTodayCount: schedToday.length,
        outstanding: inv?.totals?.outstanding ?? null,
      });
      setTodayClasses(schedToday);
      setAnnouncements(news.slice(0, 3));
    });
    return () => {
      alive = false;
    };
  }, [me?._id]);

  const firstName = me?.name ? me.name.split(" ")[0] : "Student";

  return (
    <div className="space-y-6">
      {/* Student Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-surface p-6 shadow-sm sm:p-7">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Avatar name={me?.name || "Student"} size="lg" className="border-2 border-primary/30" />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-heading text-xl font-bold text-fg sm:text-2xl">
                  {greeting()}, {firstName}
                </h1>
                <Badge tone="info" className="text-xs">
                  {me?.schoolClass?.name ? `${me.schoolClass.name} ${me.schoolClass.section || ""}`.trim() : "Student"}
                </Badge>
              </div>
              <p className="text-xs text-muted">
                Admission No: <span className="font-mono font-medium text-fg">{me?.admissionNo || "Pending"}</span> ·
                Today is <span className="font-medium text-fg">{today}</span>
              </p>
            </div>
          </div>

          <Link
            to="/student/timetable"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all"
          >
            <CalendarClock className="h-4 w-4" /> View Timetable
          </Link>
        </div>
      </div>

      {data === null ? (
        <div className="grid place-items-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Term Attendance"
              value={data.rate != null ? `${data.rate}%` : "N/A"}
              icon={ClipboardCheck}
              hint={data.days ? `${data.present} of ${data.days} sessions attended` : "No sessions logged"}
            />
            <StatCard
              label="Latest Average"
              value={data.latest ? `${data.latest.average}%` : "N/A"}
              icon={GraduationCap}
              hint={data.latest ? `Grade ${data.latest.overallGrade} · ${data.latest.term?.name || "Term"}` : "No report card yet"}
            />
            <StatCard
              label={`Classes on ${today}`}
              value={data.classesTodayCount}
              icon={CalendarClock}
              hint={data.classesTodayCount > 0 ? "Scheduled for today" : "No classes today"}
            />
            <StatCard
              label="Fee Account Status"
              value={data.outstanding != null ? formatCurrency(data.outstanding, currency) : "Cleared"}
              icon={Wallet}
              hint={data.outstanding === 0 ? "All fees cleared" : "Balance due"}
            />
          </div>

          {/* Today's Schedule Timeline & Academic Performance */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Today's Classes Schedule (3 Cols) */}
            <div className="lg:col-span-3">
              <Card className="h-full p-5">
                <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-fg">Today's Class Schedule</h3>
                      <p className="text-xs text-muted">{today}'s timetable</p>
                    </div>
                  </div>
                  <Link to="/student/timetable" className="text-xs font-semibold text-primary hover:underline">
                    Full Week →
                  </Link>
                </div>

                {todayClasses.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm font-medium text-fg">No classes scheduled for today.</p>
                    <p className="mt-1 text-xs text-muted">Enjoy your study time or check upcoming assignments!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayClasses.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-border/80 bg-surface-2/40 p-3.5 transition-colors hover:border-primary/40"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary font-mono">
                            P{item.period || idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-sm text-fg">{item.subject?.name || "Subject"}</p>
                            <p className="text-xs text-muted">
                              {item.teacher?.name ? `Teacher: ${item.teacher.name}` : "Subject Teacher"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="rounded-md bg-surface px-2 py-1 text-xs font-mono font-medium text-muted border border-border">
                            {item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : `Period ${item.period || idx + 1}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Academic Report Highlights (2 Cols) */}
            <div className="lg:col-span-2">
              <Card className="h-full p-5">
                <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-500/10 text-purple-600">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-fg">Term Report Card</h3>
                      <p className="text-xs text-muted">{data.latest?.term?.name || "Latest Term"}</p>
                    </div>
                  </div>
                  <Link to="/student/grades" className="text-xs font-semibold text-primary hover:underline">
                    Grades →
                  </Link>
                </div>

                {data.latest ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-xl border border-border bg-surface-2/40 p-3">
                        <p className="text-xs text-muted">Average Score</p>
                        <p className="text-xl font-bold text-primary font-mono">{data.latest.average}%</p>
                      </div>
                      <div className="rounded-xl border border-border bg-surface-2/40 p-3">
                        <p className="text-xs text-muted">Grade / Rank</p>
                        <p className="text-xl font-bold text-fg">
                          {data.latest.overallGrade} {data.latest.position ? `(#${data.latest.position})` : ""}
                        </p>
                      </div>
                    </div>

                    {data.latest.subjects && data.latest.subjects.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted">Subject Scores:</p>
                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                          {data.latest.subjects.map((sub, sIdx) => (
                            <div key={sIdx} className="flex items-center justify-between rounded-lg border border-border/60 bg-surface p-2 text-xs">
                              <span className="font-medium text-fg truncate">{sub.subject?.name || "Subject"}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-primary">{sub.finalMarks}%</span>
                                <Badge tone="info" className="text-[10px] py-0 px-1.5">{sub.grade}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-muted">
                    No report card published for this term yet.
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* School Bulletins for Students */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-3.5">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-pink-500/10 text-pink-600">
                  <Megaphone className="h-3.5 w-3.5" />
                </div>
                <h3 className="font-heading text-sm font-bold text-fg">Class & School Bulletins</h3>
              </div>
              <Link to="/student/news" className="text-xs font-semibold text-primary hover:underline">
                View all announcements →
              </Link>
            </div>

            {announcements.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted">No announcements posted right now.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {announcements.map((a) => (
                  <div key={a._id} className="rounded-xl border border-border/80 bg-surface-2/30 p-3">
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span className="font-semibold text-xs text-fg truncate">{a.title}</span>
                      <span className="text-[10px] text-muted">{formatDate(a.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">{a.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access Grid */}
          <div>
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-muted mb-3">
              Quick Shortcuts
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {quick.map((q) => (
                <Link
                  key={q.label}
                  to={q.to}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${q.tone}`}>
                    <q.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-fg group-hover:text-primary transition-colors">{q.label}</p>
                    <p className="text-xs text-muted truncate">{q.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import { ScrollToTop } from "./components/routing/ScrollToTop.jsx";
import { ProtectedRoute } from "./components/routing/ProtectedRoute.jsx";
import { RoleRoute } from "./components/routing/RoleRoute.jsx";
import { PublicLayout } from "./components/layout/PublicLayout.jsx";
import { PortalLayout } from "./components/layout/PortalLayout.jsx";
import { Spinner } from "./components/ui/Spinner.jsx";
import { fetchPublicSettings } from "./redux/slices/settingsSlice.js";
import { bootstrapAuth } from "./redux/slices/authSlice.js";

// the public site and auth screens load eagerly, they are the first paint
import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AcademicsPage from "./pages/AcademicsPage.jsx";
import AdmissionsPage from "./pages/AdmissionsPage.jsx";
import NewsPage from "./pages/NewsPage.jsx";
import NewsArticlePage from "./pages/NewsArticlePage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// the portal is behind a login, so it is code split away from the public bundle
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage.jsx"));
const AdminStudentsPage = lazy(() => import("./pages/AdminStudentsPage.jsx"));
const AdminClassesPage = lazy(() => import("./pages/AdminClassesPage.jsx"));
const AdminSubjectsPage = lazy(() => import("./pages/AdminSubjectsPage.jsx"));
const AdminStaffPage = lazy(() => import("./pages/AdminStaffPage.jsx"));
const AdminTermsPage = lazy(() => import("./pages/AdminTermsPage.jsx"));
const AdminApplicationsPage = lazy(() => import("./pages/AdminApplicationsPage.jsx"));
const AdminAttendancePage = lazy(() => import("./pages/AdminAttendancePage.jsx"));
const AdminExamsPage = lazy(() => import("./pages/AdminExamsPage.jsx"));
const AdminReportCardsPage = lazy(() => import("./pages/AdminReportCardsPage.jsx"));
const AdminFeesPage = lazy(() => import("./pages/AdminFeesPage.jsx"));
const AdminTimetablePage = lazy(() => import("./pages/AdminTimetablePage.jsx"));
const AdminAnnouncementsPage = lazy(() => import("./pages/AdminAnnouncementsPage.jsx"));
const AdminReportsPage = lazy(() => import("./pages/AdminReportsPage.jsx"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard.jsx"));
const TeacherAttendancePage = lazy(() => import("./pages/TeacherAttendancePage.jsx"));
const TeacherExamsPage = lazy(() => import("./pages/TeacherExamsPage.jsx"));
const TeacherTimetablePage = lazy(() => import("./pages/TeacherTimetablePage.jsx"));
const TeacherAnnouncementsPage = lazy(() => import("./pages/TeacherAnnouncementsPage.jsx"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard.jsx"));
const ParentAttendancePage = lazy(() => import("./pages/ParentAttendancePage.jsx"));
const ParentGradesPage = lazy(() => import("./pages/ParentGradesPage.jsx"));
const ParentFeesPage = lazy(() => import("./pages/ParentFeesPage.jsx"));
const ParentNewsPage = lazy(() => import("./pages/ParentNewsPage.jsx"));
const ParentNotificationsPage = lazy(() => import("./pages/ParentNotificationsPage.jsx"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard.jsx"));
const StudentAttendancePage = lazy(() => import("./pages/StudentAttendancePage.jsx"));
const StudentGradesPage = lazy(() => import("./pages/StudentGradesPage.jsx"));
const StudentTimetablePage = lazy(() => import("./pages/StudentTimetablePage.jsx"));

function FullPageSpinner() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg">
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const initialized = useSelector((s) => s.auth.initialized);

  useEffect(() => {
    dispatch(fetchPublicSettings());
    dispatch(bootstrapAuth());
  }, [dispatch]);

  // block the first paint until we know whether the stored token is still
  // valid, so protected routes never flash and then redirect
  if (!initialized) return <FullPageSpinner />;

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--surface)",
            color: "var(--fg)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            fontSize: "0.875rem",
          },
        }}
      />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/academics" element={<AcademicsPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsArticlePage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route
          element={
            <Suspense fallback={<FullPageSpinner />}>
              <ProtectedRoute />
            </Suspense>
          }
        >
          {/* any signed in role can be sent here after login or on their own */}
          <Route path="/change-password" element={<ChangePasswordPage />} />

          <Route element={<RoleRoute allow={["Admin"]} />}>
            <Route path="/admin" element={<PortalLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="classes" element={<AdminClassesPage />} />
              <Route path="subjects" element={<AdminSubjectsPage />} />
              <Route path="staff" element={<AdminStaffPage />} />
              <Route path="terms" element={<AdminTermsPage />} />
              <Route path="applications" element={<AdminApplicationsPage />} />
              <Route path="attendance" element={<AdminAttendancePage />} />
              <Route path="exams" element={<AdminExamsPage />} />
              <Route path="report-cards" element={<AdminReportCardsPage />} />
              <Route path="fees" element={<AdminFeesPage />} />
              <Route path="timetable" element={<AdminTimetablePage />} />
              <Route path="announcements" element={<AdminAnnouncementsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>
          </Route>
          <Route element={<RoleRoute allow={["Teacher"]} />}>
            <Route path="/teacher" element={<PortalLayout />}>
              <Route index element={<TeacherDashboard />} />
              <Route path="attendance" element={<TeacherAttendancePage />} />
              <Route path="exams" element={<TeacherExamsPage />} />
              <Route path="timetable" element={<TeacherTimetablePage />} />
              <Route path="announcements" element={<TeacherAnnouncementsPage />} />
            </Route>
          </Route>
          <Route element={<RoleRoute allow={["Parent"]} />}>
            <Route path="/parent" element={<PortalLayout />}>
              <Route index element={<ParentDashboard />} />
              <Route path="attendance" element={<ParentAttendancePage />} />
              <Route path="grades" element={<ParentGradesPage />} />
              <Route path="fees" element={<ParentFeesPage />} />
              <Route path="news" element={<ParentNewsPage />} />
              <Route path="notifications" element={<ParentNotificationsPage />} />
            </Route>
          </Route>
          <Route element={<RoleRoute allow={["Student"]} />}>
            <Route path="/student" element={<PortalLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="grades" element={<StudentGradesPage />} />
              <Route path="timetable" element={<StudentTimetablePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

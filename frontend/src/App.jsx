import { useEffect } from "react";
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

import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import AdminStudentsPage from "./pages/AdminStudentsPage.jsx";
import AdminClassesPage from "./pages/AdminClassesPage.jsx";
import AdminSubjectsPage from "./pages/AdminSubjectsPage.jsx";
import AdminStaffPage from "./pages/AdminStaffPage.jsx";
import AdminTermsPage from "./pages/AdminTermsPage.jsx";
import AdminApplicationsPage from "./pages/AdminApplicationsPage.jsx";
import AdminAttendancePage from "./pages/AdminAttendancePage.jsx";
import AdminExamsPage from "./pages/AdminExamsPage.jsx";
import AdminReportCardsPage from "./pages/AdminReportCardsPage.jsx";
import AdminFeesPage from "./pages/AdminFeesPage.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import TeacherAttendancePage from "./pages/TeacherAttendancePage.jsx";
import TeacherExamsPage from "./pages/TeacherExamsPage.jsx";
import ParentDashboard from "./pages/ParentDashboard.jsx";
import ParentAttendancePage from "./pages/ParentAttendancePage.jsx";
import ParentGradesPage from "./pages/ParentGradesPage.jsx";
import ParentFeesPage from "./pages/ParentFeesPage.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import StudentAttendancePage from "./pages/StudentAttendancePage.jsx";
import StudentGradesPage from "./pages/StudentGradesPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

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

        <Route element={<ProtectedRoute />}>
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
            </Route>
          </Route>
          <Route element={<RoleRoute allow={["Teacher"]} />}>
            <Route path="/teacher" element={<PortalLayout />}>
              <Route index element={<TeacherDashboard />} />
              <Route path="attendance" element={<TeacherAttendancePage />} />
              <Route path="exams" element={<TeacherExamsPage />} />
            </Route>
          </Route>
          <Route element={<RoleRoute allow={["Parent"]} />}>
            <Route path="/parent" element={<PortalLayout />}>
              <Route index element={<ParentDashboard />} />
              <Route path="attendance" element={<ParentAttendancePage />} />
              <Route path="grades" element={<ParentGradesPage />} />
              <Route path="fees" element={<ParentFeesPage />} />
            </Route>
          </Route>
          <Route element={<RoleRoute allow={["Student"]} />}>
            <Route path="/student" element={<PortalLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="grades" element={<StudentGradesPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

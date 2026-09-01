import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";

import { ScrollToTop } from "./components/routing/ScrollToTop.jsx";
import { PublicLayout } from "./components/layout/PublicLayout.jsx";
import { PortalLayout } from "./components/layout/PortalLayout.jsx";
import { fetchPublicSettings } from "./redux/slices/settingsSlice.js";

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
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import ParentDashboard from "./pages/ParentDashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPublicSettings());
  }, [dispatch]);

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
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* portal shells. ProtectedRoute and RoleRoute wrap these in frontend phase f2 */}
        <Route path="/admin" element={<PortalLayout role="admin" basePath="/admin" />}>
          <Route index element={<AdminDashboard />} />
        </Route>
        <Route path="/teacher" element={<PortalLayout role="teacher" basePath="/teacher" />}>
          <Route index element={<TeacherDashboard />} />
        </Route>
        <Route path="/parent" element={<PortalLayout role="parent" basePath="/parent" />}>
          <Route index element={<ParentDashboard />} />
        </Route>
        <Route path="/student" element={<PortalLayout role="student" basePath="/student" />}>
          <Route index element={<StudentDashboard />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

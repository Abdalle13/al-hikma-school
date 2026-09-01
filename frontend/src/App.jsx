import { BrowserRouter, Routes, Route } from "react-router-dom";

import { PublicLayout } from "./components/layout/PublicLayout.jsx";
import { PortalLayout } from "./components/layout/PortalLayout.jsx";
import { portalNav } from "./components/layout/portalNav.js";

import { Home } from "./pages/public/Home.jsx";
import { About } from "./pages/public/About.jsx";
import { Academics } from "./pages/public/Academics.jsx";
import { Admissions } from "./pages/public/Admissions.jsx";
import { News } from "./pages/public/News.jsx";
import { Contact } from "./pages/public/Contact.jsx";

import { Login } from "./pages/auth/Login.jsx";
import { Register } from "./pages/auth/Register.jsx";
import { ForgotPassword } from "./pages/auth/ForgotPassword.jsx";
import { ResetPassword } from "./pages/auth/ResetPassword.jsx";

import { Dashboard } from "./pages/portal/Dashboard.jsx";
import { PortalPlaceholder } from "./pages/portal/PortalPlaceholder.jsx";
import { NotFound } from "./pages/NotFound.jsx";

// portal modules other than the dashboard, rendered as placeholders in phase 1
const portalModules = portalNav.filter((item) => item.to !== "/portal");

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="academics" element={<Academics />} />
          <Route path="admissions" element={<Admissions />} />
          <Route path="news" element={<News />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<Dashboard />} />
          {portalModules.map((item) => (
            <Route
              key={item.to}
              path={item.to.replace("/portal/", "")}
              element={<PortalPlaceholder title={item.label} icon={item.icon} />}
            />
          ))}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

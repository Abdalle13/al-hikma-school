import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeft, ClipboardCheck, GraduationCap, Wallet } from "lucide-react";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Brand } from "../components/ui/Brand.jsx";
import { ThemeToggle } from "../components/ui/ThemeToggle.jsx";
import { login } from "../redux/slices/authSlice.js";
import { roleHome } from "../utils/roles.js";

const highlights = [
  { icon: ClipboardCheck, text: "Daily attendance, with a message home on an absence" },
  { icon: GraduationCap, text: "Report cards with grades, division and class position" },
  { icon: Wallet, text: "Term fees, installments and receipts in one place" },
];

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useSelector((s) => s.auth.status);
  const { schoolName } = useSelector((s) => s.settings.data);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!loginId.trim() || !password) {
      setError("Enter your login and password");
      return;
    }
    const result = await dispatch(login({ loginId: loginId.trim(), password }));
    if (login.fulfilled.match(result)) {
      const { user, mustChangePassword } = result.payload;
      toast.success(`Welcome, ${user.name.split(" ")[0]}`);
      if (mustChangePassword) {
        navigate("/change-password", { replace: true });
      } else {
        navigate(location.state?.from?.pathname || roleHome(user.role), { replace: true });
      }
    } else {
      setError(result.payload || "Invalid login or password");
    }
  }

  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-2">
      {/* brand panel, desktop only */}
      <div className="relative hidden overflow-hidden border-r border-border bg-gradient-to-br from-primary-soft via-bg to-bg lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <Brand />
        <div className="relative max-w-sm">
          <h2 className="font-heading text-3xl font-bold leading-tight text-fg">
            One portal for every family and every classroom
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map((h) => (
              <li key={h.text} className="flex items-start gap-3 text-sm text-muted">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-primary shadow-sm">
                  <h.icon className="h-4 w-4" />
                </span>
                <span className="pt-1.5">{h.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-muted">
          &copy; {new Date().getFullYear()} {schoolName}
        </p>
      </div>

      {/* form panel */}
      <div className="flex flex-col">
        <header className="flex items-center justify-between px-4 py-6 sm:px-8 lg:justify-end">
          <Brand className="lg:hidden" />
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg sm:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" /> Back to website
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 pb-16">
          <div className="w-full max-w-sm">
            <h1 className="font-heading text-2xl font-bold text-fg">Portal login</h1>
            <p className="mt-1.5 text-sm text-muted">
              Staff and parents use their email. Students use their admission number.
            </p>

            <form className="mt-7 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
              {error ? (
                <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
                  {error}
                </p>
              ) : null}
              <Input
                label="Email or admission number"
                placeholder="Enter your email or admission number"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                autoComplete="username"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button type="submit" size="lg" disabled={status === "loading"} className="mt-1">
                {status === "loading" ? "Logging in..." : "Log in"}
              </Button>
            </form>

            <p className="mt-6 rounded-xl bg-surface-2 px-4 py-3 text-xs leading-relaxed text-muted">
              Accounts are created by the school, there is no public sign up. If you forgot your
              password, ask the school office to reset it.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

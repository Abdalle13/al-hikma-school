import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Brand } from "../components/ui/Brand.jsx";
import { ThemeToggle } from "../components/ui/ThemeToggle.jsx";
import { login } from "../redux/slices/authSlice.js";
import { roleHome } from "../utils/roles.js";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useSelector((s) => s.auth.status);

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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-soft/40 via-bg to-bg" />
      </div>

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6">
        <Brand />
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

      <main className="flex flex-1 items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card-hover">
            <div className="h-1.5 bg-primary" />
            <div className="p-7 sm:p-9">
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
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-sm text-center text-xs leading-relaxed text-muted">
            Accounts are created by the school, there is no public sign up. If you forgot your password,
            ask the school office to reset it.
          </p>
        </div>
      </main>
    </div>
  );
}

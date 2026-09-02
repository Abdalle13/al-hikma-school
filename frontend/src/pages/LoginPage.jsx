import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
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
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-6">
        <Brand />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-md">
          <h1 className="text-xl font-bold text-fg">Log in</h1>
          <p className="mt-1 text-sm text-muted">
            Staff and parents use their email, students use their admission number.
          </p>

          <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            {error ? (
              <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
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
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="mt-5 text-xs text-muted">
            Accounts are created by the school. There is no public sign up. If you
            forgot your password, ask the school office to reset it.
          </p>
        </Card>
      </main>
    </div>
  );
}

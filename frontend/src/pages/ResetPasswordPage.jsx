import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Brand } from "../components/ui/Brand.jsx";
import { ThemeToggle } from "../components/ui/ThemeToggle.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { setCredentials } from "../redux/slices/authSlice.js";
import { roleHome } from "../utils/roles.js";
import api, { apiError } from "../utils/api.js";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      toast.success("Password updated");
      if (data.token) {
        dispatch(setCredentials({ user: data.user, token: data.token }));
        navigate(roleHome(data.user.role), { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      setError(apiError(err, "The reset link is invalid or has expired"));
    } finally {
      setSubmitting(false);
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
          {!token ? (
            <EmptyState
              title="No reset link"
              description="Open this page from the link in your reset email."
              action={<Button as={Link} to="/forgot-password">Request a new link</Button>}
            />
          ) : (
            <>
              <h1 className="text-xl font-bold text-fg">Set a new password</h1>
              <p className="mt-1 text-sm text-muted">Choose a new password for your account.</p>

              <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
                {error ? (
                  <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {error}
                  </p>
                ) : null}
                <Input
                  label="New password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  placeholder="Repeat it"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save new password"}
                </Button>
              </form>
            </>
          )}

          <p className="mt-5 text-sm text-muted">
            <Link to="/login" className="text-primary">Back to log in</Link>
          </p>
        </Card>
      </main>
    </div>
  );
}

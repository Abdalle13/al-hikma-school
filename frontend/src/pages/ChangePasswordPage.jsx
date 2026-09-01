import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Brand } from "../components/ui/Brand.jsx";
import { ThemeToggle } from "../components/ui/ThemeToggle.jsx";
import { changePassword, logout } from "../redux/slices/authSlice.js";
import { roleHome } from "../utils/roles.js";

// shown when mustChangePassword is set after login, and reachable any time
// after that to change a password voluntarily.
export default function ChangePasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, mustChangePassword } = useSelector((s) => s.auth);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!currentPassword) {
      setError("Enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      setError("The new password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setSubmitting(true);
    const result = await dispatch(changePassword({ currentPassword, newPassword }));
    setSubmitting(false);
    if (changePassword.fulfilled.match(result)) {
      toast.success("Password changed");
      navigate(roleHome(result.payload.user.role), { replace: true });
    } else {
      setError(result.payload || "Could not change your password");
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
          <h1 className="text-xl font-bold text-fg">
            {mustChangePassword ? "Set your own password" : "Change your password"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {mustChangePassword
              ? `Welcome${user?.name ? `, ${user.name.split(" ")[0]}` : ""}. This is a one-time step before you continue.`
              : "Update the password on your account."}
          </p>

          <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit} noValidate>
            {error ? (
              <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            ) : null}
            <Input
              label="Current password"
              type="password"
              placeholder="The password the school gave you"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Input
              label="New password"
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

          <button
            type="button"
            onClick={() => dispatch(logout())}
            className="mt-5 text-sm text-muted hover:text-fg"
          >
            Log out instead
          </button>
        </Card>
      </main>
    </div>
  );
}
